import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { createRequire } from 'module';

// CRITICAL: Polyfill URL immediately when config loads - before ANY modules
const require = createRequire(import.meta.url);

// Ensure globalThis exists
if (typeof globalThis === 'undefined' && typeof global !== 'undefined') {
  global.globalThis = global;
}

// Polyfill URL/URLSearchParams - must be synchronous
const { URL: NodeURL, URLSearchParams: NodeURLSearchParams } = require('url');

// Set on all possible global objects
if (NodeURL) {
  globalThis.URL = NodeURL;
  if (typeof global !== 'undefined') {
    global.URL = NodeURL;
    // Use defineProperty to ensure it's available during module compilation
    Object.defineProperty(global, 'URL', {
      value: NodeURL,
      writable: true,
      configurable: true,
      enumerable: false,
    });
  }
}

if (NodeURLSearchParams) {
  globalThis.URLSearchParams = NodeURLSearchParams;
  if (typeof global !== 'undefined') {
    global.URLSearchParams = NodeURLSearchParams;
    Object.defineProperty(global, 'URLSearchParams', {
      value: NodeURLSearchParams,
      writable: true,
      configurable: true,
      enumerable: false,
    });
  }
}

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'polyfill-url-early',
      enforce: 'pre',
      configResolved() {
        // Ensure polyfill is still set during config resolution
        try {
          const { URL: NodeURL, URLSearchParams: NodeURLSearchParams } = require('url');
          if (NodeURL && !globalThis.URL) {
            globalThis.URL = NodeURL;
            if (typeof global !== 'undefined') global.URL = NodeURL;
          }
          if (NodeURLSearchParams && !globalThis.URLSearchParams) {
            globalThis.URLSearchParams = NodeURLSearchParams;
            if (typeof global !== 'undefined') global.URLSearchParams = NodeURLSearchParams;
          }
        } catch (e) {
          // Ignore
        }
      },
    },
  ],
  resolve: {
    conditions: ['browser'],
    alias: {
      // Try to replace whatwg-url with Node's URL to avoid webidl-conversions
      'whatwg-url': 'node:url',
    },
  },
  ssr: {
    resolve: {
      conditions: ['browser'],
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    deps: {
      inline: ['msw'],
    },
    poolOptions: {
      threads: {
        singleThread: false,
      },
    },
  },
});


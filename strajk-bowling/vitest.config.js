import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { createRequire } from 'module';

// CRITICAL: Polyfill URL immediately when config loads - before ANY modules
const require = createRequire(import.meta.url);

// Ensure globalThis exists
if (typeof globalThis === 'undefined' && typeof global !== 'undefined') {
  global.globalThis = global;
}

// Polyfill URL/URLSearchParams from Node.js - must be synchronous
const { URL: NodeURL, URLSearchParams: NodeURLSearchParams } = require('url');

// Set on all possible global objects to ensure webidl-conversions can find it
if (NodeURL) {
  globalThis.URL = NodeURL;
  if (typeof global !== 'undefined') {
    global.URL = NodeURL;
    // Also set as non-enumerable property
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
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    deps: {
      inline: ['msw'],
    },
    poolOptions: {
      threads: {
        singleThread: true,
      },
    },
  },
  optimizeDeps: {
    include: ['msw'],

  },
});


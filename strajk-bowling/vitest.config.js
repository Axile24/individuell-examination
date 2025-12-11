import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';

// Polyfill URL immediately when this config file loads
// This runs before any modules are processed
const require = createRequire(import.meta.url);

if (typeof globalThis === 'undefined') {
  if (typeof global !== 'undefined') {
    global.globalThis = global;
  }
}

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
  // Will be handled in setup.js
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


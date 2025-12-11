import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { createRequire } from 'module';

// Polyfill URL immediately when config loads
const require = createRequire(import.meta.url);
try {
  const { URL: NodeURL, URLSearchParams: NodeURLSearchParams } = require('url');
  if (NodeURL) {
    globalThis.URL = NodeURL;
    if (typeof global !== 'undefined') {
      global.URL = NodeURL;
    }
  }
  if (NodeURLSearchParams) {
    globalThis.URLSearchParams = NodeURLSearchParams;
    if (typeof global !== 'undefined') {
      global.URLSearchParams = NodeURLSearchParams;
    }
  }
} catch (e) {
  // Ignore
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
  },
});


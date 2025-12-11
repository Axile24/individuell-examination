// Polyfill URL before any imports - this must run first
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Ensure URL is available before any modules load
try {
  const { URL: NodeURL, URLSearchParams: NodeURLSearchParams } = require('url');
  if (NodeURL) {
    globalThis.URL = NodeURL;
    if (typeof global !== 'undefined') {
      global.URL = NodeURL;
      Object.defineProperty(global, 'URL', {
        value: NodeURL,
        writable: true,
        configurable: true,
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
      });
    }
  }
} catch (e) {
  // Ignore
}

import { expect, afterEach, beforeAll, afterAll } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';
import { server } from './mocks/server';

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);

// Start MSW server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

// Reset handlers after each test
afterEach(() => {
  cleanup();
  server.resetHandlers();
});

// Clean up after all tests
afterAll(() => server.close());


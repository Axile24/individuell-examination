// Polyfill URL FIRST before any other imports
// This must happen synchronously before MSW is imported
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Ensure globalThis exists
if (typeof globalThis === 'undefined') {
  if (typeof global !== 'undefined') {
    global.globalThis = global;
  } else if (typeof window !== 'undefined') {
    window.globalThis = window;
  } else if (typeof self !== 'undefined') {
    self.globalThis = self;
  }
}

// Polyfill URL and URLSearchParams from Node.js built-in modules
// This must be done before MSW imports whatwg-url/webidl-conversions
try {
  const { URL: NodeURL, URLSearchParams: NodeURLSearchParams } = require('url');
  
  if (NodeURL) {
    globalThis.URL = NodeURL;
    if (typeof global !== 'undefined') global.URL = NodeURL;
  }
  if (NodeURLSearchParams) {
    globalThis.URLSearchParams = NodeURLSearchParams;
    if (typeof global !== 'undefined') global.URLSearchParams = NodeURLSearchParams;
  }
} catch (e) {
  // Fallback: URL should be available in jsdom
  if (typeof URL !== 'undefined' && !globalThis.URL) {
    globalThis.URL = URL;
    if (typeof global !== 'undefined') global.URL = URL;
  }
  if (typeof URLSearchParams !== 'undefined' && !globalThis.URLSearchParams) {
    globalThis.URLSearchParams = URLSearchParams;
    if (typeof global !== 'undefined') global.URLSearchParams = URLSearchParams;
  }
}

import { expect, afterEach, beforeAll, afterAll } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Import MSW server after polyfill
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


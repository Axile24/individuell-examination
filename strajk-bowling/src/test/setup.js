// Polyfill URL FIRST before any other imports
// This must happen synchronously before MSW is imported
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

try {
  const urlModule = require('url');
  if (urlModule.URL) {
    globalThis.URL = urlModule.URL;
    globalThis.URLSearchParams = urlModule.URLSearchParams;
  }
} catch (e) {
  // URL should be available in jsdom, but ensure it's set
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


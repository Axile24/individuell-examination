// Ensure URL is available before importing MSW
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

if (typeof global !== 'undefined' && !global.URL) {
  try {
    const { URL: NodeURL, URLSearchParams: NodeURLSearchParams } = require('url');
    if (NodeURL) {
      global.URL = NodeURL;
      globalThis.URL = NodeURL;
    }
    if (NodeURLSearchParams) {
      global.URLSearchParams = NodeURLSearchParams;
      globalThis.URLSearchParams = NodeURLSearchParams;
    }
  } catch (e) {
    // Ignore
  }
}

import { setupServer } from 'msw/node';
import { handlers } from './handlers';

// Setup MSW server with handlers
export const server = setupServer(...handlers);


// Polyfill URL for MSW in Node.js environment (needed for CI)
// This file is imported before MSW to ensure URL is available

if (typeof globalThis.URL === 'undefined') {
  // Use dynamic import for ES modules
  const urlModule = await import('node:url');
  globalThis.URL = urlModule.URL;
  globalThis.URLSearchParams = urlModule.URLSearchParams;
}

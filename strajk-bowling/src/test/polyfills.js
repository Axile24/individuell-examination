// Polyfill URL for MSW in Node.js environment (needed for CI)
// This file is imported before MSW to ensure URL is available

// Use createRequire for CommonJS compatibility in CI
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

if (typeof globalThis.URL === 'undefined') {
  try {
    // Try to use Node.js built-in URL
    const urlModule = require('url');
    if (urlModule.URL) {
      globalThis.URL = urlModule.URL;
      globalThis.URLSearchParams = urlModule.URLSearchParams;
    }
  } catch (e) {
    // URL should already be available in jsdom environment
    console.warn('Could not polyfill URL:', e);
  }
}

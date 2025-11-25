const os = require('os');

if (!os.availableParallelism) {
  os.availableParallelism = () => {
    return os.cpus().length;
  };
}

// Polyfill for URL.canParse (added in Node.js v18.17.0)
if (!URL.canParse) {
  URL.canParse = (url, base) => {
    try {
      new URL(url, base);
      return true;
    } catch {
      return false;
    }
  };
}

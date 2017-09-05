Error.stackTraceLimit = 0;
jasmine.DEFAULT_TIMEOUT_INTERVAL = 1000;

// Disable karma's default loader, we'll do it using System.js
__karma__.loaded = function () { };

function isSpecFile(path) {
  return /\.spec\.(.*\.)?js$/.test(path);
}

var allSpecFiles = Object.keys(window.__karma__.files)
  .filter(isSpecFile);

SystemJS.config({
  baseURL: 'base',
  map: {
    'example': 'example',
  },
  packages: {
    example: {
      defaultExtension: 'js'
    },
  },
});

function initTesting () {
  return Promise.all(
    allSpecFiles.map(function (moduleName) {
      return System.import(moduleName);
    })
  )
  .then(__karma__.start, __karma__.error);
}

initTesting();

const assert = require('assert');
const P = require('../dist/promise-x').implementation();

function setExports(exports, Ctr) {
  exports.deferred = function __deferred__() {
    const o = {};
    o.promise = new Ctr(function __Promise__(resolve, reject) {
      o.resolve = resolve;
      o.reject = reject;
    });

    return o;
  };

  exports.resolved = function __resolved__(val) {
    return Ctr.resolve(val);
  };

  exports.rejected = function __rejected__(reason) {
    return Ctr.reject(reason);
  };

  exports.defineGlobalPromise = function __defineGlobalPromise__(globalScope) {
    globalScope.Promise = Ctr;

    globalScope.assert = assert;
  };

  exports.removeGlobalPromise = function __defineGlobalPromise__(globalScope) {
    delete globalScope.Promise;
  };
}

function chooseSource(/* file */) {
  setExports(module.exports, P);

  return module.exports;
}

module.exports = chooseSource;

// call with default of undefined; backwards-compatible with old use of adapter
chooseSource();

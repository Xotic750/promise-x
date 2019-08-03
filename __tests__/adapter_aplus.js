const P = require('../dist/promise-x').implementation();

exports.deferred = function() {
  const inner = {};
  const promise = new P(function(resolve, reject) {
    inner.resolve = resolve;
    inner.reject = reject;
  });

  return {
    promise,
    resolve: inner.resolve,
    reject: inner.reject,
  };
};

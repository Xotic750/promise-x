// tests from promises-es6-tests
import es6Tests from 'promises-es6-tests';
import Bluebird from 'bluebird';
import assert from 'assert';
import {implementation as $I} from '../src/promise-x';

describe('promises/ES6 Tests', function() {
  it('es6', function() {
    expect.assertions(1);
    jest.setTimeout(30000);

    return new Bluebird((done) => {
      es6Tests(
        {
          deferred() {
            const o = {};
            o.promise = new $I(function(resolve, reject) {
              o.resolve = resolve;
              o.reject = reject;
            });

            return o;
          },

          resolved(val) {
            return $I.resolve(val);
          },

          rejected(reason) {
            return $I.reject(reason);
          },

          defineGlobalPromise(globalScope) {
            globalScope.Promise = $I;
            globalScope.assert = assert;
          },

          removeGlobalPromise(globalScope) {
            delete globalScope.Promise;
          },
        },
        function(err) {
          expect(err).toBeNull();
          done();
        },
      );
    });
  });
});

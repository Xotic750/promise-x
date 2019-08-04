// tests from promises-aplus-tests
import aplusTests from 'promises-aplus-tests';
import Bluebird from 'bluebird';
import {implementation as $I} from '../src/promise-x';

describe('promises/A+ Tests', function() {
  it('aplus', function() {
    expect.assertions(1);
    jest.setTimeout(30000);

    return new Bluebird((done) => {
      aplusTests(
        {
          deferred() {
            const inner = {};
            const promise = new $I(function(resolve, reject) {
              inner.resolve = resolve;
              inner.reject = reject;
            });

            return {
              promise,
              resolve: inner.resolve,
              reject: inner.reject,
            };
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

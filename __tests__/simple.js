import Bluebird from 'bluebird';
import $P, {implementation as $I} from '../src/promise-x';

const failIfThrows = function(done) {
  return function(e) {
    done(e || new Error());
  };
};

[$I, $P].forEach(($Promise, testNum) => {
  describe(`promise ${testNum}`, function() {
    it('sanity check: a fulfilled promise calls its fulfillment handler', function() {
      expect.assertions(1);

      return new Bluebird((done) => {
        $Promise
          .resolve(5)
          .then(function(value) {
            expect(value).toBe(5);
          })
          .then(done, failIfThrows(done));
      });
    });

    it('directly resolving the promise with itself', function() {
      expect.assertions(1);

      return new Bluebird((done) => {
        let resolvePromise;
        const promise = new $Promise(function(resolve) {
          resolvePromise = resolve;
        });

        resolvePromise(promise);

        promise
          .then(
            function() {
              expect(false).toBe(true, 'Should not be fulfilled');
            },
            function(err) {
              expect(err instanceof TypeError).toBe(true);
            },
          )
          .then(done, failIfThrows(done));
      });
    });

    it('stealing a resolver and using it to trigger possible reentrancy bug (#83)', function() {
      expect.assertions(1);

      let stolenResolver;
      const StealingPromiseConstructor = function StealingPromiseConstructor(resolver) {
        stolenResolver = resolver;
        resolver(
          function() {},
          function() {},
        );
      };

      const iterable = {};
      const atAtIterator = '@@iterator'; // on firefox, at least.
      iterable[atAtIterator] = function() {
        stolenResolver(null, null);
        throw new Error(0);
      };

      expect(function() {
        $Promise.all.call(StealingPromiseConstructor, iterable);
      }).not.toThrow();
    });

    it('resolve with a thenable calls it once', function() {
      expect.assertions(4);

      return new Bluebird((done) => {
        let resolve;
        const p = new $Promise(function(r) {
          resolve = r;
        });

        let count = 0;
        resolve({
          then() {
            count += 1;
            throw new RangeError('reject the promise');
          },
        });

        /* eslint-disable-next-line jest/valid-expect-in-promise */
        const a = p
          .then(function() {})
          .catch(function(err) {
            expect(count).toBe(1);
            expect(err instanceof RangeError).toBe(true);
          });

        /* eslint-disable-next-line jest/valid-expect-in-promise */
        const b = p
          .then(function() {})
          .catch(function(err) {
            expect(count).toBe(1);
            expect(err instanceof RangeError).toBe(true);
          });

        return $Promise.all([a, b]).then(done, failIfThrows(done));
      });
    });

    it('resolve with a thenable that throws on .then, rejects the promise synchronously', function() {
      expect.assertions(5);

      return new Bluebird((done) => {
        let resolve;
        const p = new $Promise(function(r) {
          resolve = r;
        });

        let count = 0;
        const thenable = Object.defineProperty({}, 'then', {
          get() {
            count += 1;
            throw new RangeError('no then for you');
          },
        });

        resolve(thenable);
        expect(count).toBe(1);

        /* eslint-disable-next-line jest/valid-expect-in-promise */
        const a = p
          .then(function() {})
          .catch(function(err) {
            expect(count).toBe(1);
            expect(err instanceof RangeError).toBe(true);
          });

        /* eslint-disable-next-line jest/valid-expect-in-promise */
        const b = p
          .then(function() {})
          .catch(function(err) {
            expect(count).toBe(1);
            expect(err instanceof RangeError).toBe(true);
          });

        return $Promise.all([a, b]).then(done, failIfThrows(done));
      });
    });
  });
});

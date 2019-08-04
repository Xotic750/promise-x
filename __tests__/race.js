import Bluebird from 'bluebird';
import $P, {implementation as $I} from '../src/promise-x';

const failIfThrows = function(done) {
  return function(e) {
    done(e || new Error());
  };
};

[$I, $P].forEach(($Promise, testNum) => {
  describe(`promise.race ${testNum}`, function() {
    it('should not be enumerable', function() {
      expect.assertions(1);
      expect(Object.getOwnPropertyDescriptor($Promise, 'race')).toHaveProperty('enumerable', false);
    });

    it('should fulfill if all promises are settled and the ordinally-first is fulfilled', function() {
      expect.assertions(1);

      return new Bluebird((done) => {
        const iterable = [$Promise.resolve(1), $Promise.reject(2), $Promise.resolve(3)];

        $Promise
          .race(iterable)
          .then(function(value) {
            expect(value).toBe(1);
          })
          .then(done, failIfThrows(done));
      });
    });

    it('should reject if all promises are settled and the ordinally-first is rejected', function() {
      expect.assertions(1);

      return new Bluebird((done) => {
        const iterable = [$Promise.reject(1), $Promise.reject(2), $Promise.resolve(3)];

        Promise.race(iterable)
          .then(
            function() {
              expect(false).toBe(true, 'should never get here');
            },
            function(reason) {
              expect(reason).toBe(1);
            },
          )
          .then(done, failIfThrows(done));
      });
    });

    const delayPromise = function(value, ms) {
      return new $Promise(function(resolve) {
        setTimeout(function() {
          resolve(value);
        }, ms);
      });
    };

    it('should settle in the same way as the first promise to settle', function() {
      expect.assertions(1);

      return new Bluebird((done) => {
        // ensure that even if timeouts are delayed an all execute together,
        // p2 will settle first.
        const p2 = delayPromise(2, 200);
        const p1 = delayPromise(1, 1000);
        const p3 = delayPromise(3, 500);
        const iterable = [p1, p2, p3];

        $Promise
          .race(iterable)
          .then(function(value) {
            expect(value).toBe(2);
          })
          .then(done, failIfThrows(done));
      });
    });

    // see https://github.com/domenic/promises-unwrapping/issues/75
    it('should never settle when given an empty iterable', function() {
      expect.assertions(1);

      return new Bluebird((done) => {
        const iterable = [];
        let settled = false;

        $Promise.race(iterable).then(
          function() {
            settled = true;
          },
          function() {
            settled = true;
          },
        );

        setTimeout(function() {
          expect(settled).toBe(false);
          done();
        }, 300);
      });
    });

    it('should reject with a TypeError if given a non-iterable', function() {
      expect.assertions(1);

      return new Bluebird((done) => {
        const notIterable = {};

        $Promise
          .race(notIterable)
          .then(
            function() {
              expect(false).toBe(true, 'should never get here');
            },
            function(reason) {
              expect(reason instanceof TypeError).toBe(true);
            },
          )
          .then(done, failIfThrows(done));
      });
    });
  });
});

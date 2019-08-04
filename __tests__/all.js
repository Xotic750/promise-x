import Bluebird from 'bluebird';
import $P, {implementation as $I} from '../src/promise-x';

const failIfThrows = function(done) {
  return function(e) {
    done(e || new Error());
  };
};

[$I, $P].forEach(($Promise, testNum) => {
  describe(`promise.all ${testNum}`, function() {
    it('should not be enumerable', function() {
      expect.assertions(1);
      expect(Object.getOwnPropertyDescriptor($Promise, 'all')).toHaveProperty('enumerable', false);
    });

    it('fulfills if passed an empty array', function() {
      expect.assertions(2);

      return new Bluebird((done) => {
        const iterable = [];

        return $Promise
          .all(iterable)
          .then(function(value) {
            expect(Array.isArray(value)).toBe(true);
            expect(value).toStrictEqual([]);
          })
          .then(done, failIfThrows(done));
      });
    });

    it('fulfills if passed an empty array-like', function() {
      expect.assertions(2);

      return new Bluebird((done) => {
        const f = function() {
          $Promise
            .all(arguments)
            .then(function(value) {
              expect(Array.isArray(value)).toBe(true);
              expect(value).toStrictEqual([]);
            })
            .then(done, failIfThrows(done));
        };

        f();
      });
    });

    it('fulfills if passed an array of mixed fulfilled promises and values', function() {
      expect.assertions(2);

      return new Bluebird((done) => {
        const iterable = [0, $Promise.resolve(1), 2, $Promise.resolve(3)];

        $Promise
          .all(iterable)
          .then(function(value) {
            expect(Array.isArray(value)).toBe(true);
            expect(value).toStrictEqual([0, 1, 2, 3]);
          })
          .then(done, failIfThrows(done));
      });
    });

    it('rejects if any passed promise is rejected', function() {
      expect.assertions(1);

      return new Bluebird((done) => {
        const foreverPending = new $Promise(function() {});
        const error = new Error('Rejected');
        const rejected = $Promise.reject(error);

        const iterable = [foreverPending, rejected];

        $Promise
          .all(iterable)
          .then(
            function() {
              expect(false).toBe(true, 'should never get here');
            },
            function(reason) {
              expect(reason).toBe(error);
            },
          )
          .then(done, failIfThrows(done));
      });
    });

    it('resolves foreign thenables', function() {
      expect.assertions(1);

      return new Bluebird((done) => {
        const normal = $Promise.resolve(1);
        const foreign = {
          then(f) {
            f(2);
          },
        };

        const iterable = [normal, foreign];

        $Promise
          .all(iterable)
          .then(function(value) {
            expect(value).toStrictEqual([1, 2]);
          })
          .then(done, failIfThrows(done));
      });
    });

    it('fulfills when passed an sparse array, giving `undefined` for the omitted values', function() {
      expect.assertions(1);

      return new Bluebird((done) => {
        /* eslint-disable-next-line no-sparse-arrays */
        const iterable = [$Promise.resolve(0), , , $Promise.resolve(1)];

        $Promise
          .all(iterable)
          .then(function(value) {
            expect(value).toStrictEqual([0, undefined, undefined, 1]);
          })
          .then(done, failIfThrows(done));
      });
    });

    it('does not modify the input array', function() {
      expect.assertions(1);

      return new Bluebird((done) => {
        const input = [0, 1];

        $Promise
          .all(input)
          .then(function(value) {
            expect(input).not.toEqual(value);
          })
          .then(done, failIfThrows(done));
      });
    });

    it('should reject with a TypeError if given a non-iterable', function() {
      expect.assertions(1);

      return new Bluebird((done) => {
        const notIterable = {};

        $Promise
          .all(notIterable)
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

    // test cases from
    // https://github.com/domenic/promises-unwrapping/issues/89#issuecomment-33110203
    const tamper = function(p) {
      p.then = function(fulfill, reject) {
        fulfill('tampered');

        return $Promise.prototype.then.call(this, fulfill, reject);
      };

      return p;
    };

    /* eslint-disable-next-line jest/expect-expect */
    it('should be robust against tampering (1)', function() {
      expect.assertions(0);

      return new Bluebird((done) => {
        const g = [tamper($Promise.resolve(0))];
        // Prevent countdownHolder.[[Countdown]] from ever reaching zero
        $Promise.all(g).then(done, failIfThrows(done));
      });
    });

    it('should be robust against tampering (2)', function() {
      expect.assertions(3);

      return new Bluebird((done) => {
        // Promise from Promise.all resolved before arguments
        let fulfillCalled = false;

        const g = [
          $Promise.resolve(0),
          tamper($Promise.resolve(1)),
          $Promise
            .resolve(2)
            .then(function() {
              expect(!fulfillCalled).toBe(true, 'should be resolved before all()');
            })
            .then(function() {
              expect(!fulfillCalled).toBe(true, 'should be resolved before all()');
            })
            .catch(failIfThrows(done)),
        ];

        $Promise
          .all(g)
          .then(function() {
            expect(!fulfillCalled).toBe(true, 'should be resolved last');
            fulfillCalled = true;
          })
          .then(done, failIfThrows(done));
      });
    });

    it('should be robust against tampering (3)', function() {
      expect.assertions(1);

      return new Bluebird((done) => {
        const g = [$Promise.resolve(0), tamper($Promise.resolve(1)), $Promise.reject(2)];

        // Promise from Promise.all resolved despite rejected promise in arguments
        $Promise
          .all(g)
          .then(
            function() {
              throw new Error('should not reach here!');
            },
            function(e) {
              expect(e).toBe(2);
            },
          )
          .then(done, failIfThrows(done));
      });
    });

    it('should be robust against tampering (4)', function() {
      expect.assertions(1);

      return new Bluebird((done) => {
        let hijack = true;
        const actualArguments = [];
        const P = function(resolver) {
          let self;

          if (hijack) {
            hijack = false;
            self = new $Promise(function(resolve, reject) {
              return resolver(function(values) {
                // record arguments & # of times resolve function is called
                actualArguments.push(values.slice());

                return resolve(values);
              }, reject);
            });
          } else {
            self = new $Promise(resolver);
          }

          Object.setPrototypeOf(self, P.prototype);

          return self;
        };

        if (!Object.setPrototypeOf) {
          return done();
        } // skip test if on IE < 11

        Object.setPrototypeOf(P, $Promise);
        P.prototype = Object.create($Promise.prototype, {
          constructor: {value: P},
        });
        P.resolve = function(p) {
          return p;
        };

        const g = [$Promise.resolve(0), tamper($Promise.resolve(1)), $Promise.resolve(2)];

        // Promise.all calls resolver twice
        P.all(g).catch(failIfThrows(done));
        $Promise
          .resolve()
          .then(function() {
            expect(actualArguments).toStrictEqual([[0, 'tampered', 2]]);
          })
          .then(done, failIfThrows(done));
      });
    });
  });
});

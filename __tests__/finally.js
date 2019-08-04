import Bluebird from 'bluebird';
import $P, {implementation} from '../src/promise-x';

const $I = implementation();
const failIfThrows = function(done) {
  return function(e) {
    done(e || new Error());
  };
};

const assertArray = function(value, length, assertType) {
  expect(Array.isArray(value)).toBe(true, 'value is an array');
  const len = value.length;
  expect(len).toBe(length, `length is ${length}`);

  if (typeof assertType === 'function') {
    for (let i = 0; i < value.length; i += 1) {
      assertType(value[i]);
    }
  }
};

const getSubclass = function(P) {
  if (!Object.setPrototypeOf) {
    return null;
  } // skip test if on IE < 11

  const MyPromise = function(executor) {
    const self = new P(executor);
    Object.setPrototypeOf(self, MyPromise.prototype);
    self.thenArgs = [];

    return self;
  };

  Object.setPrototypeOf(MyPromise, P);
  MyPromise.thenArgs = [];
  MyPromise.prototype = Object.create(P.prototype, {
    constructor: {value: MyPromise},
    then: {
      value(...args) {
        MyPromise.thenArgs.push(args);
        this.thenArgs.push(args);

        return this;
      },
    },
  });

  return MyPromise;
};

[$I, $P].forEach(($Promise, testNum) => {
  describe(`finally  ${testNum}`, function() {
    it('as a function', function() {
      expect.assertions(4);
      expect($Promise.prototype.finally).toBeInstanceOf(Function);
      expect($Promise.prototype.finally).toHaveLength(1);
      expect($Promise.prototype.finally.name).toBe('finally');
      expect(Object.getOwnPropertyDescriptor($Promise.prototype, 'finally')).toHaveProperty('enumerable', false);
    });

    it('bad Promise/this value', function() {
      expect.assertions(2);
      expect(() => {
        $Promise.prototype.finally.call(undefined, function() {});
      }).toThrow(TypeError);

      expect(() => {
        $Promise.prototype.finally.call(null, function() {});
      }).toThrow(TypeError);
    });

    it('not provided a function', function() {
      expect.assertions(1);

      return new Bluebird((done) => {
        return Bluebird.all([
          /* eslint-disable-next-line promise/valid-params */
          new $Promise((resolve) => {
            resolve(true);
          }).finally(),

          new $Promise((resolve) => {
            resolve(true);
          }).finally(undefined),

          new $Promise((resolve) => {
            resolve(true);
          }).finally(null),

          new $Promise((resolve) => {
            resolve(true);
          }).finally(1),

          new $Promise((resolve) => {
            resolve(true);
          }).finally(true),

          new $Promise((resolve) => {
            resolve(true);
          }).finally(''),

          new $Promise((resolve) => {
            resolve(true);
          }).finally([]),

          new $Promise((resolve) => {
            resolve(true);
          }).finally({}),
        ]).then((value) => {
          expect(value).toStrictEqual([true, true, true, true, true, true, true, true]);
          done();
        }, failIfThrows(done));
      });
    });

    it('onFinally with function', function() {
      expect.assertions(1);

      return new Bluebird((done) => {
        expect(() => {
          new $Promise((resolve) => {
            resolve();
          }).finally(done);
        }).not.toThrow();
      });
    });

    it('onFinally arguments', function() {
      expect.assertions(9);

      return new Bluebird((done) => {
        return Bluebird.all([
          new $Promise((resolve) => {
            resolve();
          })
            .finally(function() {
              expect(arguments).toHaveLength(0);
            })
            .catch(function() {
              expect(false).toBe(true);
            }),

          new $Promise((resolve) => {
            resolve(true);
          })
            .finally(function() {
              expect(arguments).toHaveLength(0);
            })
            .then(function(val) {
              expect(val).toBe(true);
            }),

          $Promise
            .resolve(42)
            .finally(function() {
              expect(arguments).toHaveLength(0);
            })
            .catch(function() {
              expect(false).toBe(true);
            }),

          $Promise
            .resolve(42)
            .finally(function() {
              expect(arguments).toHaveLength(0);
            })
            .then(function(val) {
              expect(val).toBe(42);
            }),

          $Promise
            .reject(42)
            .finally(function() {
              expect(arguments).toHaveLength(0);
            })
            .catch(function(val) {
              expect(val).toBe(42);
            }),

          $Promise
            .reject(42)
            .finally(function() {
              expect(arguments).toHaveLength(0);
            })
            .then(function() {
              expect(false).toBe(true);
            }),
        ]).then(done, failIfThrows(done));
      });
    });

    it('onFinally fulfillment', function() {
      expect.assertions(6);

      return new Bluebird((done) => {
        $Promise
          .resolve(42)
          /* eslint-disable-next-line promise/no-return-in-finally */
          .finally(function() {
            return $Promise.resolve(Infinity);
          })
          .then(function(x) {
            expect(x).toBe(42, 'resolved promise onFinally resolution does not affect promise resolution value');
            done();
          })
          .catch(failIfThrows(done));

        $Promise
          .resolve(42)
          /* eslint-disable-next-line promise/no-return-in-finally */
          .finally(function() {
            return $Promise.reject(-Infinity);
          })
          .catch(function(x) {
            expect(x).toBe(
              -Infinity,
              'resolved promise onFinally returning a rejected Promise rejects with the new rejection value',
            );

            done();
          })
          .catch(failIfThrows(done));

        $Promise
          .resolve(42)
          .finally(function() {
            throw Function;
          })
          .catch(function(e) {
            expect(e).toBeInstanceOf(Function, 'resolved promise onFinally throwing rejects with the thrown rejection value');
          })
          .catch(failIfThrows(done));

        $Promise
          .reject(42)
          /* eslint-disable-next-line promise/no-return-in-finally */
          .finally(function() {
            return $Promise.resolve(Infinity);
          })
          .catch(function(e) {
            expect(e).toBe(42, 'rejected promise onFinally resolution does not affect promise rejection value');
          })
          .catch(failIfThrows(done));

        $Promise
          .reject(42)
          /* eslint-disable-next-line promise/no-return-in-finally */
          .finally(function() {
            return $Promise.reject(-Infinity);
          })
          .catch(function(x) {
            expect(x).toBe(
              -Infinity,
              'rejected promise onFinally returning a rejected Promise rejects with the new rejection value',
            );
          })
          .catch(failIfThrows(done));

        $Promise
          .reject(42)
          .finally(function() {
            throw Function;
          })
          .catch(function(e) {
            expect(e).toBeInstanceOf(Function, 'rejected promise onFinally throwing rejects with the thrown rejection value');
          })
          .catch(failIfThrows(done));
      });
    });

    it('preserves correct subclass when chained', function() {
      expect.assertions(2);
      const Subclass = getSubclass($Promise);
      /* eslint-disable-next-line promise/valid-params */
      const promise = Subclass.resolve().finally();
      expect(promise instanceof Subclass).toBe(true, 'promise is instanceof Subclass');
      expect(promise.constructor).toBe(Subclass, 'promise.constructor is Subclass');
    });

    it('preserves correct subclass when rejected', function() {
      expect.assertions(2);
      const Subclass = getSubclass($Promise);

      return new Bluebird((done) => {
        const promise = Subclass.resolve().finally(function() {
          throw new Error('OMG');
        });

        expect(promise instanceof Subclass).toBe(true, 'promise is instanceof Subclass');
        expect(promise.constructor).toBe(Subclass, 'promise.constructor is Subclass');

        promise.catch(failIfThrows(done)); // avoid unhandled rejection warning
        done();
      });
    });

    it('preserves correct subclass when someone returns a thenable', function() {
      expect.assertions(2);
      const Subclass = getSubclass($Promise);

      return new Bluebird((done) => {
        /* eslint-disable-next-line promise/no-return-in-finally */
        const promise = Subclass.resolve().finally(function() {
          return $Promise.resolve(1);
        });

        expect(promise instanceof Subclass).toBe(true, 'promise is instanceof Subclass');
        expect(promise.constructor).toBe(Subclass, 'promise.constructor is Subclass');
        done();
      });
    });

    /* eslint-disable-next-line jest/expect-expect */
    it('invokes the subclass’ then', function() {
      expect.assertions(4);
      const Subclass = getSubclass($Promise);

      return new Bluebird((done) => {
        Subclass.thenArgs.length = 0;

        const original = Subclass.resolve();
        original.finally(function() {});

        assertArray(original.thenArgs, 1);
        assertArray(Subclass.thenArgs, 1);

        done();
      });
    });

    it('passes the original onFinally when not a function', function() {
      expect.assertions(8);
      const Subclass = getSubclass($Promise);

      return new Bluebird((done) => {
        Subclass.thenArgs.length = 0;

        const original = Subclass.resolve();
        const sentinel = {};
        original.finally(sentinel);

        assertArray(original.thenArgs, 1, Array.isArray);
        assertArray(Subclass.thenArgs, 1, Array.isArray);
        assertArray(original.thenArgs[0], 2, function(x) {
          expect(x).toBe(sentinel);
        });

        done();
      });
    });

    // it('when onFinally is a function, passes thenFinally/catchFinally', function() {
    //   expect.assertions(1);
    //
    //   return new $Promise((done) => {
    //     Subclass.thenArgs.length = 0;
    //
    //     const sentinel = {};
    //     const original = Subclass.resolve(sentinel);
    //     const onFinallyArgs = [];
    //     const onFinally = function onFinallyHandler() {
    //       onFinallyArgs.push(Array.prototype.slice.call(arguments));
    //
    //       return 42;
    //     };
    //
    //     const promise = original.finally(onFinally);
    //
    //     assertArray(original.thenArgs, 1, Array.isArray);
    //     assertArray(Subclass.thenArgs, 1, Array.isArray);
    //
    //     const thenArgs = original.thenArgs[0];
    //     assertArray(thenArgs, 2, function(x) {
    //       expect(typeof x).toBe('function');
    //     });
    //
    //     expect(onFinallyArgs).toStrictEqual([], 'onFinally not yet called');
    //
    //     it('thenFinally works as expected', function() {
    //       expect.assertions(1);
    //       onFinallyArgs.length = 0;
    //
    //       assertArray(Subclass.thenArgs, 1);
    //
    //       promise
    //         .then(function(x) {
    //           expect(x).toBe(sentinel, 'original resolution value provided');
    //           expect(onFinallyArgs).toStrictEqual([[]], 'onFinally called once with no args');
    //           assertArray(Subclass.thenArgs, 9);
    //         })
    //         .catch(failIfThrows(done));
    //     });
    //
    //     it('catchFinally works as expected', function() {
    //       expect.assertions(1);
    //
    //       return new $Promise((done1) => {
    //         onFinallyArgs.length = 0;
    //
    //         const thrown = {
    //           toString() {
    //             return 'thrown object';
    //           },
    //         };
    //         const onFinallyRejects = function onFinallyThrower() {
    //           /* eslint-disable-next-line prefer-spread */
    //           onFinally.apply(undefined, arguments);
    //           throw thrown;
    //         };
    //
    //         Subclass.thenArgs.length = 0;
    //
    //         const rejectedPromise = original.finally(onFinallyRejects);
    //
    //         assertArray(Subclass.thenArgs, 1);
    //
    //         const rejectedPromiseCatch = function(e) {
    //           expect(e).toBe(thrown, 'original rejection value provided');
    //           expect(onFinallyArgs).toStrictEqual([[]], 'onFinally called once with no args');
    //
    //           assertArray(Subclass.thenArgs, 3);
    //           // 1) initial call with thenFinally/catchFinally
    //           // 2) rejectedPromise.then call
    //           // 3) rejectedPromise.then -> onFinally call
    //           assertArray(Subclass.thenArgs[0], 2, function(x) {
    //             expect(typeof x).toBe('function');
    //           });
    //
    //           assertArray(Subclass.thenArgs[1], 2);
    //           expect(Subclass.thenArgs[1]).toStrictEqual([done1, rejectedPromiseCatch], 'rejectedPromise.then call args');
    //
    //           assertArray(Subclass.thenArgs[2], 2);
    //           expect(Subclass.thenArgs[2][0]).toBeUndefined('final .then call gets no onFulfill');
    //           expect(typeof Subclass.thenArgs[2][1]).toBe('function', 'final .then call gets an onReject');
    //         };
    //
    //         rejectedPromise.then(done1, rejectedPromiseCatch).catch(failIfThrows(done1));
    //       });
    //     });
    //   });
    // });
  });
});

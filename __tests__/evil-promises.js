import Bluebird from 'bluebird';
import $P, {implementation} from '../src/promise-x';

const $I = implementation();
const failIfThrows = function(done) {
  return function(e) {
    done(e || new Error());
  };
};

[$I, $P].forEach(($Promise, testNum) => {
  describe(`evil promises should not be able to break invariants ${testNum}`, function() {
    it('resolving to a promise that calls onFulfilled twice', function() {
      expect.assertions(2);

      return new Bluebird((done) => {
        // note that we have to create a trivial subclass, as otherwise the
        // Promise.resolve(evilPromise) is just the identity function.
        // (And in fact, most native Promise implementations use a private
        // [[PromiseConstructor]] field in `Promise.resolve` which can't be
        // easily patched in an ES5 engine, so instead of
        // `Promise.resolve(evilPromise)` we'll use
        // `new Promise(function(r){r(evilPromise);})` below.)
        const EvilPromise = function(executor) {
          const self = new $Promise(executor);
          Object.setPrototypeOf(self, EvilPromise.prototype);

          return self;
        };

        if (!Object.setPrototypeOf) {
          return done();
        } // skip test if on IE < 11

        Object.setPrototypeOf(EvilPromise, $Promise);
        EvilPromise.prototype = Object.create($Promise.prototype, {
          constructor: {value: EvilPromise},
        });

        const evilPromise = EvilPromise.resolve();
        evilPromise.then = function(f) {
          f(1);
          f(2);
        };

        let calledAlready = false;
        new $Promise(function(r) {
          r(evilPromise);
        })
          .then(function(value) {
            expect(calledAlready).toBe(false);
            calledAlready = true;
            expect(value).toBe(1);
          })
          .then(done, failIfThrows(done));
      });
    });
  });
});

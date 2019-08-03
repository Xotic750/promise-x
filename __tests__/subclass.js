import Bluebird from 'bluebird';
import $P, {implementation} from '../src/promise-x';

const $I = implementation();

[$I, $P].forEach(($Promise, testNum) => {
  describe(`support user subclassing of Promise  ${testNum}`, function() {
    it('should work if you do it right', function() {
      expect.assertions(8);

      return new Bluebird((done) => {
        // This is the "correct" es6-compatible way.
        // (Thanks, @domenic and @zloirock!)
        const MyPromise = function(executor) {
          const self = new $Promise(executor);
          Object.setPrototypeOf(self, MyPromise.prototype);
          self.mine = 'yeah';

          return self;
        };

        if (!Object.setPrototypeOf) {
          return done();
        } // skip test if on IE < 11

        Object.setPrototypeOf(MyPromise, $Promise);
        MyPromise.prototype = Object.create($Promise.prototype, {
          constructor: {value: MyPromise},
        });

        // let's try it!
        let p1 = MyPromise.resolve(5);
        expect(p1.mine).toBe('yeah');
        p1 = p1.then(function(x) {
          expect(x).toBe(5);
        });

        expect(p1.mine).toBe('yeah');

        let p2 = new MyPromise(function(r) {
          r(6);
        });
        expect(p2.mine).toBe('yeah');
        p2 = p2.then(function(x) {
          expect(x).toBe(6);
        });
        expect(p2.mine).toBe('yeah');

        const p3 = MyPromise.all([p1, p2]);
        expect(p3.mine).toBe('yeah');

        const p4 = MyPromise.reject(5);
        expect(p4.mine).toBe('yeah');
        p4.then(done, done);
      });
    });

    it("should throw if you don't inherit at all", function() {
      expect.assertions(1);
      const MyPromise = function() {};

      expect(function() {
        $Promise.all.call(MyPromise, []);
      }).toThrow(TypeError);
    });
  });
});

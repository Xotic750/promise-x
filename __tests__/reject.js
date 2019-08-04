import Bluebird from 'bluebird';
import $P, {implementation as $I} from '../src/promise-x';

[$I, $P].forEach(($Promise, testNum) => {
  const failIfThrows = function(done) {
    return function(e) {
      done(e || new Error());
    };
  };

  describe(`promise.reject ${testNum}`, function() {
    it('should not be enumerable', function() {
      expect.assertions(1);
      expect(Object.getOwnPropertyDescriptor($Promise, 'reject')).toHaveProperty('enumerable', false);
    });

    it('should return a rejected promise', function() {
      expect.assertions(1);

      return new Bluebird((done) => {
        const value = {};

        return $Promise.reject(value).then(failIfThrows(done), function(result) {
          expect(result).toStrictEqual(value);
          done();
        });
      });
    });

    it('throws when receiver is a primitive', function() {
      expect.assertions(6);

      const promise = $Promise.reject();
      expect(function() {
        $Promise.reject.call(undefined, promise);
      }).toThrow(TypeError);
      expect(function() {
        $Promise.reject.call(null, promise);
      }).toThrow(TypeError);
      expect(function() {
        $Promise.reject.call('', promise);
      }).toThrow(TypeError);
      expect(function() {
        $Promise.reject.call(42, promise);
      }).toThrow(TypeError);
      expect(function() {
        $Promise.reject.call(false, promise);
      }).toThrow(TypeError);
      expect(function() {
        $Promise.reject.call(true, promise);
      }).toThrow(TypeError);
      promise.then(null, function() {}); // silence unhandled rejection errors in Chrome
    });
  });
});

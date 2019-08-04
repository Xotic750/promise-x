import Bluebird from 'bluebird';
import $P, {implementation as $I} from '../src/promise-x';

[$I, $P].forEach(($Promise, testNum) => {
  const failIfThrows = function(done) {
    return function(e) {
      done(e || new Error());
    };
  };

  describe(`promise.resolve ${testNum}`, function() {
    it('should not be enumerable', function() {
      expect.assertions(1);
      expect(Object.getOwnPropertyDescriptor($Promise, 'resolve')).toHaveProperty('enumerable', false);
    });

    it('should return a resolved promise', function() {
      expect.assertions(1);

      return new Bluebird((done) => {
        const value = {};

        return $Promise.resolve(value).then(function(result) {
          expect(result).toStrictEqual(value);
          done();
        }, failIfThrows(done));
      });
    });

    it('throws when receiver is a primitive', function() {
      expect.assertions(6);
      const promise = $Promise.resolve();
      expect(function() {
        $Promise.resolve.call(undefined, promise);
      }).toThrow(TypeError);
      expect(function() {
        $Promise.resolve.call(null, promise);
      }).toThrow(TypeError);
      expect(function() {
        $Promise.resolve.call('', promise);
      }).toThrow(TypeError);
      expect(function() {
        $Promise.resolve.call(42, promise);
      }).toThrow(TypeError);
      expect(function() {
        $Promise.resolve.call(false, promise);
      }).toThrow(TypeError);
      expect(function() {
        $Promise.resolve.call(true, promise);
      }).toThrow(TypeError);
    });
  });
});

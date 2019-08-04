function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

import isPrimitive from 'is-primitive';
import isFunction from 'is-function-x';
import isNil from 'is-nil-x';
import toObject from 'to-object-x';
import isArguments from 'is-arguments';
import bind from 'bind-x';
import hasSymbolSupport from 'has-symbol-support-x';
import toBoolean from 'to-boolean-x';
import create from 'object-create-x';
import toLength from 'to-length-x';
import defineProperties, { defineProperty } from 'object-define-properties-x';
import forEach from 'array-for-each-x';
import objectKeys from 'object-keys-x';
import assertIsFunction from 'assert-is-function-x';
import assertIsObject from 'assert-is-object-x';
import attempt from 'attempt-x';
/* eslint-disable-next-line lodash/prefer-noop */

var noop = function noop() {};

var identity = function identity(x) {
  return x;
};

var thrower = function thrower(e) {
  throw e;
};

var NativePromise = typeof Promise === 'undefined' || isPrimitive(Promise) ? null : Promise;
var hasWindow = typeof window !== 'undefined' && isPrimitive(window) === false;
/* eslint-disable-next-line compat/compat */

var postMessage = hasWindow && isFunction(window.postMessage) ? window.postMessage : null;
var addEventListener = hasWindow && isFunction(window.addEventListener) ? window.addEventListener : null;
var nativeSetTimeout = typeof setTimeout === 'undefined' || isPrimitive(setTimeout) ? null : setTimeout;
var nativeSetImmediate = typeof setImmediate !== 'undefined' && isFunction(setImmediate) ? setImmediate : null;
var _ref = [],
    push = _ref.push,
    shift = _ref.shift;
/* eslint-disable-next-line no-void */

var UNDEFINED = void 0;
var PRIVATE_PROMISE = '[[promise]]';
var $apply = bind(Function.call, Function.apply);
var $call = bind(Function.call, Function.call);
/* eslint-disable-next-line compat/compat */

var symbolSpecies = hasSymbolSupport && Symbol.species || '@@species';
var ES6_SHIM_ITERATOR = '_es6-shim iterator_';
var AT_AT_ITERATOR = '@@iterator';
/* eslint-disable-next-line compat/compat */

var hasRealSymbolIterator = hasSymbolSupport && _typeof(Symbol.iterator) === 'symbol';
/* eslint-disable-next-line compat/compat */

var hasFakeSymbolIterator = (typeof Symbol === "undefined" ? "undefined" : _typeof(Symbol)) === 'object' && typeof Symbol.iterator === 'string';
var hasSymbolIterator = hasRealSymbolIterator || hasFakeSymbolIterator;

var getOtherSymbolIterator = function getOtherSymbolIterator(iterable) {
  if (iterable[ES6_SHIM_ITERATOR]) {
    return ES6_SHIM_ITERATOR;
  }

  if (iterable[AT_AT_ITERATOR]) {
    return AT_AT_ITERATOR;
  }

  return null;
};

var getSymIt = function getSymIt() {
  if (hasSymbolIterator) {
    /* eslint-disable-next-line compat/compat */
    return Symbol.iterator;
  }

  var result = getOtherSymbolIterator([]);

  if (typeof result === 'string' && isFunction([][result])) {
    return result;
  }

  return AT_AT_ITERATOR;
};

var call = function call(F, V) {
  /* eslint-disable-next-line prefer-rest-params */
  return $apply(assertIsFunction(F), V, arguments.length > 2 ? arguments[2] : []);
};

var getMethod = function getMethod(o, p) {
  var func = toObject(o)[p];
  return isNil(func) ? UNDEFINED : assertIsFunction(func);
};

var $iterator$ = getSymIt();

var iteratorComplete = function iteratorComplete(iterResult) {
  return toBoolean(iterResult.done);
};

var assertIteratorsReturn = function assertIteratorsReturn(innerResult) {
  if (isPrimitive(innerResult)) {
    throw new TypeError("Iterator's return method returned a non-object.");
  }

  return innerResult;
};

var iteratorClose = function iteratorClose(iterator, completionIsThrow) {
  var returnMethod = getMethod(iterator, 'return');

  if (typeof returnMethod === 'undefined' || completionIsThrow) {
    return;
  }

  var attemptResult = attempt(call, returnMethod, iterator);
  var innerException = attemptResult.threw ? attemptResult.value : UNDEFINED;

  if (innerException) {
    throw innerException;
  }

  assertIteratorsReturn(attemptResult.threw === false ? attemptResult.value : UNDEFINED);
};

var iteratorNext = function iteratorNext(it) {
  /* eslint-disable-next-line prefer-rest-params */
  var result = arguments.length > 1 ? it.next(arguments[1]) : it.next();

  if (isPrimitive(result)) {
    throw new TypeError('bad iterator');
  }

  return result;
};

var iteratorStep = function iteratorStep(it) {
  var result = iteratorNext(it);
  return iteratorComplete(result) ? false : result;
}; // Given an argument x, it will return an IteratorResult object,
// with value set to x and done to false.
// Given no arguments, it will return an iterator completion object.


var iteratorResult = function iteratorResult(x) {
  return {
    value: x,
    done: arguments.length === 0
  };
}; // Our ArrayIterator is private; see
// https://github.com/paulmillr/es6-shim/issues/252


var ArrayIterator = function ArrayIterator(array, kind) {
  this.i = 0;
  this.array = array;
  this.kind = kind;
};

var getArrayIteratorValue = function getArrayIteratorValue(args) {
  var _args = _slicedToArray(args, 3),
      kind = _args[0],
      array = _args[1],
      i = _args[2];

  if (kind === 'key') {
    return i;
  }

  if (kind === 'value') {
    return array[i];
  }

  if (kind === 'entry') {
    return [i, array[i]];
  }

  return UNDEFINED;
};

var assertIsArrayIterator = function assertIsArrayIterator(context) {
  if (toBoolean(context instanceof ArrayIterator) === false) {
    throw new TypeError('Not an ArrayIterator');
  }

  return context;
};

defineProperty(ArrayIterator.prototype, 'next', {
  configurable: true,
  value: function next() {
    var _assertIsArrayIterato = assertIsArrayIterator(this),
        array = _assertIsArrayIterato.array;

    if (typeof array !== 'undefined') {
      var len = toLength(array.length);

      if (this.i < len) {
        var retval = getArrayIteratorValue([this.kind, array, this.i]);
        this.i += 1;
        return iteratorResult(retval);
      }
    }

    this.array = UNDEFINED;
    return iteratorResult();
  }
}); // addIterator(ArrayIterator.prototype);

var getIterator = function getIterator(o) {
  if (isArguments(o)) {
    // special case support for `arguments`
    return new ArrayIterator(o, 'value');
  }

  var itFn = getMethod(o, $iterator$);

  if (isFunction(itFn) === false) {
    // Better diagnostics if itFn is null or undefined
    throw new TypeError('value is not an iterable');
  }

  var it = call(itFn, o);

  if (isPrimitive(it)) {
    throw new TypeError('bad iterator');
  }

  return it;
};

var assertRequiresNew = function assertRequiresNew(o, defaultNewTarget) {
  if (isPrimitive(o)) {
    throw new TypeError("Constructor requires \"new\": ".concat(defaultNewTarget.name));
  }
};

var emulateES6construct = function emulateES6construct(args) {
  var _args2 = _slicedToArray(args, 4),
      o = _args2[0],
      defaultNewTarget = _args2[1],
      defaultProto = _args2[2],
      slots = _args2[3]; // This is an es5 approximation to es6 construct semantics.  in es6,
  // 'new Foo' invokes Foo.[[Construct]] which (for almost all objects)
  // just sets the internal variable NewTarget (in es6 syntax `new.target`)
  // to Foo and then returns Foo().
  // Many ES6 object then have constructors of the form:
  // 1. If NewTarget is undefined, throw a TypeError exception
  // 2. Let xxx by OrdinaryCreateFromConstructor(NewTarget, yyy, zzz)
  // So we're going to emulate those first two steps.


  assertRequiresNew(o, defaultNewTarget);
  var proto = isPrimitive(defaultNewTarget.prototype) ? defaultProto : defaultNewTarget.prototype;
  var obj = create(proto);
  forEach(objectKeys(slots), function iteratee(key) {
    defineProperty(obj, key, {
      configurable: true,
      value: slots[key],
      writable: true
    });
  });
  return obj;
};

var assertBadConstructor = function assertBadConstructor(C) {
  if (isPrimitive(C)) {
    throw new TypeError('Bad constructor');
  }

  return C;
};

var assertBadSpecies = function assertBadSpecies(S) {
  if (isFunction(S) === false) {
    throw new TypeError('Bad @@species');
  }

  return S;
};

var speciesConstructor = function speciesConstructor(O, defaultConstructor) {
  var C = O.constructor;

  if (typeof C === 'undefined') {
    return defaultConstructor;
  }

  var S = assertBadConstructor(C)[symbolSpecies];

  if (isNil(S)) {
    return defaultConstructor;
  }

  return assertBadSpecies(S);
};

var isPromise = function isPromise(promise) {
  if (isPrimitive(promise)) {
    return false;
  }

  return typeof promise[PRIVATE_PROMISE] !== 'undefined';
};

var createSetZeroTimeout = function createSetZeroTimeout(timeouts, messageName) {
  return function setZeroTimeout(fn) {
    push.call(timeouts, fn);
    postMessage(messageName, '*');
  };
};

var MESSAGE_NAME = 'zero-timeout-message';

var makeZeroTimeoutFn = function makeZeroTimeoutFn() {
  // from http://dbaron.org/log/20100309-faster-timeouts
  var timeouts = [];

  var handleMessage = function handleMessage(event) {
    if (event.source === window && event.data === MESSAGE_NAME) {
      event.stopPropagation();

      if (timeouts.length === 0) {
        return;
      }

      shift.call(timeouts)();
    }
  };

  addEventListener('message', handleMessage, true);
  return createSetZeroTimeout(timeouts, MESSAGE_NAME);
}; // find an appropriate setImmediate-alike


var makeZeroTimeout = postMessage ? makeZeroTimeoutFn : UNDEFINED;

var makePromiseAsap = function makePromiseAsap() {
  // An efficient task-scheduler based on a pre-existing Promise
  // implementation, which we can use even if we override the
  // global Promise below (in order to workaround bugs)
  // https://github.com/Raynos/observ-hash/issues/2#issuecomment-35857671
  var pr = NativePromise && NativePromise.resolve && NativePromise.resolve();

  if (pr) {
    return function then(task) {
      return pr.then(task);
    };
  }

  return UNDEFINED;
};

var nextTick = (typeof process === "undefined" ? "undefined" : _typeof(process)) === 'object' && isFunction(process.nextTick) ? process.nextTick : null;

var getMakeZeroTimeout = function getMakeZeroTimeout() {
  if (makeZeroTimeout) {
    return makeZeroTimeout();
  } // fallback


  return function enqueue(task) {
    nativeSetTimeout(task, 0);
  };
};

var getEnqueue = function getEnqueue() {
  if (nativeSetImmediate) {
    return nativeSetImmediate;
  }

  if (nextTick) {
    return nextTick;
  }

  return makePromiseAsap() || getMakeZeroTimeout();
};

var assertBadPromiseCtr = function assertBadPromiseCtr(C) {
  if (isFunction(C) === false) {
    throw new TypeError('Bad promise constructor');
  }

  return C;
};

var assertBadPromiseImplementation = function assertBadPromiseImplementation(capability) {
  if (capability.resolve !== UNDEFINED || capability.reject !== UNDEFINED) {
    throw new TypeError('Bad Promise implementation!');
  }

  return capability;
};

var assertBadPromiseCtr2 = function assertBadPromiseCtr2(capability) {
  if (isFunction(capability.resolve) === false || isFunction(capability.reject) === false) {
    throw new TypeError('Bad promise constructor');
  }

  return capability;
}; // Promises
// Simplest possible implementation; use a 3rd-party library if you
// want the best possible speed and/or long stack traces.


export var implementation = function implementation() {
  // some environments don't have nativeSetTimeout - no way to shim here.
  if (nativeSetTimeout === null) {
    return UNDEFINED;
  } // "PromiseCapability" in the spec is what most promise implementations call a "deferred".


  var PromiseCapability = function PromiseCapability(C) {
    assertBadPromiseCtr(C);
    var capability = this;

    var resolver = function resolver(resolve, reject) {
      assertBadPromiseImplementation(capability);
      capability.resolve = resolve;
      capability.reject = reject;
    }; // Initialize fields to inform optimizers about the object shape.


    capability.resolve = UNDEFINED;
    capability.reject = UNDEFINED;
    capability.promise = new C(resolver);
    assertBadPromiseCtr2(capability);
  };

  var enqueue = getEnqueue(); // Constants for Promise implementation

  var PROMISE_PENDING = 0;
  var PROMISE_FULFILLED = 1;
  var PROMISE_REJECTED = 2; // We store fulfill/reject handlers and capabilities in a single array.

  var PROMISE_FULFILL_OFFSET = 0;
  var PROMISE_REJECT_OFFSET = 1;
  var PROMISE_CAPABILITY_OFFSET = 2; // This is used in an optimization for chaining promises via then.

  var PROMISE_FAKE_CAPABILITY = {};

  var promiseReactionJob = function promiseReactionJob(args) {
    var _args3 = _slicedToArray(args, 3),
        handler = _args3[0],
        promiseCapability = _args3[1],
        argument = _args3[2];

    if (promiseCapability === PROMISE_FAKE_CAPABILITY) {
      // Fast case, when we don't actually need to chain through to a (real) promiseCapability.
      return handler(argument);
    }

    var attemptResult = attempt(handler, argument);
    var f = attemptResult.threw ? promiseCapability.reject : promiseCapability.resolve;
    return f(attemptResult.value);
  };

  var enqueuePromiseReactionJob = function enqueuePromiseReactionJob(args) {
    var _args4 = _slicedToArray(args, 3),
        handler = _args4[0],
        capability = _args4[1],
        argument = _args4[2];

    enqueue(function enqueuee() {
      promiseReactionJob([handler, capability, argument]);
    });
  };

  var undefinePromise = function undefinePromise(promise, idx) {
    promise[idx + PROMISE_FULFILL_OFFSET] = UNDEFINED;
    promise[idx + PROMISE_REJECT_OFFSET] = UNDEFINED;
    promise[idx + PROMISE_CAPABILITY_OFFSET] = UNDEFINED;
  };

  var enqueueAndDefineFulfill = function enqueueAndDefineFulfill(args) {
    var _args5 = _slicedToArray(args, 4),
        length = _args5[0],
        privatePromise = _args5[1],
        value = _args5[2],
        promise = _args5[3];

    for (var i = 1, idx = 0; i < length; i += 1, idx += 3) {
      enqueuePromiseReactionJob([privatePromise[idx + PROMISE_FULFILL_OFFSET], privatePromise[idx + PROMISE_CAPABILITY_OFFSET], value]);
      undefinePromise(promise, idx);
    }
  };

  var enqueueAndDefineReject = function enqueueAndDefineReject(args) {
    var _args6 = _slicedToArray(args, 4),
        length = _args6[0],
        privatePromise = _args6[1],
        reason = _args6[2],
        promise = _args6[3];

    for (var i = 1, idx = 0; i < length; i += 1, idx += 3) {
      enqueuePromiseReactionJob([privatePromise[idx + PROMISE_REJECT_OFFSET], privatePromise[idx + PROMISE_CAPABILITY_OFFSET], reason]);
      undefinePromise(promise, idx);
    }
  };

  var undefineProps = function undefineProps(privatePromise) {
    privatePromise.fulfillReactionHandler0 = UNDEFINED;
    privatePromise.rejectReactions0 = UNDEFINED;
    privatePromise.reactionCapability0 = UNDEFINED;
  };

  var defineResultAndState = function defineResultAndState(args) {
    var _args7 = _slicedToArray(args, 3),
        privatePromise = _args7[0],
        value = _args7[1],
        state = _args7[2];

    privatePromise.result = value;
    privatePromise.state = state;
    privatePromise.reactionLength = 0;
  };

  var fulfillPromise = function fulfillPromise(promise, value) {
    var privatePromise = promise[PRIVATE_PROMISE];
    var length = privatePromise.reactionLength;

    if (length > 0) {
      enqueuePromiseReactionJob([privatePromise.fulfillReactionHandler0, privatePromise.reactionCapability0, value]);
      undefineProps(privatePromise);

      if (length > 1) {
        enqueueAndDefineFulfill([length, privatePromise, value, promise]);
      }
    }

    defineResultAndState([privatePromise, value, PROMISE_FULFILLED]);
  };

  var rejectPromise = function rejectPromise(promise, reason) {
    var privatePromise = promise[PRIVATE_PROMISE];
    var length = privatePromise.reactionLength;

    if (length > 0) {
      enqueuePromiseReactionJob([privatePromise.rejectReactionHandler0, privatePromise.reactionCapability0, reason]);
      undefineProps(privatePromise);

      if (length > 1) {
        enqueueAndDefineReject([length, privatePromise, reason, promise]);
      }
    }

    defineResultAndState([privatePromise, reason, PROMISE_REJECTED]);
  };

  var promiseResolveThenableJob;

  var createResolvingFunctions = function createResolvingFunctions(promise) {
    var alreadyResolved = false;

    var resolve = function resolve(resolution) {
      if (alreadyResolved) {
        return UNDEFINED;
      }

      alreadyResolved = true;

      if (resolution === promise) {
        return rejectPromise(promise, new TypeError('Self resolution'));
      }

      if (isPrimitive(resolution)) {
        return fulfillPromise(promise, resolution);
      }

      var attemptResult = attempt(function attemptee() {
        return resolution.then;
      });

      if (attemptResult.threw) {
        return rejectPromise(promise, attemptResult.value);
      }

      var then = attemptResult.value;

      if (isFunction(then) === false) {
        return fulfillPromise(promise, resolution);
      }

      enqueue(function enqueuee() {
        promiseResolveThenableJob([promise, resolution, then]);
      });
      return UNDEFINED;
    };

    var reject = function reject(reason) {
      if (alreadyResolved) {
        return UNDEFINED;
      }

      alreadyResolved = true;
      return rejectPromise(promise, reason);
    };

    return {
      resolve: resolve,
      reject: reject
    };
  };

  var Promise$prototype$then;

  var optimizedThen = function optimizedThen(args) {
    var _args8 = _slicedToArray(args, 4),
        then = _args8[0],
        thenable = _args8[1],
        resolve = _args8[2],
        reject = _args8[3]; // Optimization: since we discard the result, we can pass our
    // own then implementation a special hint to let it know it
    // doesn't have to create it.  (The PROMISE_FAKE_CAPABILITY
    // object is local to this implementation and unforgeable outside.)


    if (then === Promise$prototype$then) {
      $call(then, thenable, resolve, reject, PROMISE_FAKE_CAPABILITY);
    } else {
      $call(then, thenable, resolve, reject);
    }
  };

  promiseResolveThenableJob = function $promiseResolveThenableJob(args) {
    var _args9 = _slicedToArray(args, 3),
        promise = _args9[0],
        thenable = _args9[1],
        then = _args9[2];

    var _createResolvingFunct = createResolvingFunctions(promise),
        resolve = _createResolvingFunct.resolve,
        reject = _createResolvingFunct.reject;

    var attemptResults = attempt(optimizedThen, [then, thenable, resolve, reject]);

    if (attemptResults.threw) {
      reject(attemptResults.value);
    }
  };

  var assertPromiseRequiresNew = function assertPromiseRequiresNew(context, Ctr) {
    if (toBoolean(context instanceof Ctr) === false) {
      throw new TypeError('Constructor Promise requires "new"');
    }

    return context;
  };

  var assertBadConstruction = function assertBadConstruction(context) {
    if (context && context[PRIVATE_PROMISE]) {
      throw new TypeError('Bad construction');
    }

    return context;
  }; // see https://bugs.ecmascript.org/show_bug.cgi?id=2482


  var assertValidResolver = function assertValidResolver(resolver) {
    if (isFunction(resolver) === false) {
      throw new TypeError('not a valid resolver');
    }

    return resolver;
  };

  var getSlotsObject = function getSlotsObject() {
    return _defineProperty({}, PRIVATE_PROMISE, {
      result: UNDEFINED,
      state: PROMISE_PENDING,
      // The first member of the "reactions" array is inlined here,
      // since most promises only have one reaction.
      // We've also exploded the 'reaction' object to inline the
      // "handler" and "capability" fields, since both fulfill and
      // reject reactions share the same capability.
      reactionLength: 0,
      fulfillReactionHandler0: UNDEFINED,
      rejectReactionHandler0: UNDEFINED,
      reactionCapability0: UNDEFINED
    });
  };

  var Promise$prototype;

  var $Promise = function Promise(resolver) {
    assertPromiseRequiresNew(this, $Promise);
    assertBadConstruction(this);
    assertValidResolver(resolver);
    var promise = emulateES6construct([this, $Promise, Promise$prototype, getSlotsObject()]);
    var resolvingFunctions = createResolvingFunctions(promise);
    var reject = resolvingFunctions.reject;
    var attemptResult = attempt(function attemptee() {
      resolver(resolvingFunctions.resolve, reject);
    });

    if (attemptResult.threw) {
      reject(attemptResult.value);
    }

    return promise;
  };

  Promise$prototype = $Promise.prototype;

  var promiseAllResolver = function promiseAllResolver(args) {
    var _args10 = _slicedToArray(args, 4),
        index = _args10[0],
        values = _args10[1],
        capability = _args10[2],
        remaining = _args10[3];

    var alreadyCalled = false;
    return function allResolver(x) {
      if (alreadyCalled) {
        return;
      }

      alreadyCalled = true;
      values[index] = x;
      remaining.count -= 1;

      if (remaining.count === 0) {
        capability.resolve(values); // call w/ this===undefined
      }
    };
  };

  var performPromiseAll = function performPromiseAll(iteratorRecord, C, resultCapability) {
    var it = iteratorRecord.iterator;
    var values = [];
    var remaining = {
      count: 1
    };
    var next;
    var nextValue;
    var index = 0;

    while (true) {
      try {
        next = iteratorStep(it);

        if (next === false) {
          iteratorRecord.done = true;
          break;
        }

        nextValue = next.value;
      } catch (e) {
        iteratorRecord.done = true;
        throw e;
      }

      values[index] = UNDEFINED;
      var nextPromise = C.resolve(nextValue);
      var resolveElement = promiseAllResolver([index, values, resultCapability, remaining]);
      remaining.count += 1;
      optimizedThen([nextPromise.then, nextPromise, resolveElement, resultCapability.reject]);
      index += 1;
    }

    remaining.count -= 1;

    if (remaining.count === 0) {
      resultCapability.resolve(values); // call w/ this===undefined
    }

    return resultCapability.promise;
  };

  var assertPromiseIsObject = function assertPromiseIsObject(C) {
    if (isPrimitive(C)) {
      throw new TypeError('Promise is not object');
    }

    return C;
  };

  var assertBadConstructor3 = function assertBadConstructor3(C) {
    if (isPrimitive(C)) {
      throw new TypeError('Bad promise constructor');
    }

    return C;
  };

  var assertIsPromise = function assertIsPromise(promise) {
    if (isPromise(promise) === false) {
      throw new TypeError('not a promise');
    }

    return promise;
  };

  var performPromiseRace = function performPromiseRace(iteratorRecord, C, resultCapability) {
    var it = iteratorRecord.iterator;
    var next;
    var nextValue;
    var nextPromise;

    while (true) {
      try {
        next = iteratorStep(it);

        if (next === false) {
          // NOTE: If iterable has no items, resulting promise will never
          // resolve; see:
          // https://github.com/domenic/promises-unwrapping/issues/75
          // https://bugs.ecmascript.org/show_bug.cgi?id=2515
          iteratorRecord.done = true;
          break;
        }

        nextValue = next.value;
      } catch (e) {
        iteratorRecord.done = true;
        throw e;
      }

      nextPromise = C.resolve(nextValue);
      optimizedThen([nextPromise.then, nextPromise, resultCapability.resolve, resultCapability.reject]);
    }

    return resultCapability.promise;
  };

  defineProperties($Promise, _defineProperty({
    all: {
      configurable: true,
      value: function all(iterable) {
        var C = assertPromiseIsObject(this);
        var capability = new PromiseCapability(C);
        var iterator;
        var iteratorRecord;

        try {
          iterator = getIterator(iterable);
          iteratorRecord = {
            iterator: iterator,
            done: false
          };
          return performPromiseAll(iteratorRecord, C, capability);
        } catch (e) {
          var exception = e;

          if (iteratorRecord && toBoolean(iteratorRecord.done) === false) {
            var attemptResult = attempt(iteratorClose, iterator, true);

            if (attemptResult.threw) {
              exception = attemptResult.value;
            }
          }

          capability.reject(exception);
          return capability.promise;
        }
      },
      writable: true
    },
    race: {
      configurable: true,
      value: function race(iterable) {
        var C = assertPromiseIsObject(this);
        var capability = new PromiseCapability(C);
        var iterator;
        var iteratorRecord;

        try {
          iterator = getIterator(iterable);
          iteratorRecord = {
            iterator: iterator,
            done: false
          };
          return performPromiseRace(iteratorRecord, C, capability);
        } catch (e) {
          var exception = e;

          if (iteratorRecord && !iteratorRecord.done) {
            var attemptResult = attempt(iteratorClose, iterator, true);

            if (attemptResult.threw) {
              exception = attemptResult.value;
            }
          }

          capability.reject(exception);
          return capability.promise;
        }
      },
      writable: true
    },
    reject: {
      configurable: true,
      value: function reject(reason) {
        var C = this;

        if (isPrimitive(C)) {
          throw new TypeError('Bad promise constructor');
        }

        var capability = new PromiseCapability(C);
        capability.reject(reason); // call with this===undefined

        return capability.promise;
      },
      writable: true
    },
    resolve: {
      configurable: true,
      value: function resolve(v) {
        // See https://esdiscuss.org/topic/fixing-promise-resolve for spec
        var C = assertBadConstructor3(this);

        if (isPromise(v) && v.constructor === C) {
          return v;
        }

        var capability = new PromiseCapability(C);
        capability.resolve(v); // call with this===undefined

        return capability.promise;
      },
      writable: true
    }
  }, symbolSpecies, {
    get: function get() {
      return this;
    }
  }));

  var promiseResolve = function PromiseResolve(C, value) {
    if (isPromise(value) && value.constructor === C) {
      return value;
    }

    var promiseCapability = new PromiseCapability(C);
    promiseCapability.resolve(value);
    return promiseCapability.promise;
  };

  var createThenFinally = function CreateThenFinally(C, onFinally) {
    /* eslint-disable-next-line func-names */
    return function (value) {
      var result = onFinally();
      /* eslint-disable-next-line func-names */

      return promiseResolve(C, result).then(function () {
        return value;
      });
    };
  };

  var createCatchFinally = function CreateCatchFinally(C, onFinally) {
    /* eslint-disable-next-line func-names */
    return function (reason) {
      var result = onFinally();
      /* eslint-disable-next-line func-names */

      return promiseResolve(C, result).then(function () {
        throw reason;
      });
    };
  };

  defineProperties(Promise$prototype, {
    catch: {
      configurable: true,
      value: function $catch(onRejected) {
        return this.then(null, onRejected);
      },
      writable: true
    },
    finally: {
      configurable: true,
      value: function $finally(onFinally) {
        var promise = assertIsObject(this);
        var C = assertIsFunction(speciesConstructor(promise, $Promise));
        var isCallable = isFunction(onFinally);
        var thenFinally = isCallable ? createThenFinally(C, onFinally) : onFinally;
        var catchFinally = isCallable ? createCatchFinally(C, onFinally) : onFinally;
        return promise.then(thenFinally, catchFinally);
      },
      writable: true
    },
    then: {
      configurable: true,
      value: function then(onFulfilled, onRejected) {
        var promise = assertIsPromise(this);
        var C = speciesConstructor(promise, $Promise);
        /* eslint-disable-next-line prefer-rest-params */

        var returnValueIsIgnored = arguments.length > 2 && arguments[2] === PROMISE_FAKE_CAPABILITY;
        var resultCapability = returnValueIsIgnored && C === $Promise ? PROMISE_FAKE_CAPABILITY : new PromiseCapability(C); // PerformPromiseThen(promise, onFulfilled, onRejected, resultCapability)
        // Note that we've split the 'reaction' object into its two
        // components, "capabilities" and "handler"
        // "capabilities" is always equal to `resultCapability`

        var fulfillReactionHandler = isFunction(onFulfilled) ? onFulfilled : identity;
        var rejectReactionHandler = isFunction(onRejected) ? onRejected : thrower;
        var privatePromise = promise[PRIVATE_PROMISE];

        if (privatePromise.state === PROMISE_PENDING) {
          if (privatePromise.reactionLength === 0) {
            privatePromise.fulfillReactionHandler0 = fulfillReactionHandler;
            privatePromise.rejectReactionHandler0 = rejectReactionHandler;
            privatePromise.reactionCapability0 = resultCapability;
          } else {
            var idx = 3 * (privatePromise.reactionLength - 1);
            privatePromise[idx + PROMISE_FULFILL_OFFSET] = fulfillReactionHandler;
            privatePromise[idx + PROMISE_REJECT_OFFSET] = rejectReactionHandler;
            privatePromise[idx + PROMISE_CAPABILITY_OFFSET] = resultCapability;
          }

          privatePromise.reactionLength += 1;
        } else if (privatePromise.state === PROMISE_FULFILLED) {
          enqueuePromiseReactionJob([fulfillReactionHandler, resultCapability, privatePromise.result]);
        } else if (privatePromise.state === PROMISE_REJECTED) {
          enqueuePromiseReactionJob([rejectReactionHandler, resultCapability, privatePromise.result]);
        } else {
          throw new TypeError('unexpected Promise state');
        }

        return resultCapability.promise;
      },
      writable: true
    }
  });

  if (Object.getOwnPropertyDescriptor) {
    {
      var descriptor = Object.getOwnPropertyDescriptor(Promise$prototype.finally, 'name');

      if (descriptor && descriptor.configurable) {
        Object.defineProperty(Promise$prototype.finally, 'name', {
          configurable: true,
          value: 'finally'
        });
      }
    }
    {
      var _descriptor = Object.getOwnPropertyDescriptor(Promise$prototype.catch, 'name');

      if (_descriptor && _descriptor.configurable) {
        Object.defineProperty(Promise$prototype.catch, 'name', {
          configurable: true,
          value: 'catch'
        });
      }
    }
  } // This helps the optimizer by ensuring that methods which take capabilities aren't polymorphic.


  PROMISE_FAKE_CAPABILITY = new PromiseCapability($Promise);
  Promise$prototype$then = Promise$prototype.then;
  return $Promise;
};

var throwsError = function throwsError(func) {
  return attempt(func).threw;
};

var valueOrFalseIfThrows = function valueOrFalseIfThrows(func) {
  var res = attempt(func);
  return res.threw ? false : res.value;
};

var supportsSubclassing = function supportsSubclassing(C, f) {
  /* eslint-disable-next-line compat/compat */
  if (isFunction(Object.setPrototypeOf) === false) {
    return false;
    /* skip test on IE < 11 */
  }

  return valueOrFalseIfThrows(function throwee() {
    var Sub = function Subclass(arg) {
      var o = new C(arg);
      /* eslint-disable-next-line compat/compat */

      Object.setPrototypeOf(o, Subclass.prototype);
      return o;
    };
    /* eslint-disable-next-line compat/compat */


    Object.setPrototypeOf(Sub, C);
    Sub.prototype = create(C.prototype, {
      constructor: {
        value: Sub
      }
    });
    return f(Sub);
  });
}; // In Chrome 33 (and thereabouts) Promise is defined, but the
// implementation is buggy in a number of ways.  Let's check subclassing
// support to see if we have a buggy implementation.


var testSupportsSubclassing = function testSupportsSubclassing() {
  return supportsSubclassing(NativePromise, function executee(S) {
    return S.resolve(42).then(function thenee() {
      return UNDEFINED;
    }) instanceof S;
  });
};

var testIgnoresNonFunctionThenCallbacks = function testIgnoresNonFunctionThenCallbacks() {
  return throwsError(function throwee() {
    return NativePromise.reject(42).then(null, 5).then(null, noop);
  }) === false;
};

var testRequiresObjectContext = function testRequiresObjectContext() {
  return throwsError(function throwee() {
    return NativePromise.call(3, noop);
  });
}; // Promise.resolve() was errata'ed late in the ES6 process.
// See: https://bugzilla.mozilla.org/show_bug.cgi?id=1170742
//      https://code.google.com/p/v8/issues/detail?id=4161
// It serves as a proxy for a number of other bugs in early Promise
// implementations.


var testPromiseResolve = function testPromiseResolve() {
  var p = NativePromise.resolve(5);
  p.constructor = {};
  var p2 = NativePromise.resolve(p);
  var res = attempt(function attemptee() {
    /* eslint-disable-next-line promise/catch-or-return */
    p2.then(null, noop).then(null, noop); // avoid "uncaught rejection" warnings in console
  }); // v8 native Promises break here https://code.google.com/p/chromium/issues/detail?id=575314

  if (res.threw) {
    return false;
  } // This *should* be true!


  return p !== p2;
};

var arePropertyDescriptorsSupported = function arePropertyDescriptorsSupported() {
  // if Object.defineProperty exists but throws, it's IE 8
  return throwsError(function throwee() {
    /* eslint-disable-next-line lodash/prefer-noop */
    return defineProperty({}, 'x', {
      get: function get() {}
    });
  }) === false;
}; // Chrome 46 (probably older too) does not retrieve a thenable's .then synchronously


var testThenSynchronicity = function testThenSynchronicity() {
  if (arePropertyDescriptorsSupported() === false) {
    return false;
  }

  var count = 0;
  var thenable = defineProperty({}, 'then', {
    get: function get() {
      count += 1;
    }
  });
  NativePromise.resolve(thenable);
  return count === 1;
};

var BadResolverPromise = function BadResolverPromise(executor) {
  var p = new NativePromise(executor);
  /* eslint-disable-next-line func-names,lodash/prefer-noop */

  executor(3, function () {});
  this.then = p.then;
  this.constructor = BadResolverPromise;
};

BadResolverPromise.prototype = NativePromise.prototype;
BadResolverPromise.all = NativePromise.all; // Chrome Canary 49 (probably older too) has some implementation bugs

var testBadResolverPromise = function testBadResolverPromise() {
  return valueOrFalseIfThrows(function throwee() {
    return toBoolean(BadResolverPromise.all([1, 2]));
  }) === false;
};

var testWorkingFinally = function testWorkingFinally() {
  return attempt(function attemptee() {
    /* eslint-disable-next-line promise/catch-or-return,promise/valid-params */
    new NativePromise(noop).finally();
  }).threw === false;
};

var isWorking = toBoolean(NativePromise) && testSupportsSubclassing() && testIgnoresNonFunctionThenCallbacks() && testRequiresObjectContext() && testPromiseResolve() && testThenSynchronicity() && testBadResolverPromise() && testWorkingFinally();
export default isWorking ? NativePromise : implementation();

//# sourceMappingURL=promise-x.esm.js.map
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
import defineProperties, {defineProperty} from 'object-define-properties-x';
import forEach from 'array-for-each-x';
import objectKeys from 'object-keys-x';
import assertIsFunction from 'assert-is-function-x';
import assertIsObject from 'assert-is-object-x';
import attempt from 'attempt-x';

/* eslint-disable-next-line lodash/prefer-noop */
const noop = function noop() {};

const identity = function identity(x) {
  return x;
};

const thrower = function thrower(e) {
  throw e;
};

const NativePromise = typeof Promise === 'undefined' || isPrimitive(Promise) ? null : Promise;
const hasWindow = typeof window !== 'undefined' && isPrimitive(window) === false;
/* eslint-disable-next-line compat/compat */
const postMessage = hasWindow && isFunction(window.postMessage) ? window.postMessage : null;
const addEventListener = hasWindow && isFunction(window.addEventListener) ? window.addEventListener : null;
const nativeSetTimeout = typeof setTimeout === 'undefined' || isPrimitive(setTimeout) ? null : setTimeout;
const nativeSetImmediate = typeof setImmediate !== 'undefined' && isFunction(setImmediate) ? setImmediate : null;
const {push, shift} = [];
/* eslint-disable-next-line no-void */
const UNDEFINED = void 0;
const PRIVATE_PROMISE = '[[promise]]';

const $apply = bind(Function.call, Function.apply);
const $call = bind(Function.call, Function.call);

/* eslint-disable-next-line compat/compat */
const symbolSpecies = (hasSymbolSupport && Symbol.species) || '@@species';
const ES6_SHIM_ITERATOR = '_es6-shim iterator_';
const AT_AT_ITERATOR = '@@iterator';
/* eslint-disable-next-line compat/compat */
const hasRealSymbolIterator = hasSymbolSupport && typeof Symbol.iterator === 'symbol';
/* eslint-disable-next-line compat/compat */
const hasFakeSymbolIterator = typeof Symbol === 'object' && typeof Symbol.iterator === 'string';
const hasSymbolIterator = hasRealSymbolIterator || hasFakeSymbolIterator;

const getOtherSymbolIterator = function getOtherSymbolIterator(iterable) {
  if (iterable[ES6_SHIM_ITERATOR]) {
    return ES6_SHIM_ITERATOR;
  }

  if (iterable[AT_AT_ITERATOR]) {
    return AT_AT_ITERATOR;
  }

  return null;
};

const getSymIt = function getSymIt() {
  if (hasSymbolIterator) {
    /* eslint-disable-next-line compat/compat */
    return Symbol.iterator;
  }

  const result = getOtherSymbolIterator([]);

  if (typeof result === 'string' && isFunction([][result])) {
    return result;
  }

  return AT_AT_ITERATOR;
};

const call = function call(F, V) {
  /* eslint-disable-next-line prefer-rest-params */
  return $apply(assertIsFunction(F), V, arguments.length > 2 ? arguments[2] : []);
};

const getMethod = function getMethod(o, p) {
  const func = toObject(o)[p];

  return isNil(func) ? UNDEFINED : assertIsFunction(func);
};

const $iterator$ = getSymIt();

const iteratorComplete = function iteratorComplete(iterResult) {
  return toBoolean(iterResult.done);
};

const assertIteratorsReturn = function assertIteratorsReturn(innerResult) {
  if (isPrimitive(innerResult)) {
    throw new TypeError("Iterator's return method returned a non-object.");
  }

  return innerResult;
};

const iteratorClose = function iteratorClose(iterator, completionIsThrow) {
  const returnMethod = getMethod(iterator, 'return');

  if (typeof returnMethod === 'undefined' || completionIsThrow) {
    return;
  }

  const attemptResult = attempt(call, returnMethod, iterator);
  const innerException = attemptResult.threw ? attemptResult.value : UNDEFINED;

  if (innerException) {
    throw innerException;
  }

  assertIteratorsReturn(attemptResult.threw === false ? attemptResult.value : UNDEFINED);
};

const iteratorNext = function iteratorNext(it) {
  /* eslint-disable-next-line prefer-rest-params */
  const result = arguments.length > 1 ? it.next(arguments[1]) : it.next();

  if (isPrimitive(result)) {
    throw new TypeError('bad iterator');
  }

  return result;
};

const iteratorStep = function iteratorStep(it) {
  const result = iteratorNext(it);

  return iteratorComplete(result) ? false : result;
};

// Given an argument x, it will return an IteratorResult object,
// with value set to x and done to false.
// Given no arguments, it will return an iterator completion object.
const iteratorResult = function iteratorResult(x) {
  return {value: x, done: arguments.length === 0};
};

// Our ArrayIterator is private; see
// https://github.com/paulmillr/es6-shim/issues/252
const ArrayIterator = function ArrayIterator(array, kind) {
  this.i = 0;
  this.array = array;
  this.kind = kind;
};

const getArrayIteratorValue = function getArrayIteratorValue(args) {
  const [kind, array, i] = args;

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

const assertIsArrayIterator = function assertIsArrayIterator(context) {
  if (toBoolean(context instanceof ArrayIterator) === false) {
    throw new TypeError('Not an ArrayIterator');
  }

  return context;
};

defineProperty(ArrayIterator.prototype, 'next', {
  configurable: true,
  value: function next() {
    const {array} = assertIsArrayIterator(this);

    if (typeof array !== 'undefined') {
      const len = toLength(array.length);

      if (this.i < len) {
        const retval = getArrayIteratorValue([this.kind, array, this.i]);

        this.i += 1;

        return iteratorResult(retval);
      }
    }

    this.array = UNDEFINED;

    return iteratorResult();
  },
});

// addIterator(ArrayIterator.prototype);

const getIterator = function getIterator(o) {
  if (isArguments(o)) {
    // special case support for `arguments`
    return new ArrayIterator(o, 'value');
  }

  const itFn = getMethod(o, $iterator$);

  if (isFunction(itFn) === false) {
    // Better diagnostics if itFn is null or undefined
    throw new TypeError('value is not an iterable');
  }

  const it = call(itFn, o);

  if (isPrimitive(it)) {
    throw new TypeError('bad iterator');
  }

  return it;
};

const assertRequiresNew = function assertRequiresNew(o, defaultNewTarget) {
  if (isPrimitive(o)) {
    throw new TypeError(`Constructor requires "new": ${defaultNewTarget.name}`);
  }
};

const emulateES6construct = function emulateES6construct(args) {
  const [o, defaultNewTarget, defaultProto, slots] = args;
  // This is an es5 approximation to es6 construct semantics.  in es6,
  // 'new Foo' invokes Foo.[[Construct]] which (for almost all objects)
  // just sets the internal variable NewTarget (in es6 syntax `new.target`)
  // to Foo and then returns Foo().

  // Many ES6 object then have constructors of the form:
  // 1. If NewTarget is undefined, throw a TypeError exception
  // 2. Let xxx by OrdinaryCreateFromConstructor(NewTarget, yyy, zzz)

  // So we're going to emulate those first two steps.
  assertRequiresNew(o, defaultNewTarget);

  const proto = isPrimitive(defaultNewTarget.prototype) ? defaultProto : defaultNewTarget.prototype;
  const obj = create(proto);
  forEach(objectKeys(slots), function iteratee(key) {
    defineProperty(obj, key, {
      configurable: true,
      value: slots[key],
      writable: true,
    });
  });

  return obj;
};

const assertBadConstructor = function assertBadConstructor(C) {
  if (isPrimitive(C)) {
    throw new TypeError('Bad constructor');
  }

  return C;
};

const assertBadSpecies = function assertBadSpecies(S) {
  if (isFunction(S) === false) {
    throw new TypeError('Bad @@species');
  }

  return S;
};

const speciesConstructor = function speciesConstructor(O, defaultConstructor) {
  const C = O.constructor;

  if (typeof C === 'undefined') {
    return defaultConstructor;
  }

  const S = assertBadConstructor(C)[symbolSpecies];

  if (isNil(S)) {
    return defaultConstructor;
  }

  return assertBadSpecies(S);
};

const isPromise = function isPromise(promise) {
  if (isPrimitive(promise)) {
    return false;
  }

  return typeof promise[PRIVATE_PROMISE] !== 'undefined';
};

const createSetZeroTimeout = function createSetZeroTimeout(timeouts, messageName) {
  return function setZeroTimeout(fn) {
    push.call(timeouts, fn);
    postMessage(messageName, '*');
  };
};

const MESSAGE_NAME = 'zero-timeout-message';
const makeZeroTimeoutFn = function makeZeroTimeoutFn() {
  // from http://dbaron.org/log/20100309-faster-timeouts
  const timeouts = [];

  const handleMessage = function handleMessage(event) {
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
};

// find an appropriate setImmediate-alike
const makeZeroTimeout = postMessage ? makeZeroTimeoutFn : UNDEFINED;

const makePromiseAsap = function makePromiseAsap() {
  // An efficient task-scheduler based on a pre-existing Promise
  // implementation, which we can use even if we override the
  // global Promise below (in order to workaround bugs)
  // https://github.com/Raynos/observ-hash/issues/2#issuecomment-35857671
  const pr = NativePromise && NativePromise.resolve && NativePromise.resolve();

  if (pr) {
    return function then(task) {
      return pr.then(task);
    };
  }

  return UNDEFINED;
};

const nextTick = typeof process === 'object' && isFunction(process.nextTick) ? process.nextTick : null;

const getMakeZeroTimeout = function getMakeZeroTimeout() {
  if (makeZeroTimeout) {
    return makeZeroTimeout();
  }

  // fallback
  return function enqueue(task) {
    nativeSetTimeout(task, 0);
  };
};

const getEnqueue = function getEnqueue() {
  if (nativeSetImmediate) {
    return nativeSetImmediate;
  }

  if (nextTick) {
    return nextTick;
  }

  return makePromiseAsap() || getMakeZeroTimeout();
};

const assertBadPromiseCtr = function assertBadPromiseCtr(C) {
  if (isFunction(C) === false) {
    throw new TypeError('Bad promise constructor');
  }

  return C;
};

const assertBadPromiseImplementation = function assertBadPromiseImplementation(capability) {
  if (capability.resolve !== UNDEFINED || capability.reject !== UNDEFINED) {
    throw new TypeError('Bad Promise implementation!');
  }

  return capability;
};

const assertBadPromiseCtr2 = function assertBadPromiseCtr2(capability) {
  if (isFunction(capability.resolve) === false || isFunction(capability.reject) === false) {
    throw new TypeError('Bad promise constructor');
  }

  return capability;
};

// Promises
// Simplest possible implementation; use a 3rd-party library if you
// want the best possible speed and/or long stack traces.
export const implementation = function implementation() {
  // some environments don't have nativeSetTimeout - no way to shim here.
  if (nativeSetTimeout === null) {
    return UNDEFINED;
  }

  // "PromiseCapability" in the spec is what most promise implementations call a "deferred".
  const PromiseCapability = function PromiseCapability(C) {
    assertBadPromiseCtr(C);
    const capability = this;
    const resolver = function resolver(resolve, reject) {
      assertBadPromiseImplementation(capability);
      capability.resolve = resolve;
      capability.reject = reject;
    };

    // Initialize fields to inform optimizers about the object shape.
    capability.resolve = UNDEFINED;
    capability.reject = UNDEFINED;
    capability.promise = new C(resolver);
    assertBadPromiseCtr2(capability);
  };

  const enqueue = getEnqueue();

  // Constants for Promise implementation
  const PROMISE_PENDING = 0;
  const PROMISE_FULFILLED = 1;
  const PROMISE_REJECTED = 2;
  // We store fulfill/reject handlers and capabilities in a single array.
  const PROMISE_FULFILL_OFFSET = 0;
  const PROMISE_REJECT_OFFSET = 1;
  const PROMISE_CAPABILITY_OFFSET = 2;
  // This is used in an optimization for chaining promises via then.
  let PROMISE_FAKE_CAPABILITY = {};

  const promiseReactionJob = function promiseReactionJob(args) {
    const [handler, promiseCapability, argument] = args;

    if (promiseCapability === PROMISE_FAKE_CAPABILITY) {
      // Fast case, when we don't actually need to chain through to a (real) promiseCapability.
      return handler(argument);
    }

    const attemptResult = attempt(handler, argument);
    const f = attemptResult.threw ? promiseCapability.reject : promiseCapability.resolve;

    return f(attemptResult.value);
  };

  const enqueuePromiseReactionJob = function enqueuePromiseReactionJob(args) {
    const [handler, capability, argument] = args;
    enqueue(function enqueuee() {
      promiseReactionJob([handler, capability, argument]);
    });
  };

  const undefinePromise = function undefinePromise(promise, idx) {
    promise[idx + PROMISE_FULFILL_OFFSET] = UNDEFINED;
    promise[idx + PROMISE_REJECT_OFFSET] = UNDEFINED;
    promise[idx + PROMISE_CAPABILITY_OFFSET] = UNDEFINED;
  };

  const enqueueAndDefineFulfill = function enqueueAndDefineFulfill(args) {
    const [length, privatePromise, value, promise] = args;

    for (let i = 1, idx = 0; i < length; i += 1, idx += 3) {
      enqueuePromiseReactionJob([
        privatePromise[idx + PROMISE_FULFILL_OFFSET],
        privatePromise[idx + PROMISE_CAPABILITY_OFFSET],
        value,
      ]);

      undefinePromise(promise, idx);
    }
  };

  const enqueueAndDefineReject = function enqueueAndDefineReject(args) {
    const [length, privatePromise, reason, promise] = args;

    for (let i = 1, idx = 0; i < length; i += 1, idx += 3) {
      enqueuePromiseReactionJob([
        privatePromise[idx + PROMISE_REJECT_OFFSET],
        privatePromise[idx + PROMISE_CAPABILITY_OFFSET],
        reason,
      ]);

      undefinePromise(promise, idx);
    }
  };

  const undefineProps = function undefineProps(privatePromise) {
    privatePromise.fulfillReactionHandler0 = UNDEFINED;
    privatePromise.rejectReactions0 = UNDEFINED;
    privatePromise.reactionCapability0 = UNDEFINED;
  };

  const defineResultAndState = function defineResultAndState(args) {
    const [privatePromise, value, state] = args;

    privatePromise.result = value;
    privatePromise.state = state;
    privatePromise.reactionLength = 0;
  };

  const fulfillPromise = function fulfillPromise(promise, value) {
    const privatePromise = promise[PRIVATE_PROMISE];
    const length = privatePromise.reactionLength;

    if (length > 0) {
      enqueuePromiseReactionJob([privatePromise.fulfillReactionHandler0, privatePromise.reactionCapability0, value]);
      undefineProps(privatePromise);

      if (length > 1) {
        enqueueAndDefineFulfill([length, privatePromise, value, promise]);
      }
    }

    defineResultAndState([privatePromise, value, PROMISE_FULFILLED]);
  };

  const rejectPromise = function rejectPromise(promise, reason) {
    const privatePromise = promise[PRIVATE_PROMISE];
    const length = privatePromise.reactionLength;

    if (length > 0) {
      enqueuePromiseReactionJob([privatePromise.rejectReactionHandler0, privatePromise.reactionCapability0, reason]);
      undefineProps(privatePromise);

      if (length > 1) {
        enqueueAndDefineReject([length, privatePromise, reason, promise]);
      }
    }

    defineResultAndState([privatePromise, reason, PROMISE_REJECTED]);
  };

  let promiseResolveThenableJob;

  const createResolvingFunctions = function createResolvingFunctions(promise) {
    let alreadyResolved = false;
    const resolve = function resolve(resolution) {
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

      const attemptResult = attempt(function attemptee() {
        return resolution.then;
      });

      if (attemptResult.threw) {
        return rejectPromise(promise, attemptResult.value);
      }

      const then = attemptResult.value;

      if (isFunction(then) === false) {
        return fulfillPromise(promise, resolution);
      }

      enqueue(function enqueuee() {
        promiseResolveThenableJob([promise, resolution, then]);
      });

      return UNDEFINED;
    };

    const reject = function reject(reason) {
      if (alreadyResolved) {
        return UNDEFINED;
      }

      alreadyResolved = true;

      return rejectPromise(promise, reason);
    };

    return {resolve, reject};
  };

  let Promise$prototype$then;

  const optimizedThen = function optimizedThen(args) {
    const [then, thenable, resolve, reject] = args;

    // Optimization: since we discard the result, we can pass our
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
    const [promise, thenable, then] = args;
    const {resolve, reject} = createResolvingFunctions(promise);
    const attemptResults = attempt(optimizedThen, [then, thenable, resolve, reject]);

    if (attemptResults.threw) {
      reject(attemptResults.value);
    }
  };

  const assertPromiseRequiresNew = function assertPromiseRequiresNew(context, Ctr) {
    if (toBoolean(context instanceof Ctr) === false) {
      throw new TypeError('Constructor Promise requires "new"');
    }

    return context;
  };

  const assertBadConstruction = function assertBadConstruction(context) {
    if (context && context[PRIVATE_PROMISE]) {
      throw new TypeError('Bad construction');
    }

    return context;
  };

  // see https://bugs.ecmascript.org/show_bug.cgi?id=2482
  const assertValidResolver = function assertValidResolver(resolver) {
    if (isFunction(resolver) === false) {
      throw new TypeError('not a valid resolver');
    }

    return resolver;
  };

  const getSlotsObject = function getSlotsObject() {
    return {
      [PRIVATE_PROMISE]: {
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
        reactionCapability0: UNDEFINED,
      },
    };
  };

  let Promise$prototype;
  const $Promise = function Promise(resolver) {
    assertPromiseRequiresNew(this, $Promise);
    assertBadConstruction(this);
    assertValidResolver(resolver);

    const promise = emulateES6construct([this, $Promise, Promise$prototype, getSlotsObject()]);
    const resolvingFunctions = createResolvingFunctions(promise);
    const {reject} = resolvingFunctions;
    const attemptResult = attempt(function attemptee() {
      resolver(resolvingFunctions.resolve, reject);
    });

    if (attemptResult.threw) {
      reject(attemptResult.value);
    }

    return promise;
  };

  Promise$prototype = $Promise.prototype;

  const promiseAllResolver = function promiseAllResolver(args) {
    const [index, values, capability, remaining] = args;
    let alreadyCalled = false;

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

  const performPromiseAll = function performPromiseAll(iteratorRecord, C, resultCapability) {
    const it = iteratorRecord.iterator;
    const values = [];
    const remaining = {count: 1};
    let next;
    let nextValue;
    let index = 0;
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
      const nextPromise = C.resolve(nextValue);
      const resolveElement = promiseAllResolver([index, values, resultCapability, remaining]);
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

  const assertPromiseIsObject = function assertPromiseIsObject(C) {
    if (isPrimitive(C)) {
      throw new TypeError('Promise is not object');
    }

    return C;
  };

  const assertBadConstructor3 = function assertBadConstructor3(C) {
    if (isPrimitive(C)) {
      throw new TypeError('Bad promise constructor');
    }

    return C;
  };

  const assertIsPromise = function assertIsPromise(promise) {
    if (isPromise(promise) === false) {
      throw new TypeError('not a promise');
    }

    return promise;
  };

  const performPromiseRace = function performPromiseRace(iteratorRecord, C, resultCapability) {
    const it = iteratorRecord.iterator;
    let next;
    let nextValue;
    let nextPromise;
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

  defineProperties($Promise, {
    all: {
      configurable: true,
      value: function all(iterable) {
        const C = assertPromiseIsObject(this);
        const capability = new PromiseCapability(C);
        let iterator;
        let iteratorRecord;
        try {
          iterator = getIterator(iterable);
          iteratorRecord = {iterator, done: false};

          return performPromiseAll(iteratorRecord, C, capability);
        } catch (e) {
          let exception = e;

          if (iteratorRecord && toBoolean(iteratorRecord.done) === false) {
            const attemptResult = attempt(iteratorClose, iterator, true);

            if (attemptResult.threw) {
              exception = attemptResult.value;
            }
          }

          capability.reject(exception);

          return capability.promise;
        }
      },
      writable: true,
    },

    race: {
      configurable: true,
      value: function race(iterable) {
        const C = assertPromiseIsObject(this);
        const capability = new PromiseCapability(C);
        let iterator;
        let iteratorRecord;
        try {
          iterator = getIterator(iterable);
          iteratorRecord = {iterator, done: false};

          return performPromiseRace(iteratorRecord, C, capability);
        } catch (e) {
          let exception = e;

          if (iteratorRecord && !iteratorRecord.done) {
            const attemptResult = attempt(iteratorClose, iterator, true);

            if (attemptResult.threw) {
              exception = attemptResult.value;
            }
          }

          capability.reject(exception);

          return capability.promise;
        }
      },
      writable: true,
    },

    reject: {
      configurable: true,
      value: function reject(reason) {
        const C = this;

        if (isPrimitive(C)) {
          throw new TypeError('Bad promise constructor');
        }

        const capability = new PromiseCapability(C);
        capability.reject(reason); // call with this===undefined

        return capability.promise;
      },
      writable: true,
    },

    resolve: {
      configurable: true,
      value: function resolve(v) {
        // See https://esdiscuss.org/topic/fixing-promise-resolve for spec
        const C = assertBadConstructor3(this);

        if (isPromise(v) && v.constructor === C) {
          return v;
        }

        const capability = new PromiseCapability(C);
        capability.resolve(v); // call with this===undefined

        return capability.promise;
      },
      writable: true,
    },

    [symbolSpecies]: {
      get() {
        return this;
      },
    },
  });

  const promiseResolve = function PromiseResolve(C, value) {
    if (isPromise(value) && value.constructor === C) {
      return value;
    }

    const promiseCapability = new PromiseCapability(C);
    promiseCapability.resolve(value);

    return promiseCapability.promise;
  };

  const createThenFinally = function CreateThenFinally(C, onFinally) {
    /* eslint-disable-next-line func-names */
    return function(value) {
      const result = onFinally();

      /* eslint-disable-next-line func-names */
      return promiseResolve(C, result).then(function() {
        return value;
      });
    };
  };

  const createCatchFinally = function CreateCatchFinally(C, onFinally) {
    /* eslint-disable-next-line func-names */
    return function(reason) {
      const result = onFinally();

      /* eslint-disable-next-line func-names */
      return promiseResolve(C, result).then(function() {
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
      writable: true,
    },

    finally: {
      configurable: true,
      value: function $finally(onFinally) {
        const promise = assertIsObject(this);
        const C = assertIsFunction(speciesConstructor(promise, $Promise));
        const isCallable = isFunction(onFinally);
        const thenFinally = isCallable ? createThenFinally(C, onFinally) : onFinally;
        const catchFinally = isCallable ? createCatchFinally(C, onFinally) : onFinally;

        return promise.then(thenFinally, catchFinally);
      },
      writable: true,
    },

    then: {
      configurable: true,
      value: function then(onFulfilled, onRejected) {
        const promise = assertIsPromise(this);
        const C = speciesConstructor(promise, $Promise);

        /* eslint-disable-next-line prefer-rest-params */
        const returnValueIsIgnored = arguments.length > 2 && arguments[2] === PROMISE_FAKE_CAPABILITY;
        const resultCapability = returnValueIsIgnored && C === $Promise ? PROMISE_FAKE_CAPABILITY : new PromiseCapability(C);

        // PerformPromiseThen(promise, onFulfilled, onRejected, resultCapability)
        // Note that we've split the 'reaction' object into its two
        // components, "capabilities" and "handler"
        // "capabilities" is always equal to `resultCapability`
        const fulfillReactionHandler = isFunction(onFulfilled) ? onFulfilled : identity;
        const rejectReactionHandler = isFunction(onRejected) ? onRejected : thrower;
        const privatePromise = promise[PRIVATE_PROMISE];

        if (privatePromise.state === PROMISE_PENDING) {
          if (privatePromise.reactionLength === 0) {
            privatePromise.fulfillReactionHandler0 = fulfillReactionHandler;
            privatePromise.rejectReactionHandler0 = rejectReactionHandler;
            privatePromise.reactionCapability0 = resultCapability;
          } else {
            const idx = 3 * (privatePromise.reactionLength - 1);
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
      writable: true,
    },
  });

  if (Object.getOwnPropertyDescriptor) {
    {
      const descriptor = Object.getOwnPropertyDescriptor(Promise$prototype.finally, 'name');

      if (descriptor && descriptor.configurable) {
        Object.defineProperty(Promise$prototype.finally, 'name', {configurable: true, value: 'finally'});
      }
    }

    {
      const descriptor = Object.getOwnPropertyDescriptor(Promise$prototype.catch, 'name');

      if (descriptor && descriptor.configurable) {
        Object.defineProperty(Promise$prototype.catch, 'name', {configurable: true, value: 'catch'});
      }
    }
  }

  // This helps the optimizer by ensuring that methods which take capabilities aren't polymorphic.
  PROMISE_FAKE_CAPABILITY = new PromiseCapability($Promise);
  Promise$prototype$then = Promise$prototype.then;

  return $Promise;
};

const throwsError = function throwsError(func) {
  return attempt(func).threw;
};

const valueOrFalseIfThrows = function valueOrFalseIfThrows(func) {
  const res = attempt(func);

  return res.threw ? false : res.value;
};

const supportsSubclassing = function supportsSubclassing(C, f) {
  /* eslint-disable-next-line compat/compat */
  if (isFunction(Object.setPrototypeOf) === false) {
    return false; /* skip test on IE < 11 */
  }

  return valueOrFalseIfThrows(function throwee() {
    const Sub = function Subclass(arg) {
      const o = new C(arg);
      /* eslint-disable-next-line compat/compat */
      Object.setPrototypeOf(o, Subclass.prototype);

      return o;
    };

    /* eslint-disable-next-line compat/compat */
    Object.setPrototypeOf(Sub, C);
    Sub.prototype = create(C.prototype, {
      constructor: {value: Sub},
    });

    return f(Sub);
  });
};

// In Chrome 33 (and thereabouts) Promise is defined, but the
// implementation is buggy in a number of ways.  Let's check subclassing
// support to see if we have a buggy implementation.
const testSupportsSubclassing = function testSupportsSubclassing() {
  return supportsSubclassing(NativePromise, function executee(S) {
    return (
      S.resolve(42).then(function thenee() {
        return UNDEFINED;
      }) instanceof S
    );
  });
};

const testIgnoresNonFunctionThenCallbacks = function testIgnoresNonFunctionThenCallbacks() {
  return (
    throwsError(function throwee() {
      return NativePromise.reject(42)
        .then(null, 5)
        .then(null, noop);
    }) === false
  );
};

const testRequiresObjectContext = function testRequiresObjectContext() {
  return throwsError(function throwee() {
    return NativePromise.call(3, noop);
  });
};

// Promise.resolve() was errata'ed late in the ES6 process.
// See: https://bugzilla.mozilla.org/show_bug.cgi?id=1170742
//      https://code.google.com/p/v8/issues/detail?id=4161
// It serves as a proxy for a number of other bugs in early Promise
// implementations.
const testPromiseResolve = function testPromiseResolve() {
  const p = NativePromise.resolve(5);
  p.constructor = {};

  const p2 = NativePromise.resolve(p);
  const res = attempt(function attemptee() {
    /* eslint-disable-next-line promise/catch-or-return */
    p2.then(null, noop).then(null, noop); // avoid "uncaught rejection" warnings in console
  });

  // v8 native Promises break here https://code.google.com/p/chromium/issues/detail?id=575314
  if (res.threw) {
    return false;
  }

  // This *should* be true!
  return p !== p2;
};

const arePropertyDescriptorsSupported = function arePropertyDescriptorsSupported() {
  // if Object.defineProperty exists but throws, it's IE 8
  return (
    throwsError(function throwee() {
      /* eslint-disable-next-line lodash/prefer-noop */
      return defineProperty({}, 'x', {get() {}});
    }) === false
  );
};

// Chrome 46 (probably older too) does not retrieve a thenable's .then synchronously
const testThenSynchronicity = function testThenSynchronicity() {
  if (arePropertyDescriptorsSupported() === false) {
    return false;
  }

  let count = 0;
  const thenable = defineProperty({}, 'then', {
    get() {
      count += 1;
    },
  });

  NativePromise.resolve(thenable);

  return count === 1;
};

const BadResolverPromise = function BadResolverPromise(executor) {
  const p = new NativePromise(executor);

  /* eslint-disable-next-line func-names,lodash/prefer-noop */
  executor(3, function() {});
  this.then = p.then;
  this.constructor = BadResolverPromise;
};

BadResolverPromise.prototype = NativePromise.prototype;
BadResolverPromise.all = NativePromise.all;
// Chrome Canary 49 (probably older too) has some implementation bugs
const testBadResolverPromise = function testBadResolverPromise() {
  return (
    valueOrFalseIfThrows(function throwee() {
      return toBoolean(BadResolverPromise.all([1, 2]));
    }) === false
  );
};

const testWorkingFinally = function testWorkingFinally() {
  return (
    attempt(function attemptee() {
      /* eslint-disable-next-line promise/catch-or-return,promise/valid-params */
      new NativePromise(noop).finally();
    }).threw === false
  );
};

const isWorking =
  toBoolean(NativePromise) &&
  testSupportsSubclassing() &&
  testIgnoresNonFunctionThenCallbacks() &&
  testRequiresObjectContext() &&
  testPromiseResolve() &&
  testThenSynchronicity() &&
  testBadResolverPromise() &&
  testWorkingFinally();

export default isWorking ? NativePromise : implementation();

<a
  href="https://travis-ci.org/Xotic750/promise-x"
  title="Travis status">
<img
  src="https://travis-ci.org/Xotic750/promise-x.svg?branch=master"
  alt="Travis status" height="18">
</a>
<a
  href="https://david-dm.org/Xotic750/promise-x"
  title="Dependency status">
<img src="https://david-dm.org/Xotic750/promise-x/status.svg"
  alt="Dependency status" height="18"/>
</a>
<a
  href="https://david-dm.org/Xotic750/promise-x?type=dev"
  title="devDependency status">
<img src="https://david-dm.org/Xotic750/promise-x/dev-status.svg"
  alt="devDependency status" height="18"/>
</a>
<a
  href="https://badge.fury.io/js/%40xotic750%2promise-x"
  title="npm version">
<img src="https://badge.fury.io/js/%40xotic750%2promise-x.svg"
  alt="npm version" height="18">
</a>
<a
  href="https://www.jsdelivr.com/package/npm/promise-x"
  title="jsDelivr hits">
<img src="https://data.jsdelivr.com/v1/package/npm/promise-x/badge?style=rounded"
  alt="jsDelivr hits" height="18">
</a>
<a
  href="https://bettercodehub.com/results/Xotic750/promise-x"
  title="bettercodehub score">
<img src="https://bettercodehub.com/edge/badge/Xotic750/promise-x?branch=master"
  alt="bettercodehub score" height="18">
</a>
<a
  href="https://coveralls.io/github/Xotic750/promise-x?branch=master"
  title="Coverage Status">
<img src="https://coveralls.io/repos/github/Xotic750/promise-x/badge.svg?branch=master"
  alt="Coverage Status" height="18">
</a>

<a href="http://promisesaplus.com/">
    <img src="http://promisesaplus.com/assets/logo-small.png" alt="Promises/A+ logo"
         title="Promises/A+ 1.1 compliant" align="right" />
</a>

## @xotic750/promise-x

A Promise/A+ and ES2018 implementation.

- Passes the Compliances tests for Promises/A+

- Passes the ECMAScript 6 Promises Test Suite.

- Has ES2018 finally implementation.

- Can be sub-classed.

**Example**

```js
import P from 'promise-x';

P.resolve('Hello')
  .then((value) => {
    console.log(value);
  })
  .catch((reason) => {
    console.log(reason);
  })
  .finally(() => {
    console.log('settled (fulfilled or rejected)');
  });
```

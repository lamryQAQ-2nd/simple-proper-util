# simple-proper-util

A utility to manipulate object properties in JavaScript using string paths.

## Features

- Test if a property exists in an object through a string path.
- Retrieve a property's value from an object using a string path.
- Define a property's value in an object at a given string path.

## Demo

Consider the following object:

```javascript
const obj = {
    prop1: {
        arr: ['a', 'b', 'c'],
        str: 'Hello'
    },
    prop2: {
        arr: [{ nested: 'Universe' }],
        str: 'Hello again!'
    }
};
```

### Test
```javascript
import { testProperExists } from 'simple-proper-util';

console.log(testProperExists(obj, 'prop1.str')); // true
console.log(testProperExists(obj, 'prop1.foo')); // false

import { getProper } from 'simple-proper-util';

console.log(getProper(obj, 'prop1.str')); // "Hello"
console.log(getProper(obj, 'prop2.arr[0].nested')); // "Universe"

import { putProper } from 'simple-proper-util';

putProper(obj, 'prop1.str', 'Hello World!');
console.log(obj.prop1.str); // "Hello World!"
```
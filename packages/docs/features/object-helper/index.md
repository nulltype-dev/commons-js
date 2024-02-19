# Object helper

Functions for working with objects

## Installation

```bash
npm i @nulltype/object-helper
```

## has

Calls `Object.prototype.hasOwnProperty` ensuring that the prop is member of object.

```ts
import { has } from '@nulltype/object-helper'

function someFunction(arg1: { myprop?: string }, someVar: string) {
  arg1[someVar] = 'test'
  // above line will result in error:
  //   Element implicitly has an 'any' type
  //   because expression of type 'string'
  //   can't be used to index type '{ myprop?: string | undefined; }'.
  //   No index signature with a parameter of type 'string' was found
  //   on type '{ myprop?: string | undefined; }'.ts(7053)

  if (has(arg1, someVar)) {
    arg1[someVar] = 'test' // OK
  }
}
```

## simpleCopy

Use it to copy plain js objects, shortcut for `JSON.parse(JSON.stringify(myObject))`.

```ts
import { simpleCopy } from '@nulltype/object-helper'

const a = { a: 1}
const aCopy = simpleCopy(a)
```

## isSet

Usefull for filter functions when you want to get rid of `null` and `undefined` values.
Using `Boolean()` to filter out will still keep the null or undefined types.

```ts
const collection = ['a', 'b', null, undefined]
// const collection: (string | null | undefined)[]

const subCollection1 = collection.filter((item) => Boolean(item))
// const subCollection1: (string | null | undefined)[]

const subCollection2 = collection.filter(isSet)
// const subCollection2: string[]
```
# Event emitter

Simple event emitter with typehinting.

## Installation

```bash
npm i @nulltype/event-emitter
```

## Defining emitter types

1. When creating emitter instance:

```ts
import { EventEmitter } from '@nulltype/event-emitter'

const emitter = new EventEmitter<{
  'event1': [number, string, string],
  'event2': []
}>()
```

2. Or by extending `EventEmitter` class:

```ts
import { EventEmitter } from '@nulltype/event-emitter'

class MyClass extends EventEmitter<{
  'event1': [number, string, string],
  'event2': []
}> {

  doSomething() {
    // doing something
    this.emit('event2')
  }
}

const emitter = new MyClass()
```

## Subscribing to event

When you subscribe to the event the argument types will match the ones provided in listener map type.

```ts
emitter.subscribe('event1', (digit, str1, str2) => {
  // do something
})
// ide hint: subscribe(name: "event1", listener: (args_0: number, args_1: string, args_2: string) => void): Unsubscribe
```

```ts
// Argument of type '(arg1: { event1: [number, string, string]; event2: []; }[NameType][0]) => void'
// is not assignable to parameter of type '() => void'.
//Target signature provides too few arguments. Expected 1 or more, but got 0.ts(2345)
emitter.subscribe('event2', (arg1) => {

})

```

## Unsubscribing

When you no longer need to listen to an event just call the unsubscribe method returned by the `subscribe` method.

```ts
const unsub = emitter.subscribe('event2', () => {})
unsub()


// or when you are setting up lot of them
function setup(emitter: EventEmitter<{[s: string]: any[]}>) {
  const unsubs = []

  unsubs.push(
    emitter.subscribe(/*...*/),
    emitter.subscribe(/*...*/),
    emitter.subscribe(/*...*/),
    emitter.subscribe(/*...*/),
    emitter.subscribe(/*...*/)
  )

  return () => {
    unsubs.forEach((unsub) => unsub())
  }
}

const cleanup = setup(emitter)
// when done
cleanup()
```
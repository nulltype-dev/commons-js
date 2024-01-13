import { describe, it, expect } from 'vitest'
import { EventEmitter } from '../EventEmitter'

const createEmitter = () => {
  const emitter = new EventEmitter<{
    event1: [number, string]
    event2: []
  }>()

  return {
    emitter,
  }
}

describe('EventEmitter', () => {
  it('should emit without errors when no listeners are subscribing', () => {
    const { emitter } = createEmitter()

    expect(() => {
      emitter.emit('event1', 30, 'str')
    }).not.throws()
  })

  it('should subscribe event listener', () => {
    const { emitter } = createEmitter()
    let result = ''
    emitter.subscribe('event1', (someNumber, someString) => {
      result = `${someNumber}:${someString}`
    })

    emitter.emit('event1', 30, 'str')
    expect(result).toBe('30:str')
  })

  it('should unsubscribe event listener', () => {
    const { emitter } = createEmitter()
    let count = 0
    const unsubscribe = emitter.subscribe('event2', () => {
      count += 1
    })

    emitter.emit('event2')
    unsubscribe()
    emitter.emit('event2')
    expect(count).toBe(1)
  })
})

import { describe, it, expect } from 'vitest'
import { has } from '..'

describe('has', () => {
  it('should return false when object does not have given property', () => {
    const o = {
      a: 'a',
    }

    expect(has(o, 'b')).toBe(false)
  })

  it('should return true when object has given property', () => {
    const o = {
      a: 'a',
    }

    expect(has(o, 'a')).toBe(true)
  })
})

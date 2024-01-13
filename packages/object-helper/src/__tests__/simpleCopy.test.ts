import { describe, it, expect } from 'vitest'
import { simpleCopy } from '../simpleCopy'

describe('simpleCopy', () => {
  it('should copy simple object', () => {
    const subject = {
      a: [{ b: 2 }],
    }

    expect(simpleCopy(subject)).toStrictEqual({
      a: [{ b: 2 }],
    })
  })

  it('should copy as different object', () => {
    const subject = {
      a: [{ b: 2 }],
    }
    const copy = simpleCopy(subject)

    expect(subject !== copy).toBe(true)
  })
})

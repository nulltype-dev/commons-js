import { describe, it, expect } from 'vitest'
import { isSet } from '../isSet'

describe('isSet', () => {
  it('should return false on undefined', () => {
    expect(isSet(undefined)).toBe(false)
  })

  it('should return false on null', () => {
    expect(isSet(null)).toBe(false)
  })

  it('should return true on any value', () => {
    expect(isSet('any value')).toBe(true)
  })
})

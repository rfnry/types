import { describe, expect, it } from 'vitest'
import { matches } from '../src/tenant'

describe('tenant', () => {
  it('empty thread tenant always matches', () => {
    expect(matches({}, { org: 'x' })).toBe(true)
  })

  it('requires all thread keys', () => {
    expect(matches({ org: 'x' }, { org: 'x', ws: 'y' })).toBe(true)
    expect(matches({ org: 'x', ws: 'y' }, { org: 'x' })).toBe(false)
  })

  it('rejects mismatched values', () => {
    expect(matches({ org: 'x' }, { org: 'y' })).toBe(false)
  })
})

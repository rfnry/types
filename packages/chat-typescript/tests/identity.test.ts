import { describe, expect, it } from 'vitest'
import { isIdentity, parseIdentity } from '../src/identity'

describe('identity', () => {
  it('parses user identity', () => {
    const parsed = parseIdentity({ role: 'user', id: 'u_1', name: 'Alice', metadata: {} })
    expect(parsed.role).toBe('user')
  })

  it('parses assistant identity', () => {
    const parsed = parseIdentity({ role: 'assistant', id: 'a_1', name: 'A', metadata: {} })
    expect(parsed.role).toBe('assistant')
  })

  it('parses system identity', () => {
    const parsed = parseIdentity({ role: 'system', id: 's_1', name: 'sys', metadata: {} })
    expect(parsed.role).toBe('system')
  })

  it('rejects unknown role', () => {
    expect(() => parseIdentity({ role: 'alien', id: 'x', name: 'x', metadata: {} })).toThrow()
  })

  it('isIdentity type guard', () => {
    expect(isIdentity({ role: 'user', id: 'u_1', name: 'Alice', metadata: {} })).toBe(true)
    expect(isIdentity({ role: 'alien' })).toBe(false)
    expect(isIdentity('not-an-object')).toBe(false)
  })
})

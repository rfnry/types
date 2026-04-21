import { describe, expect, it } from 'vitest'
import * as api from '../src/main'

describe('main exports', () => {
  it('exposes parseEvent', () => {
    expect(typeof api.parseEvent).toBe('function')
  })

  it('exposes parseIdentity', () => {
    expect(typeof api.parseIdentity).toBe('function')
  })

  it('exposes parseContentPart', () => {
    expect(typeof api.parseContentPart).toBe('function')
  })

  it('exposes matches', () => {
    expect(typeof api.matches).toBe('function')
  })

  it('exposes mappers', () => {
    expect(typeof api.toEvent).toBe('function')
    expect(typeof api.toEventDraftWire).toBe('function')
    expect(typeof api.toIdentity).toBe('function')
    expect(typeof api.toThread).toBe('function')
    expect(typeof api.toRun).toBe('function')
  })
})

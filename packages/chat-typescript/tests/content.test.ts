import { describe, expect, it } from 'vitest'
import { parseContentPart } from '../src/content'

describe('content', () => {
  it('parses text part', () => {
    const parsed = parseContentPart({ type: 'text', text: 'hello' })
    expect(parsed.type).toBe('text')
    if (parsed.type === 'text') {
      expect(parsed.text).toBe('hello')
    }
  })

  it('parses image part with required url and mime', () => {
    const parsed = parseContentPart({ type: 'image', url: 'https://x', mime: 'image/png' })
    expect(parsed.type).toBe('image')
  })

  it('rejects image part with empty url', () => {
    expect(() => parseContentPart({ type: 'image', url: '', mime: 'image/png' })).toThrow()
  })

  it('rejects image part with empty mime', () => {
    expect(() => parseContentPart({ type: 'image', url: 'https://x', mime: '' })).toThrow()
  })

  it('parses audio part with optional duration', () => {
    const parsed = parseContentPart({
      type: 'audio',
      url: 'https://x',
      mime: 'audio/mp3',
      duration_ms: 1500,
    })
    expect(parsed.type).toBe('audio')
  })

  it('parses document part', () => {
    const parsed = parseContentPart({ type: 'document', url: 'https://x', mime: 'application/pdf' })
    expect(parsed.type).toBe('document')
  })

  it('parses form part with schema wire key', () => {
    const parsed = parseContentPart({
      type: 'form',
      form_id: 'f_1',
      schema: { type: 'object' },
      status: 'pending',
    })
    expect(parsed.type).toBe('form')
  })

  it('rejects unknown type', () => {
    expect(() => parseContentPart({ type: 'video', url: 'https://x' })).toThrow()
  })
})

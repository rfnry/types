import { describe, expect, it } from 'vitest'
import type { ContentPartWire } from '../src/content'
import type { EventDraft, EventWire } from '../src/event'
import { toContentPart, toContentPartWire, toEvent, toEventDraftWire } from '../src/mappers'

describe('mappers', () => {
  it('toContentPart maps wire audio duration_ms → durationMs', () => {
    const wire: ContentPartWire = {
      type: 'audio',
      url: 'https://x',
      mime: 'audio/mp3',
      duration_ms: 1500,
    }
    const part = toContentPart(wire)
    expect(part.type).toBe('audio')
    if (part.type === 'audio') {
      expect(part.durationMs).toBe(1500)
    }
  })

  it('toContentPartWire maps form formId → form_id', () => {
    const wire = toContentPartWire({
      type: 'form',
      formId: 'f_1',
      schema: { type: 'object' },
      status: 'pending',
    })
    expect(wire.type).toBe('form')
    if (wire.type === 'form') {
      expect(wire.form_id).toBe('f_1')
    }
  })

  it('toEvent converts wire to in-memory camelCase', () => {
    const wire: EventWire = {
      id: 'evt_1',
      thread_id: 't_1',
      author: { role: 'user', id: 'u_1', name: 'Alice', metadata: {} },
      created_at: '2026-04-21T12:00:00+00:00',
      metadata: {},
      type: 'message',
      content: [{ type: 'text', text: 'hi' }],
    } as EventWire
    const evt = toEvent(wire)
    expect(evt.threadId).toBe('t_1')
    expect(evt.createdAt).toBe('2026-04-21T12:00:00+00:00')
    expect(evt.type).toBe('message')
  })

  it('toEventDraftWire emits snake_case', () => {
    const draft: EventDraft = {
      clientId: 'c_1',
      content: [{ type: 'text', text: 'hi' }],
      metadata: { k: 'v' },
      recipients: ['u_1'],
    }
    const wire = toEventDraftWire(draft)
    expect(wire.client_id).toBe('c_1')
    expect(wire.recipients).toEqual(['u_1'])
  })

  it('toEventDraftWire emits null recipients when undefined', () => {
    const wire = toEventDraftWire({ clientId: 'c_1' })
    expect(wire.client_id).toBe('c_1')
    expect(wire.recipients).toBe(null)
  })
})

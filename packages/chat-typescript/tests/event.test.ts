import { describe, expect, it } from 'vitest'
import type { EventWire, ThreadTenantChangedEvent } from '../src/event'
import { parseEvent } from '../src/event'

const base = {
  id: 'evt_1',
  thread_id: 't_1',
  author: { role: 'user' as const, id: 'u_1', name: 'Alice', metadata: {} },
  created_at: '2026-04-21T12:00:00+00:00',
  metadata: {},
}

describe('event', () => {
  it('parses each event type', () => {
    const cases: Array<[string, Record<string, unknown>]> = [
      ['message', { content: [{ type: 'text', text: 'hi' }] }],
      ['reasoning', { content: 'thinking' }],
      ['tool.call', { tool: { id: 'c_1', name: 'f', arguments: {} } }],
      ['tool.result', { tool: { id: 'c_1', result: 'ok' } }],
      ['thread.created', { thread: { id: 't_1', tenant: {} } }],
      ['thread.member_added', { member: base.author }],
      ['thread.member_removed', { member: base.author }],
      ['thread.tenant_changed', { from: { org: 'a' }, to: { org: 'b' } }],
      ['run.started', {}],
      ['run.completed', {}],
      ['run.failed', { error: { code: 'x', message: 'y' } }],
      ['run.cancelled', {}],
    ]
    for (const [type, extra] of cases) {
      const raw: EventWire = { ...base, type: type as EventWire['type'], ...extra } as EventWire
      const parsed = parseEvent(raw)
      expect(parsed.type).toBe(type)
    }
  })

  it('rejects unknown event type', () => {
    const raw = { ...base, type: 'unknown' } as unknown
    expect(() => parseEvent(raw)).toThrow()
  })

  it('ThreadTenantChangedEvent wire uses from (not from_)', () => {
    const raw: EventWire = {
      ...base,
      type: 'thread.tenant_changed',
      from: { org: 'a' },
      to: { org: 'b' },
    } as EventWire
    const parsed = parseEvent(raw) as ThreadTenantChangedEvent
    expect(parsed.type).toBe('thread.tenant_changed')
    expect(parsed.from).toEqual({ org: 'a' })
    expect(parsed.to).toEqual({ org: 'b' })
    const serialized = JSON.parse(JSON.stringify(raw))
    expect(serialized.from).toEqual({ org: 'a' })
    expect(serialized.from_).toBeUndefined()
  })
})

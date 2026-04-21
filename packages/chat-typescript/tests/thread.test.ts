import { describe, expect, it } from 'vitest'
import type { Thread, ThreadMember, ThreadMemberWire, ThreadWire } from '../src/thread'

describe('thread', () => {
  it('Thread in-memory uses camelCase dates', () => {
    const thread: Thread = {
      id: 't_1',
      tenant: {},
      metadata: {},
      createdAt: '2026-04-21T12:00:00+00:00',
      updatedAt: '2026-04-21T12:00:00+00:00',
    }
    expect(thread.createdAt).toBe('2026-04-21T12:00:00+00:00')
  })

  it('ThreadWire uses snake_case dates', () => {
    const wire: ThreadWire = {
      id: 't_1',
      tenant: {},
      metadata: {},
      created_at: '2026-04-21T12:00:00+00:00',
      updated_at: '2026-04-21T12:00:00+00:00',
    }
    const parsed = JSON.parse(JSON.stringify(wire))
    expect(parsed.created_at).toBe('2026-04-21T12:00:00+00:00')
    expect(parsed.updated_at).toBe('2026-04-21T12:00:00+00:00')
  })

  it('ThreadMember in-memory uses camelCase', () => {
    const user = { role: 'user' as const, id: 'u_1', name: 'Alice', metadata: {} }
    const member: ThreadMember = {
      threadId: 't_1',
      identityId: 'u_1',
      identity: user,
      role: 'member',
      addedAt: '2026-04-21T12:00:00+00:00',
      addedBy: user,
    }
    expect(member.threadId).toBe('t_1')
    expect(member.addedAt).toBe('2026-04-21T12:00:00+00:00')
  })

  it('ThreadMemberWire uses snake_case', () => {
    const wireIdentity = { role: 'user' as const, id: 'u_1', name: 'Alice', metadata: {} }
    const wire: ThreadMemberWire = {
      thread_id: 't_1',
      identity_id: 'u_1',
      identity: wireIdentity,
      role: 'member',
      added_at: '2026-04-21T12:00:00+00:00',
      added_by: wireIdentity,
    }
    const parsed = JSON.parse(JSON.stringify(wire))
    expect(parsed.thread_id).toBe('t_1')
    expect(parsed.added_at).toBe('2026-04-21T12:00:00+00:00')
  })
})

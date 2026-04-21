import { describe, expect, it } from 'vitest'
import { toThreadInvitedFrame } from '../src/mappers'
import type { ThreadInvitedFrame, ThreadInvitedFrameWire } from '../src/thread'

describe('toThreadInvitedFrame', () => {
  it('maps snake_case wire to camelCase domain', () => {
    const wire: ThreadInvitedFrameWire = {
      thread: {
        id: 'th_1',
        tenant: { org: 'A' },
        metadata: {},
        created_at: '2026-04-21T00:00:00Z',
        updated_at: '2026-04-21T00:00:00Z',
      },
      added_member: { role: 'user', id: 'u_alice', name: 'Alice', metadata: {} },
      added_by: { role: 'assistant', id: 'a_bot', name: 'Bot', metadata: {} },
    }
    const frame: ThreadInvitedFrame = toThreadInvitedFrame(wire)
    expect(frame.thread.id).toBe('th_1')
    expect(frame.thread.createdAt).toBe('2026-04-21T00:00:00Z')
    expect(frame.addedMember.id).toBe('u_alice')
    expect(frame.addedBy.id).toBe('a_bot')
  })
})

import { describe, expect, it } from 'vitest'
import {
  parsePresenceJoinedFrame,
  parsePresenceLeftFrame,
  parsePresenceSnapshot,
} from '../src/presence'

describe('presence parsers', () => {
  it('parses a snapshot', () => {
    const snap = parsePresenceSnapshot({
      members: [
        { role: 'user', id: 'u_a', name: 'Alice', metadata: {} },
        { role: 'assistant', id: 'agent-a', name: 'Agent A', metadata: {} },
      ],
    })
    expect(snap.members.map((m) => m.id).sort()).toEqual(['agent-a', 'u_a'])
  })

  it('parses a joined frame', () => {
    const frame = parsePresenceJoinedFrame({
      identity: { role: 'user', id: 'u_a', name: 'Alice', metadata: {} },
      at: '2026-04-23T12:00:00Z',
    })
    expect(frame.identity.id).toBe('u_a')
    expect(frame.at).toBe('2026-04-23T12:00:00Z')
  })

  it('parses a left frame', () => {
    const frame = parsePresenceLeftFrame({
      identity: { role: 'assistant', id: 'agent-a', name: 'Agent A', metadata: {} },
      at: '2026-04-23T12:05:00Z',
    })
    expect(frame.identity.id).toBe('agent-a')
  })

  it('rejects malformed snapshot', () => {
    expect(() => parsePresenceSnapshot({ members: 'nope' })).toThrow(/members/)
  })
})

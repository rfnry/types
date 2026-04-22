import { describe, expect, it } from 'vitest'
import type { AssistantIdentity, UserIdentity } from '../src/identity'
import type {
  StreamDeltaFrame,
  StreamDeltaFrameWire,
  StreamEndFrame,
  StreamEndFrameWire,
  StreamError,
  StreamStartFrame,
  StreamStartFrameWire,
  StreamTargetType,
} from '../src/stream'

describe('stream', () => {
  it('StreamStartFrame in-memory uses camelCase', () => {
    const assistant: AssistantIdentity = {
      role: 'assistant',
      id: 'a_1',
      name: 'A',
      metadata: {},
    }
    const frame: StreamStartFrame = {
      eventId: 'evt_1',
      threadId: 't_1',
      runId: 'run_1',
      targetType: 'message',
      author: assistant,
    }
    expect(frame.eventId).toBe('evt_1')
    expect(frame.targetType).toBe('message')
  })

  it('StreamStartFrame accepts any Identity (e.g. user)', () => {
    const user: UserIdentity = {
      role: 'user',
      id: 'u_alice',
      name: 'Alice',
      metadata: {},
    }
    const frame: StreamStartFrame = {
      eventId: 'evt_1',
      threadId: 't_1',
      runId: 'run_1',
      targetType: 'message',
      author: user,
    }
    expect(frame.author.id).toBe('u_alice')
    expect(frame.author.role).toBe('user')
  })

  it('StreamStartFrameWire uses snake_case', () => {
    const wire: StreamStartFrameWire = {
      event_id: 'evt_1',
      thread_id: 't_1',
      run_id: 'run_1',
      target_type: 'message',
      author: { role: 'assistant', id: 'a_1', name: 'A', metadata: {} },
    }
    const parsed = JSON.parse(JSON.stringify(wire))
    expect(parsed.event_id).toBe('evt_1')
    expect(parsed.target_type).toBe('message')
  })

  it('StreamDeltaFrame in-memory', () => {
    const frame: StreamDeltaFrame = { eventId: 'evt_1', threadId: 't_1', text: 'hello' }
    expect(frame.text).toBe('hello')
  })

  it('StreamDeltaFrameWire uses snake_case', () => {
    const wire: StreamDeltaFrameWire = { event_id: 'evt_1', thread_id: 't_1', text: 'hello' }
    const parsed = JSON.parse(JSON.stringify(wire))
    expect(parsed.event_id).toBe('evt_1')
  })

  it('StreamEndFrame allows optional error', () => {
    const ok: StreamEndFrame = { eventId: 'evt_1', threadId: 't_1' }
    expect(ok.error).toBeUndefined()
    const err: StreamError = { code: 'boom', message: 'bad' }
    const failed: StreamEndFrame = { eventId: 'evt_1', threadId: 't_1', error: err }
    expect(failed.error?.code).toBe('boom')
  })

  it('StreamEndFrameWire uses snake_case', () => {
    const wire: StreamEndFrameWire = { event_id: 'evt_1', thread_id: 't_1' }
    const parsed = JSON.parse(JSON.stringify(wire))
    expect(parsed.event_id).toBe('evt_1')
  })

  it('StreamTargetType union', () => {
    const values: StreamTargetType[] = ['message', 'reasoning']
    expect(values).toHaveLength(2)
  })
})

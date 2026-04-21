import { describe, expect, it } from 'vitest'
import type { AssistantIdentity, UserIdentity } from '../src/identity'
import type { Run, RunError, RunWire } from '../src/run'

describe('run', () => {
  it('Run in-memory uses camelCase', () => {
    const assistant: AssistantIdentity = {
      role: 'assistant',
      id: 'a_1',
      name: 'A',
      metadata: {},
    }
    const user: UserIdentity = { role: 'user', id: 'u_1', name: 'U', metadata: {} }
    const run: Run = {
      id: 'run_1',
      threadId: 't_1',
      assistant,
      triggeredBy: user,
      status: 'running',
      startedAt: '2026-04-21T12:00:00+00:00',
      metadata: {},
    }
    expect(run.threadId).toBe('t_1')
    expect(run.startedAt).toBe('2026-04-21T12:00:00+00:00')
    expect(run.completedAt).toBeUndefined()
    expect(run.error).toBeUndefined()
  })

  it('RunWire uses snake_case', () => {
    const wireIdentity = { role: 'assistant' as const, id: 'a_1', name: 'A', metadata: {} }
    const wireUser = { role: 'user' as const, id: 'u_1', name: 'U', metadata: {} }
    const wire: RunWire = {
      id: 'run_1',
      thread_id: 't_1',
      assistant: wireIdentity,
      triggered_by: wireUser,
      status: 'running',
      started_at: '2026-04-21T12:00:00+00:00',
      metadata: {},
    }
    const parsed = JSON.parse(JSON.stringify(wire))
    expect(parsed.thread_id).toBe('t_1')
    expect(parsed.triggered_by.id).toBe('u_1')
    expect(parsed.started_at).toBe('2026-04-21T12:00:00+00:00')
  })

  it('RunError shape', () => {
    const err: RunError = { code: 'timeout', message: 'exceeded 120s' }
    expect(err.code).toBe('timeout')
  })

  it('RunStatus union accepts all five values', () => {
    const statuses: Run['status'][] = ['pending', 'running', 'completed', 'failed', 'cancelled']
    expect(statuses).toHaveLength(5)
  })
})

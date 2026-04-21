import type { ContentPart, ContentPartWire } from './content'
import type { Identity, IdentityWire } from './identity'
import type { TenantScope } from './tenant'

export type EventBase = {
  id: string
  threadId: string
  runId?: string
  author: Identity
  createdAt: string
  metadata: Record<string, unknown>
  clientId?: string
  recipients: string[] | null
}

export type EventBaseWire = {
  id: string
  thread_id: string
  run_id?: string | null
  author: IdentityWire
  created_at: string
  metadata: Record<string, unknown>
  client_id?: string | null
  recipients?: string[] | null
}

export type ToolCall = {
  id: string
  name: string
  arguments: unknown
}

export type ToolResult = {
  id: string
  result?: unknown
  error?: { code: string; message: string }
}

export type MessageEvent = EventBase & { type: 'message'; content: ContentPart[] }
export type ReasoningEvent = EventBase & { type: 'reasoning'; content: string }
export type ToolCallEvent = EventBase & { type: 'tool.call'; tool: ToolCall }
export type ToolResultEvent = EventBase & { type: 'tool.result'; tool: ToolResult }
export type ThreadCreatedEvent = EventBase & {
  type: 'thread.created'
  thread: { id: string; tenant: TenantScope }
}
export type ThreadMemberAddedEvent = EventBase & {
  type: 'thread.member_added'
  member: Identity
}
export type ThreadMemberRemovedEvent = EventBase & {
  type: 'thread.member_removed'
  member: Identity
}
export type ThreadTenantChangedEvent = EventBase & {
  type: 'thread.tenant_changed'
  from: TenantScope
  to: TenantScope
}
export type RunStartedEvent = EventBase & { type: 'run.started' }
export type RunCompletedEvent = EventBase & { type: 'run.completed' }
export type RunFailedEvent = EventBase & {
  type: 'run.failed'
  error: { code: string; message: string }
}
export type RunCancelledEvent = EventBase & { type: 'run.cancelled' }

export type Event =
  | MessageEvent
  | ReasoningEvent
  | ToolCallEvent
  | ToolResultEvent
  | ThreadCreatedEvent
  | ThreadMemberAddedEvent
  | ThreadMemberRemovedEvent
  | ThreadTenantChangedEvent
  | RunStartedEvent
  | RunCompletedEvent
  | RunFailedEvent
  | RunCancelledEvent

export type EventWire = EventBaseWire & {
  type: Event['type']
} & Record<string, unknown>

export type EventDraft = {
  clientId: string
  content?: ContentPart[]
  metadata?: Record<string, unknown>
  recipients?: string[] | null
}

export type EventDraftWire = {
  client_id: string
  content?: ContentPartWire[]
  metadata?: Record<string, unknown>
  recipients?: string[] | null
}

const EVENT_TYPES: ReadonlySet<Event['type']> = new Set([
  'message',
  'reasoning',
  'tool.call',
  'tool.result',
  'thread.created',
  'thread.member_added',
  'thread.member_removed',
  'thread.tenant_changed',
  'run.started',
  'run.completed',
  'run.failed',
  'run.cancelled',
])

const IDENTITY_ROLES = new Set(['user', 'assistant', 'system'])

function toIdentityInternal(wire: IdentityWire): Identity {
  return {
    role: wire.role,
    id: wire.id,
    name: wire.name,
    metadata: wire.metadata ?? {},
  } as Identity
}

function toContentPartInternal(wire: ContentPartWire): ContentPart {
  switch (wire.type) {
    case 'text':
      return wire
    case 'image':
      return wire
    case 'audio':
      return {
        type: 'audio',
        url: wire.url,
        mime: wire.mime,
        name: wire.name,
        size: wire.size,
        durationMs: wire.duration_ms,
      }
    case 'document':
      return wire
    case 'form':
      return {
        type: 'form',
        formId: wire.form_id,
        schema: wire.schema,
        status: wire.status,
        values: wire.values,
        answersEventId: wire.answers_event_id,
        title: wire.title,
        description: wire.description,
      }
  }
}

export function parseEvent(raw: unknown): Event {
  if (typeof raw !== 'object' || raw === null) {
    throw new Error(`invalid event: ${JSON.stringify(raw)}`)
  }
  const record = raw as Record<string, unknown>
  const type = record.type
  if (typeof type !== 'string' || !EVENT_TYPES.has(type as Event['type'])) {
    throw new Error(`unknown event type: ${JSON.stringify(type)}`)
  }
  if (typeof record.id !== 'string' || typeof record.thread_id !== 'string') {
    throw new Error(`invalid event base: ${JSON.stringify(raw)}`)
  }
  if (typeof record.created_at !== 'string') {
    throw new Error(`invalid event created_at: ${JSON.stringify(raw)}`)
  }
  const author = record.author as IdentityWire | undefined
  if (
    !author ||
    typeof author.id !== 'string' ||
    typeof author.role !== 'string' ||
    !IDENTITY_ROLES.has(author.role)
  ) {
    throw new Error(`invalid event author: ${JSON.stringify(raw)}`)
  }
  const base: EventBase = {
    id: record.id,
    threadId: record.thread_id,
    runId: (record.run_id as string | null | undefined) ?? undefined,
    author: toIdentityInternal(author),
    createdAt: record.created_at,
    metadata: (record.metadata as Record<string, unknown> | undefined) ?? {},
    clientId: (record.client_id as string | null | undefined) ?? undefined,
    recipients: (record.recipients as string[] | null | undefined) ?? null,
  }
  switch (type as Event['type']) {
    case 'message':
      return {
        ...base,
        type: 'message',
        content: ((record.content as ContentPartWire[] | undefined) ?? []).map(
          toContentPartInternal
        ),
      }
    case 'reasoning':
      return { ...base, type: 'reasoning', content: (record.content as string) ?? '' }
    case 'tool.call':
      return { ...base, type: 'tool.call', tool: record.tool as ToolCall }
    case 'tool.result':
      return { ...base, type: 'tool.result', tool: record.tool as ToolResult }
    case 'thread.created':
      return {
        ...base,
        type: 'thread.created',
        thread: record.thread as { id: string; tenant: TenantScope },
      }
    case 'thread.member_added':
      return {
        ...base,
        type: 'thread.member_added',
        member: toIdentityInternal(record.member as IdentityWire),
      }
    case 'thread.member_removed':
      return {
        ...base,
        type: 'thread.member_removed',
        member: toIdentityInternal(record.member as IdentityWire),
      }
    case 'thread.tenant_changed':
      return {
        ...base,
        type: 'thread.tenant_changed',
        from: record.from as TenantScope,
        to: record.to as TenantScope,
      }
    case 'run.started':
      return { ...base, type: 'run.started' }
    case 'run.completed':
      return { ...base, type: 'run.completed' }
    case 'run.failed':
      return {
        ...base,
        type: 'run.failed',
        error: record.error as { code: string; message: string },
      }
    case 'run.cancelled':
      return { ...base, type: 'run.cancelled' }
  }
}

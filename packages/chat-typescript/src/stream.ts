import type { Identity, IdentityWire } from './identity'

export type StreamTargetType = 'message' | 'reasoning'

export type StreamError = {
  code: string
  message: string
}

export type StreamStartFrame = {
  eventId: string
  threadId: string
  runId: string
  targetType: StreamTargetType
  author: Identity
}

export type StreamStartFrameWire = {
  event_id: string
  thread_id: string
  run_id: string
  target_type: StreamTargetType
  author: IdentityWire
}

export type StreamDeltaFrame = {
  eventId: string
  threadId: string
  text: string
}

export type StreamDeltaFrameWire = {
  event_id: string
  thread_id: string
  text: string
}

export type StreamEndFrame = {
  eventId: string
  threadId: string
  error?: StreamError | null
}

export type StreamEndFrameWire = {
  event_id: string
  thread_id: string
  error?: StreamError | null
}

import type { Identity, IdentityWire } from './identity'
import { parseIdentity } from './identity'

export type PresenceSnapshot = { members: Identity[] }
export type PresenceJoinedFrame = { identity: Identity; at: string }
export type PresenceLeftFrame = { identity: Identity; at: string }

export type PresenceSnapshotWire = { members: IdentityWire[] }
export type PresenceJoinedFrameWire = { identity: IdentityWire; at: string }
export type PresenceLeftFrameWire = { identity: IdentityWire; at: string }

export function parsePresenceSnapshot(raw: unknown): PresenceSnapshot {
  if (typeof raw !== 'object' || raw === null) {
    throw new Error(`invalid presence snapshot: ${JSON.stringify(raw)}`)
  }
  const record = raw as Record<string, unknown>
  if (!Array.isArray(record.members)) {
    throw new Error(`invalid presence snapshot members: ${JSON.stringify(raw)}`)
  }
  return { members: record.members.map(parseIdentity) }
}

export function parsePresenceJoinedFrame(raw: unknown): PresenceJoinedFrame {
  if (typeof raw !== 'object' || raw === null) {
    throw new Error(`invalid presence joined frame: ${JSON.stringify(raw)}`)
  }
  const record = raw as Record<string, unknown>
  if (typeof record.at !== 'string') {
    throw new Error(`invalid presence joined frame at: ${JSON.stringify(raw)}`)
  }
  return { identity: parseIdentity(record.identity), at: record.at }
}

export function parsePresenceLeftFrame(raw: unknown): PresenceLeftFrame {
  if (typeof raw !== 'object' || raw === null) {
    throw new Error(`invalid presence left frame: ${JSON.stringify(raw)}`)
  }
  const record = raw as Record<string, unknown>
  if (typeof record.at !== 'string') {
    throw new Error(`invalid presence left frame at: ${JSON.stringify(raw)}`)
  }
  return { identity: parseIdentity(record.identity), at: record.at }
}

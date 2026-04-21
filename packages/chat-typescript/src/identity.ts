export type IdentityRole = 'user' | 'assistant' | 'system'

export type UserIdentity = {
  role: 'user'
  id: string
  name: string
  metadata: Record<string, unknown>
}

export type AssistantIdentity = {
  role: 'assistant'
  id: string
  name: string
  metadata: Record<string, unknown>
}

export type SystemIdentity = {
  role: 'system'
  id: string
  name: string
  metadata: Record<string, unknown>
}

export type Identity = UserIdentity | AssistantIdentity | SystemIdentity

export type IdentityWire = {
  role: IdentityRole
  id: string
  name: string
  metadata: Record<string, unknown>
}

const IDENTITY_ROLES: ReadonlySet<IdentityRole> = new Set(['user', 'assistant', 'system'])

export function isIdentity(value: unknown): value is Identity {
  if (typeof value !== 'object' || value === null) return false
  const record = value as Record<string, unknown>
  if (typeof record.role !== 'string' || !IDENTITY_ROLES.has(record.role as IdentityRole)) {
    return false
  }
  if (typeof record.id !== 'string' || typeof record.name !== 'string') return false
  if (typeof record.metadata !== 'object' || record.metadata === null) return false
  return true
}

export function parseIdentity(raw: unknown): Identity {
  if (!isIdentity(raw)) {
    throw new Error(`invalid identity: ${JSON.stringify(raw)}`)
  }
  return raw
}

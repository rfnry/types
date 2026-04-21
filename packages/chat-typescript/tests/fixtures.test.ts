import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { parseEvent } from '../src/event'
import { parseIdentity } from '../src/identity'

const FIXTURES_ROOT = fileURLToPath(new URL('../../../fixtures', import.meta.url))

function walk(dir: string): string[] {
  const out: string[] = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) {
      out.push(...walk(full))
    } else if (entry.endsWith('.json')) {
      out.push(full)
    }
  }
  return out.sort()
}

type Meta = { model: string }

const EVENT_MODELS: ReadonlySet<string> = new Set([
  'event.MessageEvent',
  'event.ReasoningEvent',
  'event.ToolCallEvent',
  'event.ToolResultEvent',
  'event.ThreadCreatedEvent',
  'event.ThreadMemberAddedEvent',
  'event.ThreadMemberRemovedEvent',
  'event.ThreadTenantChangedEvent',
  'event.RunStartedEvent',
  'event.RunCompletedEvent',
  'event.RunFailedEvent',
  'event.RunCancelledEvent',
])

const IDENTITY_MODELS: ReadonlySet<string> = new Set([
  'identity.UserIdentity',
  'identity.AssistantIdentity',
  'identity.SystemIdentity',
  'identity.Identity',
])

describe('fixtures round-trip', () => {
  const paths = walk(FIXTURES_ROOT)

  it('finds fixtures under the shared directory', () => {
    expect(paths.length).toBeGreaterThan(0)
  })

  for (const path of paths) {
    const relative = path.slice(FIXTURES_ROOT.length + 1)
    it(`${relative} has __meta__ and parses structurally`, () => {
      const raw = JSON.parse(readFileSync(path, 'utf8')) as Record<string, unknown>
      const meta = raw.__meta__ as Meta | undefined
      expect(meta, `${relative}: missing __meta__`).toBeDefined()
      const { __meta__: _discard, ...body } = raw
      void _discard

      const restringified = JSON.parse(JSON.stringify(body))
      expect(restringified).toEqual(body)

      const model = meta!.model
      if (EVENT_MODELS.has(model)) {
        expect(() => parseEvent(body)).not.toThrow()
      } else if (IDENTITY_MODELS.has(model)) {
        expect(() => parseIdentity(body)).not.toThrow()
      }
    })
  }
})

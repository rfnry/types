# rfnry/chat protocol

Shared protocol types for rfnry/chat.

## Packages

- `packages/chat-python` — Pydantic v2 models. Published as `rfnry-chat-protocol` on PyPI.
- `packages/chat-typescript` — TypeScript types + wire mappers. Published as `@rfnry/chat-protocol` on npm.

Both packages mirror the same shapes. Field names follow each language's idiom (snake_case in Python, camelCase in TS in-memory; snake_case on the wire for both).

## Contract

`fixtures/` is the source of truth for wire format. Every model that crosses the wire has at least one JSON fixture under `fixtures/<category>/<name>.json`. Each fixture has a `__meta__` block naming the model it represents.

Both packages run a fixture round-trip test:

1. Load each fixture.
2. Parse into the native model.
3. Re-serialize back to the wire shape.
4. Assert structural equality.

If you change a model on one side, the other side's fixture round-trip fails. That is the whole point.

## Development

Python:

```bash
cd packages/chat-python
uv sync --extra dev
uv run poe dev
```

TypeScript:

```bash
cd packages/chat-typescript
npm install
npm run check
npm run typecheck
npm test
npm run build
```

## Releases

Each package versions independently. PyPI: `rfnry-chat-protocol`. npm: `@rfnry/chat-protocol`.

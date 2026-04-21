from __future__ import annotations

import json
from collections.abc import Callable
from pathlib import Path
from typing import Any

from rfnry_chat_protocol import (
    AssistantIdentity,
    AudioPart,
    DocumentPart,
    FormPart,
    ImagePart,
    Run,
    StreamDeltaFrame,
    StreamEndFrame,
    StreamStartFrame,
    SystemIdentity,
    TextPart,
    Thread,
    ThreadMember,
    UserIdentity,
    parse_content_part,
    parse_event,
    parse_identity,
)

FIXTURES_ROOT = Path(__file__).resolve().parents[3] / "fixtures"

_PARSERS: dict[str, Callable[[dict[str, Any]], Any]] = {
    "identity.UserIdentity": UserIdentity.model_validate,
    "identity.AssistantIdentity": AssistantIdentity.model_validate,
    "identity.SystemIdentity": SystemIdentity.model_validate,
    "identity.Identity": parse_identity,
    "content.TextPart": TextPart.model_validate,
    "content.ImagePart": ImagePart.model_validate,
    "content.AudioPart": AudioPart.model_validate,
    "content.DocumentPart": DocumentPart.model_validate,
    "content.FormPart": FormPart.model_validate,
    "content.ContentPart": parse_content_part,
    "thread.Thread": Thread.model_validate,
    "thread.ThreadMember": ThreadMember.model_validate,
    "run.Run": Run.model_validate,
    "stream.StreamStartFrame": StreamStartFrame.model_validate,
    "stream.StreamDeltaFrame": StreamDeltaFrame.model_validate,
    "stream.StreamEndFrame": StreamEndFrame.model_validate,
    "event.MessageEvent": parse_event,
    "event.ReasoningEvent": parse_event,
    "event.ToolCallEvent": parse_event,
    "event.ToolResultEvent": parse_event,
    "event.ThreadCreatedEvent": parse_event,
    "event.ThreadMemberAddedEvent": parse_event,
    "event.ThreadMemberRemovedEvent": parse_event,
    "event.ThreadTenantChangedEvent": parse_event,
    "event.RunStartedEvent": parse_event,
    "event.RunCompletedEvent": parse_event,
    "event.RunFailedEvent": parse_event,
    "event.RunCancelledEvent": parse_event,
}


def _iter_fixtures() -> list[Path]:
    return sorted(p for p in FIXTURES_ROOT.rglob("*.json") if p.is_file())


def test_fixture_directory_exists() -> None:
    assert FIXTURES_ROOT.is_dir()
    assert _iter_fixtures(), f"no fixtures found under {FIXTURES_ROOT}"


def test_every_fixture_roundtrips_through_python_models() -> None:
    failures: list[str] = []
    for path in _iter_fixtures():
        raw = json.loads(path.read_text())
        meta = raw.pop("__meta__", None)
        if meta is None:
            failures.append(f"{path}: missing __meta__")
            continue
        model_key = meta.get("model")
        parser = _PARSERS.get(model_key)
        if parser is None:
            failures.append(f"{path}: unknown model {model_key!r}")
            continue
        try:
            parsed = parser(raw)
            redumped = parsed.model_dump(mode="json", by_alias=True)
        except Exception as exc:
            failures.append(f"{path}: parse/dump failed: {exc!r}")
            continue
        if redumped != raw:
            failures.append(f"{path}: roundtrip mismatch\n  original={raw}\n  redumped={redumped}")
    assert not failures, "\n".join(failures)

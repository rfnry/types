from datetime import UTC, datetime

import pytest
from pydantic import ValidationError

from rfnry_chat_protocol.content import TextPart
from rfnry_chat_protocol.event import (
    EventDraft,
    MessageEvent,
    ReasoningEvent,
    RunCancelledEvent,
    RunCompletedEvent,
    RunFailedEvent,
    RunStartedEvent,
    ThreadCreatedEvent,
    ThreadMemberAddedEvent,
    ThreadMemberRemovedEvent,
    ThreadTenantChangedEvent,
    ToolCall,
    ToolCallEvent,
    ToolResult,
    ToolResultEvent,
    parse_event,
)
from rfnry_chat_protocol.identity import UserIdentity


def _user() -> UserIdentity:
    return UserIdentity(id="u_1", name="Alice")


def test_message_event_roundtrip() -> None:
    msg = MessageEvent(
        id="evt_1",
        thread_id="t_1",
        author=_user(),
        created_at=datetime.now(UTC),
        content=[TextPart(text="hi")],
    )
    parsed = parse_event(msg.model_dump(mode="json"))
    assert isinstance(parsed, MessageEvent)
    assert parsed.content[0].text == "hi"  # type: ignore[union-attr]


def test_thread_tenant_changed_uses_from_alias() -> None:
    evt = ThreadTenantChangedEvent.model_validate({
        "id": "evt_1",
        "thread_id": "t_1",
        "author": _user().model_dump(mode="json"),
        "created_at": datetime.now(UTC).isoformat(),
        "type": "thread.tenant_changed",
        "from": {"org": "a"},
        "to": {"org": "b"},
    })
    assert evt.from_ == {"org": "a"}
    dumped = evt.model_dump(mode="json", by_alias=True)
    assert "from" in dumped
    assert "from_" not in dumped


def test_parse_event_dispatches_by_type() -> None:
    for type_name, payload_extra in [
        ("message", {"content": [{"type": "text", "text": "hi"}]}),
        ("reasoning", {"content": "thinking"}),
        ("tool.call", {"tool": {"id": "c_1", "name": "f", "arguments": {}}}),
        ("tool.result", {"tool": {"id": "c_1", "result": "ok"}}),
        ("thread.member_added", {"member": _user().model_dump(mode="json")}),
        ("thread.member_removed", {"member": _user().model_dump(mode="json")}),
        ("run.started", {}),
        ("run.completed", {}),
        ("run.cancelled", {}),
    ]:
        raw = {
            "id": "evt_1",
            "thread_id": "t_1",
            "author": _user().model_dump(mode="json"),
            "created_at": datetime.now(UTC).isoformat(),
            "type": type_name,
            **payload_extra,
        }
        parsed = parse_event(raw)
        assert parsed.type == type_name


def test_parse_event_rejects_unknown_type() -> None:
    with pytest.raises(ValidationError):
        parse_event({
            "id": "evt_1",
            "thread_id": "t_1",
            "author": _user().model_dump(mode="json"),
            "created_at": datetime.now(UTC).isoformat(),
            "type": "unknown",
        })


def test_event_draft_optional_fields() -> None:
    draft = EventDraft(client_id="c_1")
    assert draft.content is None
    assert draft.recipients is None


def test_tool_call_and_result_shapes() -> None:
    call = ToolCall(id="c_1", name="f", arguments={"x": 1})
    assert call.arguments == {"x": 1}
    result = ToolResult(id="c_1", result={"ok": True})
    assert result.error is None

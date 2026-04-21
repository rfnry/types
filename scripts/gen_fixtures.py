from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from rfnry_chat_protocol import (
    AssistantIdentity,
    AudioPart,
    DocumentPart,
    FormPart,
    ImagePart,
    MessageEvent,
    ReasoningEvent,
    Run,
    RunCancelledEvent,
    RunCompletedEvent,
    RunError,
    RunFailedEvent,
    RunStartedEvent,
    StreamDeltaFrame,
    StreamEndFrame,
    StreamError,
    StreamStartFrame,
    SystemIdentity,
    TextPart,
    Thread,
    ThreadCreatedEvent,
    ThreadMember,
    ThreadMemberAddedEvent,
    ThreadMemberRemovedEvent,
    ThreadTenantChangedEvent,
    ToolCall,
    ToolCallEvent,
    ToolResult,
    ToolResultEvent,
    UserIdentity,
)
from rfnry_chat_protocol.event import _EventError, _ThreadCreatedPayload

ROOT = Path(__file__).resolve().parents[1]
FIXTURES = ROOT / "fixtures"

TS = datetime(2026, 4, 21, 12, 0, 0, tzinfo=timezone.utc)
TS_LATER = datetime(2026, 4, 21, 12, 0, 5, tzinfo=timezone.utc)

ALICE = UserIdentity(id="u_fixture_alice", name="Alice")
HELPER = AssistantIdentity(id="a_fixture_helper", name="Helper")
SYSTEM = SystemIdentity(id="s_fixture_system", name="system")


def write(path: Path, model: str, data: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    payload = {"__meta__": {"model": model}, **data}
    path.write_text(json.dumps(payload, indent=2) + "\n")


def dump(model: Any) -> dict[str, Any]:
    return model.model_dump(mode="json", by_alias=True)


def main() -> None:
    write(FIXTURES / "identities" / "user.json", "identity.UserIdentity", dump(ALICE))
    write(FIXTURES / "identities" / "assistant.json", "identity.AssistantIdentity", dump(HELPER))
    write(FIXTURES / "identities" / "system.json", "identity.SystemIdentity", dump(SYSTEM))

    write(
        FIXTURES / "content" / "text.json",
        "content.TextPart",
        dump(TextPart(text="hello world")),
    )
    write(
        FIXTURES / "content" / "image.json",
        "content.ImagePart",
        dump(
            ImagePart(
                url="https://cdn.example.com/fixture.png",
                mime="image/png",
                name="fixture.png",
                size=2048,
            )
        ),
    )
    write(
        FIXTURES / "content" / "audio.json",
        "content.AudioPart",
        dump(
            AudioPart(
                url="https://cdn.example.com/fixture.mp3",
                mime="audio/mpeg",
                name="fixture.mp3",
                size=4096,
                duration_ms=12000,
            )
        ),
    )
    write(
        FIXTURES / "content" / "document.json",
        "content.DocumentPart",
        dump(
            DocumentPart(
                url="https://cdn.example.com/fixture.pdf",
                mime="application/pdf",
                name="fixture.pdf",
                size=8192,
            )
        ),
    )
    write(
        FIXTURES / "content" / "form.json",
        "content.FormPart",
        dump(
            FormPart.model_validate(
                {
                    "type": "form",
                    "form_id": "f_fixture_1",
                    "schema": {
                        "type": "object",
                        "properties": {"email": {"type": "string"}},
                    },
                    "status": "pending",
                    "values": None,
                    "answers_event_id": None,
                    "title": "Contact info",
                    "description": "Tell us how to reach you.",
                }
            )
        ),
    )

    thread = Thread(
        id="t_fixture_1",
        tenant={"org": "acme"},
        metadata={"color": "blue"},
        created_at=TS,
        updated_at=TS_LATER,
    )
    write(FIXTURES / "threads" / "thread.json", "thread.Thread", dump(thread))

    member = ThreadMember(
        thread_id="t_fixture_1",
        identity_id="u_fixture_alice",
        identity=ALICE,
        role="member",
        added_at=TS,
        added_by=HELPER,
    )
    write(FIXTURES / "thread_members" / "member.json", "thread.ThreadMember", dump(member))

    running = Run(
        id="run_fixture_running",
        thread_id="t_fixture_1",
        assistant=HELPER,
        triggered_by=ALICE,
        status="running",
        started_at=TS,
    )
    write(FIXTURES / "runs" / "running.json", "run.Run", dump(running))

    completed = Run(
        id="run_fixture_completed",
        thread_id="t_fixture_1",
        assistant=HELPER,
        triggered_by=ALICE,
        status="completed",
        started_at=TS,
        completed_at=TS_LATER,
        idempotency_key="idem_fixture_1",
    )
    write(FIXTURES / "runs" / "completed.json", "run.Run", dump(completed))

    failed = Run(
        id="run_fixture_failed",
        thread_id="t_fixture_1",
        assistant=HELPER,
        triggered_by=ALICE,
        status="failed",
        started_at=TS,
        completed_at=TS_LATER,
        error=RunError(code="timeout", message="exceeded 120s"),
    )
    write(FIXTURES / "runs" / "failed.json", "run.Run", dump(failed))

    cancelled = Run(
        id="run_fixture_cancelled",
        thread_id="t_fixture_1",
        assistant=HELPER,
        triggered_by=ALICE,
        status="cancelled",
        started_at=TS,
        completed_at=TS_LATER,
    )
    write(FIXTURES / "runs" / "cancelled.json", "run.Run", dump(cancelled))

    write(
        FIXTURES / "stream_frames" / "start.json",
        "stream.StreamStartFrame",
        dump(
            StreamStartFrame(
                event_id="evt_fixture_stream_1",
                thread_id="t_fixture_1",
                run_id="run_fixture_running",
                target_type="message",
                author=HELPER,
            )
        ),
    )
    write(
        FIXTURES / "stream_frames" / "delta.json",
        "stream.StreamDeltaFrame",
        dump(
            StreamDeltaFrame(
                event_id="evt_fixture_stream_1",
                thread_id="t_fixture_1",
                text="hello ",
            )
        ),
    )
    write(
        FIXTURES / "stream_frames" / "end.json",
        "stream.StreamEndFrame",
        dump(StreamEndFrame(event_id="evt_fixture_stream_1", thread_id="t_fixture_1")),
    )
    write(
        FIXTURES / "stream_frames" / "end_error.json",
        "stream.StreamEndFrame",
        dump(
            StreamEndFrame(
                event_id="evt_fixture_stream_1",
                thread_id="t_fixture_1",
                error=StreamError(code="upstream_timeout", message="model timed out"),
            )
        ),
    )

    write(
        FIXTURES / "events" / "message.json",
        "event.MessageEvent",
        dump(
            MessageEvent(
                id="evt_fixture_message",
                thread_id="t_fixture_1",
                author=ALICE,
                created_at=TS,
                client_id="c_fixture_message",
                content=[TextPart(text="hello")],
            )
        ),
    )
    write(
        FIXTURES / "events" / "reasoning.json",
        "event.ReasoningEvent",
        dump(
            ReasoningEvent(
                id="evt_fixture_reasoning",
                thread_id="t_fixture_1",
                run_id="run_fixture_running",
                author=HELPER,
                created_at=TS,
                content="considering options",
            )
        ),
    )
    write(
        FIXTURES / "events" / "tool_call.json",
        "event.ToolCallEvent",
        dump(
            ToolCallEvent(
                id="evt_fixture_tool_call",
                thread_id="t_fixture_1",
                run_id="run_fixture_running",
                author=HELPER,
                created_at=TS,
                tool=ToolCall(id="c_fixture_1", name="lookup", arguments={"q": "weather"}),
            )
        ),
    )
    write(
        FIXTURES / "events" / "tool_result.json",
        "event.ToolResultEvent",
        dump(
            ToolResultEvent(
                id="evt_fixture_tool_result",
                thread_id="t_fixture_1",
                run_id="run_fixture_running",
                author=HELPER,
                created_at=TS,
                tool=ToolResult(id="c_fixture_1", result={"temperature": 72}),
            )
        ),
    )
    write(
        FIXTURES / "events" / "thread_created.json",
        "event.ThreadCreatedEvent",
        dump(
            ThreadCreatedEvent(
                id="evt_fixture_thread_created",
                thread_id="t_fixture_1",
                author=ALICE,
                created_at=TS,
                thread=_ThreadCreatedPayload(id="t_fixture_1", tenant={"org": "acme"}),
            )
        ),
    )
    write(
        FIXTURES / "events" / "thread_member_added.json",
        "event.ThreadMemberAddedEvent",
        dump(
            ThreadMemberAddedEvent(
                id="evt_fixture_member_added",
                thread_id="t_fixture_1",
                author=HELPER,
                created_at=TS,
                member=ALICE,
            )
        ),
    )
    write(
        FIXTURES / "events" / "thread_member_removed.json",
        "event.ThreadMemberRemovedEvent",
        dump(
            ThreadMemberRemovedEvent(
                id="evt_fixture_member_removed",
                thread_id="t_fixture_1",
                author=HELPER,
                created_at=TS,
                member=ALICE,
            )
        ),
    )
    write(
        FIXTURES / "events" / "thread_tenant_changed.json",
        "event.ThreadTenantChangedEvent",
        dump(
            ThreadTenantChangedEvent.model_validate(
                {
                    "id": "evt_fixture_tenant_changed",
                    "thread_id": "t_fixture_1",
                    "author": HELPER.model_dump(mode="json", by_alias=True),
                    "created_at": TS.isoformat().replace("+00:00", "Z"),
                    "type": "thread.tenant_changed",
                    "from": {"org": "acme"},
                    "to": {"org": "acme", "ws": "engineering"},
                }
            )
        ),
    )
    write(
        FIXTURES / "events" / "run_started.json",
        "event.RunStartedEvent",
        dump(
            RunStartedEvent(
                id="evt_fixture_run_started",
                thread_id="t_fixture_1",
                run_id="run_fixture_running",
                author=HELPER,
                created_at=TS,
            )
        ),
    )
    write(
        FIXTURES / "events" / "run_completed.json",
        "event.RunCompletedEvent",
        dump(
            RunCompletedEvent(
                id="evt_fixture_run_completed",
                thread_id="t_fixture_1",
                run_id="run_fixture_running",
                author=HELPER,
                created_at=TS_LATER,
            )
        ),
    )
    write(
        FIXTURES / "events" / "run_failed.json",
        "event.RunFailedEvent",
        dump(
            RunFailedEvent(
                id="evt_fixture_run_failed",
                thread_id="t_fixture_1",
                run_id="run_fixture_running",
                author=HELPER,
                created_at=TS_LATER,
                error=_EventError(code="upstream_timeout", message="model timed out"),
            )
        ),
    )
    write(
        FIXTURES / "events" / "run_cancelled.json",
        "event.RunCancelledEvent",
        dump(
            RunCancelledEvent(
                id="evt_fixture_run_cancelled",
                thread_id="t_fixture_1",
                run_id="run_fixture_running",
                author=ALICE,
                created_at=TS_LATER,
            )
        ),
    )


if __name__ == "__main__":
    main()

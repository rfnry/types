from datetime import UTC, datetime

from rfnry_chat_protocol import (
    AssistantIdentity,
    PresenceJoinedFrame,
    PresenceLeftFrame,
    PresenceSnapshot,
    UserIdentity,
)


def test_presence_snapshot_round_trips():
    snap = PresenceSnapshot(
        members=[
            UserIdentity(id="u_a", name="Alice", metadata={}),
            AssistantIdentity(id="agent-a", name="Agent A", metadata={}),
        ]
    )
    payload = snap.model_dump(mode="json", by_alias=True)
    parsed = PresenceSnapshot.model_validate(payload)
    assert {m.id for m in parsed.members} == {"u_a", "agent-a"}
    by_id = {m.id: m for m in parsed.members}
    assert isinstance(by_id["u_a"], UserIdentity)
    assert isinstance(by_id["agent-a"], AssistantIdentity)


def test_presence_joined_frame_round_trips():
    frame = PresenceJoinedFrame(
        identity=UserIdentity(id="u_a", name="Alice", metadata={}),
        at=datetime(2026, 4, 23, 12, 0, tzinfo=UTC),
    )
    payload = frame.model_dump(mode="json", by_alias=True)
    parsed = PresenceJoinedFrame.model_validate(payload)
    assert parsed.identity.id == "u_a"
    assert parsed.at == frame.at


def test_presence_left_frame_round_trips():
    frame = PresenceLeftFrame(
        identity=AssistantIdentity(id="agent-a", name="Agent A", metadata={}),
        at=datetime(2026, 4, 23, 12, 5, tzinfo=UTC),
    )
    payload = frame.model_dump(mode="json", by_alias=True)
    parsed = PresenceLeftFrame.model_validate(payload)
    assert parsed.identity.id == "agent-a"
    assert parsed.at == frame.at

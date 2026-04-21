from datetime import UTC, datetime

from rfnry_chat_protocol import (
    AssistantIdentity,
    Thread,
    ThreadInvitedFrame,
    UserIdentity,
)


def test_thread_invited_frame_roundtrip_json() -> None:
    now = datetime.now(UTC)
    thread = Thread(id="th_1", tenant={"org": "A"}, metadata={}, created_at=now, updated_at=now)
    alice = UserIdentity(id="u_alice", name="Alice", metadata={})
    bot = AssistantIdentity(id="a_bot", name="Bot", metadata={})

    frame = ThreadInvitedFrame(thread=thread, added_member=alice, added_by=bot)
    raw = frame.model_dump(mode="json")
    assert raw["thread"]["id"] == "th_1"
    assert raw["added_member"]["id"] == "u_alice"
    assert raw["added_by"]["id"] == "a_bot"

    parsed = ThreadInvitedFrame.model_validate(raw)
    assert parsed.thread.id == "th_1"
    assert parsed.added_member.id == "u_alice"
    assert parsed.added_by.id == "a_bot"

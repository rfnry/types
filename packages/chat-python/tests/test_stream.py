from rfnry_chat_protocol.identity import AssistantIdentity, UserIdentity
from rfnry_chat_protocol.stream import (
    StreamDeltaFrame,
    StreamEndFrame,
    StreamError,
    StreamStartFrame,
)


def test_stream_start_frame() -> None:
    assistant = AssistantIdentity(id="a_1", name="A")
    frame = StreamStartFrame(
        event_id="evt_1",
        thread_id="t_1",
        run_id="run_1",
        target_type="message",
        author=assistant,
    )
    assert frame.target_type == "message"


def test_stream_start_frame_accepts_any_identity() -> None:
    user = UserIdentity(id="u_alice", name="Alice", metadata={})
    frame = StreamStartFrame(
        event_id="evt_1",
        thread_id="t_1",
        run_id="run_1",
        target_type="message",
        author=user,
    )
    assert frame.author.id == "u_alice"
    assert frame.author.role == "user"


def test_stream_delta_frame() -> None:
    frame = StreamDeltaFrame(event_id="evt_1", thread_id="t_1", text="hello")
    assert frame.text == "hello"


def test_stream_end_frame_optional_error() -> None:
    ok = StreamEndFrame(event_id="evt_1", thread_id="t_1")
    assert ok.error is None
    failed = StreamEndFrame(
        event_id="evt_1",
        thread_id="t_1",
        error=StreamError(code="boom", message="bad"),
    )
    assert failed.error is not None
    assert failed.error.code == "boom"

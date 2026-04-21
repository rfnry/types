from datetime import UTC, datetime

import pytest
from pydantic import ValidationError

from rfnry_chat_protocol.identity import AssistantIdentity, UserIdentity
from rfnry_chat_protocol.run import Run, RunError


def test_run_minimal() -> None:
    assistant = AssistantIdentity(id="a_1", name="A")
    user = UserIdentity(id="u_1", name="U")
    run = Run(
        id="run_1",
        thread_id="t_1",
        assistant=assistant,
        triggered_by=user,
        status="running",
        started_at=datetime.now(UTC),
    )
    assert run.completed_at is None
    assert run.error is None


def test_run_error_shape() -> None:
    err = RunError(code="timeout", message="exceeded 120s")
    assert err.code == "timeout"


def test_run_rejects_invalid_status() -> None:
    assistant = AssistantIdentity(id="a_1", name="A")
    user = UserIdentity(id="u_1", name="U")
    with pytest.raises(ValidationError):
        Run(
            id="run_1",
            thread_id="t_1",
            assistant=assistant,
            triggered_by=user,
            status="unknown",  # type: ignore[arg-type]
            started_at=datetime.now(UTC),
        )

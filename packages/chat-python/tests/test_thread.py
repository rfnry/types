from datetime import UTC, datetime

import pytest
from pydantic import ValidationError

from rfnry_chat_protocol.identity import UserIdentity
from rfnry_chat_protocol.thread import Thread, ThreadMember, ThreadPatch


def test_thread_defaults_tenant_and_metadata() -> None:
    now = datetime.now(UTC)
    thread = Thread(id="t_1", created_at=now, updated_at=now)
    assert thread.tenant == {}
    assert thread.metadata == {}


def test_thread_patch_allows_partial() -> None:
    patch = ThreadPatch()
    assert patch.tenant is None
    assert patch.metadata is None


def test_thread_member_requires_identity() -> None:
    now = datetime.now(UTC)
    user = UserIdentity(id="u_1", name="Alice")
    member = ThreadMember(
        thread_id="t_1",
        identity_id="u_1",
        identity=user,
        added_at=now,
        added_by=user,
    )
    assert member.role == "member"


def test_thread_rejects_unknown_fields() -> None:
    now = datetime.now(UTC)
    with pytest.raises(ValidationError):
        Thread.model_validate({"id": "t_1", "created_at": now, "updated_at": now, "extra": "x"})

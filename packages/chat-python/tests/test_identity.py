import pytest
from pydantic import ValidationError

from rfnry_chat_protocol.identity import (
    AssistantIdentity,
    SystemIdentity,
    UserIdentity,
    parse_identity,
)


def test_user_identity_defaults_role_to_user() -> None:
    identity = UserIdentity(id="u_1", name="Alice")
    assert identity.role == "user"
    assert identity.metadata == {}


def test_assistant_identity_defaults_role_to_assistant() -> None:
    identity = AssistantIdentity(id="a_1", name="Helper")
    assert identity.role == "assistant"


def test_system_identity_defaults_role_to_system() -> None:
    identity = SystemIdentity(id="s_1", name="system")
    assert identity.role == "system"


def test_identity_rejects_unknown_fields() -> None:
    with pytest.raises(ValidationError):
        UserIdentity.model_validate({"id": "u_1", "name": "Alice", "extra": "x"})


def test_parse_identity_dispatches_by_role() -> None:
    user = parse_identity({"role": "user", "id": "u_1", "name": "Alice", "metadata": {}})
    assistant = parse_identity({"role": "assistant", "id": "a_1", "name": "Helper", "metadata": {}})
    system = parse_identity({"role": "system", "id": "s_1", "name": "sys", "metadata": {}})

    assert isinstance(user, UserIdentity)
    assert isinstance(assistant, AssistantIdentity)
    assert isinstance(system, SystemIdentity)


def test_parse_identity_rejects_unknown_role() -> None:
    with pytest.raises(ValidationError):
        parse_identity({"role": "alien", "id": "x", "name": "x", "metadata": {}})

from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict

from rfnry_chat_protocol.identity import Identity


class PresenceSnapshot(BaseModel):
    """Initial snapshot of identities currently online within a tenant scope."""

    model_config = ConfigDict(populate_by_name=True)

    members: list[Identity]


class PresenceJoinedFrame(BaseModel):
    """Transient frame: an identity went from 0 to 1 active sockets."""

    model_config = ConfigDict(populate_by_name=True)

    identity: Identity
    at: datetime


class PresenceLeftFrame(BaseModel):
    """Transient frame: an identity went from 1 to 0 active sockets."""

    model_config = ConfigDict(populate_by_name=True)

    identity: Identity
    at: datetime

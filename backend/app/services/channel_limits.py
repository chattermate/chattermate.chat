"""
Copyright 2024-2026 ChatterMate

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

How many accounts of one channel an org may connect: the plan's numeric limit
on cloud (``max_whatsapp_numbers``), no limit on community installs or when the
plan sets none. Like channel_access, only a new account is checked: one that is
already connected can always be refreshed, and a plan that drops below what an
org has keeps every account it connected.
"""

from typing import Dict, Optional
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.channels.channel_account import ChannelType
from app.repositories.channels.accounts import ChannelAccountRepository
from app.services.feature_gate import feature_limit

# Channel type -> the plan key that caps it. Channels absent here are uncapped.
ACCOUNT_LIMIT_FEATURES: Dict[str, str] = {
    ChannelType.WHATSAPP.value: "max_whatsapp_numbers",
}

# How a limit names the thing it counts, singular and plural
_NOUNS: Dict[str, tuple] = {
    ChannelType.WHATSAPP.value: ("WhatsApp number", "WhatsApp numbers"),
}


def account_cap(db: Session, organization_id: UUID, channel_type: str) -> Optional[int]:
    """The most accounts of `channel_type` the org may connect, or None for no
    limit. Raises like feature_limit when the org has no accessible plan."""
    key = ACCOUNT_LIMIT_FEATURES.get(channel_type)
    return feature_limit(db, organization_id, key) if key else None


def limit_message(channel_type: str, cap: int) -> str:
    singular, plural = _NOUNS.get(channel_type, ("account", "accounts"))
    noun = singular if cap == 1 else plural
    return f"Your plan includes {cap} {noun}. Upgrade to connect another."


def check_account_quota(db: Session, organization_id: UUID, channel_type: str) -> None:
    """403 when connecting one more account of `channel_type` would pass the
    plan's limit. Call it only for an account the org has not connected yet."""
    cap = account_cap(db, organization_id, channel_type)
    if cap is None:
        return
    connected = len(ChannelAccountRepository(db).list_by_org(organization_id, channel_type))
    if connected >= cap:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
                            detail=limit_message(channel_type, cap))


def display_caps(db: Session, organization_id: UUID) -> Dict[str, Optional[int]]:
    """{channel_type: cap or None} for every capped channel, for the settings
    screen. Never raises: an org with no accessible plan sees a cap of 0, the
    same as it may connect."""
    caps: Dict[str, Optional[int]] = {}
    for channel_type in ACCOUNT_LIMIT_FEATURES:
        try:
            caps[channel_type] = account_cap(db, organization_id, channel_type)
        except HTTPException:
            caps[channel_type] = 0
    return caps

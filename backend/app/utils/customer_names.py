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
"""

"""The stand-in name a channel person carries until we learn their real one.

placeholder_name builds it and is_placeholder_name recognises it. They live
together on purpose: the two only work if they agree exactly, and the day the
format changes in one place only, every real-name upgrade silently stops.
"""

from typing import Optional

from app.models.channels import ChannelType

PLACEHOLDER_SUFFIX = " user "
PLACEHOLDER_ID_CHARS = 8


def placeholder_name(channel_type: str, external_user_id: str) -> str:
    """'Line user U56cf1f8': the channel and the start of the platform id."""
    return f"{channel_type.capitalize()}{PLACEHOLDER_SUFFIX}{external_user_id[:PLACEHOLDER_ID_CHARS]}"


def is_placeholder_name(name: Optional[str], channel_type: Optional[str] = None) -> bool:
    """True when the stored name is empty or a synthesized '<Channel> user xxxx'.

    With channel_type, only that channel's placeholder counts. Without it, any
    known channel's does, for callers that only hold the customer (lead
    capture, a manual edit).
    """
    if not (name or "").strip():
        return True
    if channel_type is not None:
        return name.startswith(f"{channel_type.capitalize()}{PLACEHOLDER_SUFFIX}")
    return any(name.startswith(f"{c.value.capitalize()}{PLACEHOLDER_SUFFIX}") for c in ChannelType)

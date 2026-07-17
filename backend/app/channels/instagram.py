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

from typing import ClassVar

from app.channels.messenger import MessengerAdapter
from app.channels.registry import register_adapter
from app.models.channels import ChannelType

# Instagram DM uses the same Messenger Platform envelope (entry[].messaging[],
# sender.id = IGSID) and the same `me/messages` Graph send with the linked
# page token, so the only difference from Messenger is the channel identity.


class InstagramAdapter(MessengerAdapter):
    channel_type: ClassVar[str] = ChannelType.INSTAGRAM.value
    # An IG user node exposes name/username, not the Messenger first/last name.
    profile_fields: ClassVar[str] = "name,username"

    @staticmethod
    def _display_name(data: dict) -> str:
        return (data.get("name") or data.get("username") or "").strip()


register_adapter(InstagramAdapter())

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

from typing import ClassVar, List, Optional

from app.channels.interactive_limits import INSTAGRAM_LIMITS, InteractiveLimits
from app.channels.messenger import MessengerAdapter
from app.channels.meta_base import GRAPH_BASE, GRAPH_INSTAGRAM_BASE
from app.channels.registry import register_adapter
from app.models.channels import ChannelAccount, ChannelType

# Instagram DM uses the same Messenger Platform envelope (entry[].messaging[],
# sender.id = IGSID) and the same `me/messages` send shape, so it subclasses
# Messenger. What differs is the host and the credential: most accounts connect
# through Instagram Login, which yields an Instagram user token rather than a
# Facebook Page token. An account connected by hand uses its linked Page's
# token instead, which only the Facebook graph accepts; it records that Page.

# In the account's (non-secret) settings: the linked Facebook Page whose token
# it holds, for an account connected with a Page token
PAGE_ID_SETTING = "page_id"


class InstagramAdapter(MessengerAdapter):
    channel_type: ClassVar[str] = ChannelType.INSTAGRAM.value
    # An Instagram user token is only accepted by graph.instagram.com; the
    # Facebook graph rejects it, so sends and profile lookups go here instead.
    graph_base: ClassVar[str] = GRAPH_INSTAGRAM_BASE
    # An IG user node exposes name/username, not the Messenger first/last name.
    profile_fields: ClassVar[str] = "name,username"
    # Instagram's send body is just {recipient, message} — messaging_type is a
    # Messenger-only parameter and has no meaning here.
    send_extras: ClassVar[dict] = {}
    # Quick replies, but Instagram doesn't show them on desktop or the web,
    # so the choices are written into the text too
    interactive_limits: ClassVar[Optional[InteractiveLimits]] = INSTAGRAM_LIMITS
    # Instagram's own cap on a message's text
    max_text_length: ClassVar[Optional[int]] = INSTAGRAM_LIMITS.body_max

    def graph_base_for(self, account: ChannelAccount) -> str:
        """A Page token (an account connected by hand) only works on the
        Facebook graph; an Instagram Login token only on Instagram's."""
        return GRAPH_BASE if (account.settings or {}).get(PAGE_ID_SETTING) else self.graph_base

    def _events(self, entry: dict) -> List[dict]:
        """Instagram delivers a DM either as messaging[] or, depending on the
        API version, as changes[] with field=messages and the same event under
        `value`. Reading only one shape drops every message on the other, and
        silently — the payload parses to nothing and the webhook still acks.
        """
        events = super()._events(entry)
        if events:
            return events
        return [change.get("value") or {}
                for change in entry.get("changes") or []
                if change.get("field") == "messages"]

    @staticmethod
    def _display_name(data: dict) -> str:
        return (data.get("name") or data.get("username") or "").strip()


register_adapter(InstagramAdapter())

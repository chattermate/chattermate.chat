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

What each channel's tappable choices can hold. Dependency-free so adapters
(channels/base.py) and the builders (channels/interactive.py) can share it.
"""

from dataclasses import dataclass

from app.channels.constants import MAX_CHOICE_LENGTH, MAX_CHOICE_OPTIONS


@dataclass(frozen=True)
class InteractiveLimits:
    max_buttons: int
    button_title_max: int
    body_max: int
    # Choice ids are checked in bytes: Telegram counts bytes, and so does
    # every other platform's limit once an id isn't ASCII
    id_max_bytes: int
    supports_list: bool = False
    max_list_rows: int = 0
    row_title_max: int = 0
    row_description_max: int = 0
    supports_cta: bool = False
    # Also write the choices into the text: where some of the platform's
    # apps don't show the buttons (Instagram on desktop and the web)
    options_in_text: bool = False


# https://developers.facebook.com/docs/whatsapp/cloud-api/messages/interactive-reply-buttons-messages
WHATSAPP_LIMITS = InteractiveLimits(
    max_buttons=3, button_title_max=20, body_max=1024, id_max_bytes=256,
    supports_list=True, max_list_rows=MAX_CHOICE_OPTIONS, row_title_max=24,
    row_description_max=MAX_CHOICE_LENGTH, supports_cta=True,
)

# Quick replies: https://developers.facebook.com/docs/messenger-platform/send-messages/quick-replies
# body_max is each channel's cap on a message's text, which the adapters use too
MESSENGER_LIMITS = InteractiveLimits(max_buttons=13, button_title_max=20, body_max=2000, id_max_bytes=1000)

# Same quick replies, but Instagram doesn't show them on desktop or the web
INSTAGRAM_LIMITS = InteractiveLimits(max_buttons=13, button_title_max=20, body_max=1000, id_max_bytes=1000,
                                     options_in_text=True)

# The website chat: the widget shows the choices as reply buttons on the
# visitor's side, where four still fit on a phone
WEB_LIMITS = InteractiveLimits(max_buttons=4, button_title_max=40, body_max=4000, id_max_bytes=200)

# Inline keyboard: https://core.telegram.org/bots/api#inlinekeyboardbutton
TELEGRAM_LIMITS = InteractiveLimits(max_buttons=MAX_CHOICE_OPTIONS, button_title_max=64, body_max=4096,
                                    id_max_bytes=64)

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

The visitor's preferred languages, as the widget sends them at connect (the
browser's navigator.languages, most preferred first). Kept on the socket
session for whatever draws the reply in the visitor's language.
"""

from typing import Any, List

# What a visitor may send: a few BCP 47 tags, each short
MAX_PREFERENCES = 5
MAX_TAG_LENGTH = 35


def preferred_languages(raw: Any) -> List[str]:
    """The tags worth keeping, in order: strings only, trimmed, none too long."""
    if isinstance(raw, str):
        raw = [raw]
    if not isinstance(raw, (list, tuple)):
        return []
    tags = []
    for tag in list(raw)[:MAX_PREFERENCES]:
        if isinstance(tag, str) and tag.strip() and len(tag.strip()) <= MAX_TAG_LENGTH:
            tags.append(tag.strip())
    return tags

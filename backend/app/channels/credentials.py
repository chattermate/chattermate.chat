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

Checks for credentials a customer pastes from a provider's console. Kept
apart from the transports so request schemas can use them too.
"""


def stray_character_message(label: str) -> str:
    """What to tell the customer when a pasted credential carries a character
    that can't be part of it."""
    return (f"The {label} contains a character that isn't part of it. "
            "Copy it again, without any extra characters, and paste it here.")


def fits_in_header(token: str) -> bool:
    """Whether a token can travel in an HTTP header. Credentials are plain
    ASCII; a smart quote, zero-width space or ellipsis picked up while copying
    makes the HTTP client fail with an encoding error the customer can't act
    on, so callers refuse such a token up front with stray_character_message."""
    return token.isascii()

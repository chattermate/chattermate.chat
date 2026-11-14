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

Whether a conversation proved the visitor's email, asked by the code that acts
on a proven email (order lookups, the visitor's other browsers' chats).

The proof itself (a code sent to the address, or a store that vouches for its
signed-in customer) belongs to the chat UI layer that draws the check. Without
one nothing is ever proven: order lookups need the typed email and order
number, and history shows this browser's chats only.
"""

from typing import Any, Optional, Protocol


class EmailProof(Protocol):
    def available(self) -> bool: ...
    def offer(self, session_id: str) -> bool: ...
    def verified_email(self, session_id: Optional[str], customer_id: Optional[str] = None) -> Optional[str]: ...
    def email_key(self, email: str, org_id: Any) -> str: ...
    def mask(self, email: str) -> str: ...
    def forget(self, session_id: Optional[str]) -> None: ...
    def accept_store_sign_in(self, session: dict, token_data: dict) -> bool: ...


_provider: Optional[EmailProof] = None


def install(provider: Optional[EmailProof]) -> None:
    global _provider
    _provider = provider


def _active() -> Optional[EmailProof]:
    if _provider is not None:
        return _provider
    return _fallback_provider()


def _fallback_provider() -> Optional[EmailProof]:
    """Today's email check, until the chat UI layer ships it."""
    from app.cards.builtin_layer import BUILTIN_EMAIL_PROOF
    return BUILTIN_EMAIL_PROOF


def available() -> bool:
    """Whether a visitor can be asked to prove their email at all."""
    provider = _active()
    return provider is not None and provider.available()


def offer(session_id: str) -> bool:
    """The agent asked this conversation to prove an email. Whether it may."""
    provider = _active()
    return provider is not None and provider.offer(session_id)


def verified_email(session_id: Optional[str], customer_id: Optional[str] = None) -> Optional[str]:
    """The email this conversation proved (for this customer, when given), or None."""
    provider = _active()
    return provider.verified_email(session_id, customer_id) if provider is not None else None


def email_key(email: str, org_id: Any) -> Optional[str]:
    """What a conversation stores to be found again by the same proven email."""
    provider = _active()
    return provider.email_key(email, org_id) if provider is not None else None


def mask(email: str) -> str:
    provider = _active()
    return provider.mask(email) if provider is not None else ''


def forget(session_id: Optional[str]) -> None:
    """The conversation ended: its proof goes with it."""
    provider = _active()
    if provider is not None:
        provider.forget(session_id)


def accept_store_sign_in(session: dict, token_data: dict) -> bool:
    """Blocking. A store's signed-in customer counts as proven, where the layer
    allows it. Whether it was accepted."""
    provider = _active()
    return provider is not None and provider.accept_store_sign_in(session, token_data)

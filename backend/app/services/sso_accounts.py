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

Which dashboard user a single sign-on account signs in as.

An account already linked (app.models.user_identity) signs in as its user,
whatever address it now carries. An unlinked account is linked once, by an
e-mail address the provider vouches for, to the one active user with that
address, unless that user already has an account from the same provider and
issuer (a recreated account must be unlinked by an admin first). SSO never
creates users.

A link belongs to the person, not the seat: changing a user's e-mail address
drops their links (forget_identities), so whoever gets the seat next can't
be signed in by the previous holder's account.
"""

from typing import List, Optional, Tuple

from sqlalchemy import func
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.logger import get_logger
from app.models.user import User
from app.models.user_identity import UserIdentity
from app.services.auth_sessions import revoke_identity_sessions
from app.services.sso import SsoIdentity
from app.services.sso_providers import SsoError

logger = get_logger(__name__)


def _linked(db: Session, provider_key: str, identity: SsoIdentity) -> Optional[UserIdentity]:
    return db.query(UserIdentity).filter(
        UserIdentity.provider == provider_key,
        UserIdentity.issuer == identity.issuer,
        UserIdentity.subject == identity.subject,
    ).first()


def _user_by_email(db: Session, email: str) -> User:
    """The one active user with this address. Addresses are unique only as
    typed, so two that differ in case are a conflict, not a coin toss."""
    matches = db.query(User).filter(
        func.lower(User.email) == email, User.is_active == True  # noqa: E712
    ).limit(2).all()
    if not matches:
        raise SsoError("no_account", "no active user has the address")
    if len(matches) > 1:
        raise SsoError("ambiguous_account", "several users share the address in different case")
    return matches[0]


def _already_linked_elsewhere(db: Session, user: User, provider_key: str, issuer: str) -> bool:
    return db.query(UserIdentity.id).filter(
        UserIdentity.user_id == user.id,
        UserIdentity.provider == provider_key,
        UserIdentity.issuer == issuer,
    ).first() is not None


def _signed_in(link: UserIdentity, identity: SsoIdentity) -> Tuple[User, UserIdentity]:
    user = link.user
    if user is None or not user.is_active:
        raise SsoError("no_account", "the linked user is no longer active")
    link.last_login_at = func.now()
    if identity.email:
        # What the account is called now, for the admin's list.
        link.email = identity.email
    return user, link


def _link(db: Session, provider_key: str, identity: SsoIdentity) -> Tuple[User, UserIdentity]:
    if not identity.email_trusted:
        raise SsoError("email_unverified", f"{provider_key} does not vouch for the address of an unlinked account")
    user = _user_by_email(db, identity.email)
    if _already_linked_elsewhere(db, user, provider_key, identity.issuer):
        raise SsoError("already_linked", f"user {user.id} already has another {provider_key} account from {identity.issuer}")
    link = UserIdentity(
        user_id=user.id,
        provider=provider_key,
        issuer=identity.issuer,
        subject=identity.subject,
        email=identity.email,
        last_login_at=func.now(),
    )
    db.add(link)
    try:
        db.flush()
    except IntegrityError:
        # A parallel first sign-in of the same account linked it first. Nothing
        # else of this sign-in is pending yet, so the whole rollback is safe.
        db.rollback()
        existing = _linked(db, provider_key, identity)
        if existing is None:
            raise
        return _signed_in(existing, identity)
    logger.info(f"SSO {provider_key} account linked to user {user.id}")
    return user, link


def user_for_identity(db: Session, provider_key: str, identity: SsoIdentity) -> Tuple[User, UserIdentity]:
    """The active user this account signs in as and the link it signs in
    through, linking it on first use. Raises SsoError when there is none; the
    caller commits."""
    link = _linked(db, provider_key, identity)
    if link is not None:
        return _signed_in(link, identity)
    return _link(db, provider_key, identity)


def identities_of(db: Session, user_id) -> List[UserIdentity]:
    return db.query(UserIdentity).filter(UserIdentity.user_id == user_id).order_by(UserIdentity.created_at).all()


def has_identity(db: Session, user_id, provider_keys) -> bool:
    """Whether the user has linked an account from any of `provider_keys`."""
    if not provider_keys:
        return False
    return db.query(UserIdentity.id).filter(
        UserIdentity.user_id == user_id,
        UserIdentity.provider.in_(list(provider_keys)),
    ).first() is not None


def unlink(db: Session, user_id, identity_id, keep_sid=None) -> bool:
    """Remove one link and end the sessions it opened (except `keep_sid`).
    False when the user has no such link. The caller commits."""
    link = db.query(UserIdentity).filter(
        UserIdentity.id == identity_id, UserIdentity.user_id == user_id
    ).first()
    if link is None:
        return False
    revoke_identity_sessions(db, link.id, keep_sid=keep_sid)
    db.delete(link)
    logger.info(f"SSO {link.provider} account unlinked from user {user_id}")
    return True


def forget_identities(db: Session, user_id, keep_sid=None) -> None:
    """Drop every link a user has (their address changed) and end the sessions
    those links opened, except `keep_sid`. The caller commits."""
    for link in identities_of(db, user_id):
        unlink(db, user_id, link.id, keep_sid=keep_sid)


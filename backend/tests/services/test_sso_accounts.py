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

Which user an SSO account signs in as. The callback-level cases live in
tests/api/test_sso.py; these are the linking rules on their own.
"""

import uuid

import pytest

from app.models.auth_session import AuthSession
from app.models.user import User
from app.models.user_identity import UserIdentity
from app.services import sso_accounts
from app.services.auth_sessions import SSO_LOGIN, issue_tokens, session_id_of
from app.services.sso import SsoIdentity
from app.services.sso_providers import SsoError

ISSUER = "https://accounts.google.com"


def _identity(email: str, subject: str = "g-1", trusted: bool = True, issuer: str = ISSUER) -> SsoIdentity:
    return SsoIdentity(issuer=issuer, subject=subject, email=email, email_trusted=trusted, name="")


def _link(db, user: User, subject: str = "g-1", provider: str = "google", issuer: str = ISSUER) -> UserIdentity:
    link = UserIdentity(user_id=user.id, provider=provider, issuer=issuer, subject=subject, email=user.email)
    db.add(link)
    db.commit()
    return link


def test_first_sign_in_links_the_account(db, test_user: User):
    user, link = sso_accounts.user_for_identity(db, "google", _identity(test_user.email))
    db.commit()
    assert user.id == test_user.id
    stored = db.query(UserIdentity).one()
    assert stored.id == link.id
    assert (stored.provider, stored.issuer, stored.subject, stored.user_id) == ("google", ISSUER, "g-1", test_user.id)


def test_a_linked_account_signs_in_and_its_address_is_kept_current(db, test_user: User):
    _link(db, test_user)
    user, link = sso_accounts.user_for_identity(db, "google", _identity("renamed@gmail.com", trusted=False))
    db.commit()
    assert user.id == test_user.id
    assert link.email == "renamed@gmail.com"
    assert link.last_login_at is not None


def test_the_same_subject_from_another_issuer_is_another_account(db, test_user: User):
    _link(db, test_user, subject="s", provider="microsoft", issuer="https://login.microsoftonline.com/a/v2.0")
    with pytest.raises(SsoError) as err:
        sso_accounts.user_for_identity(db, "microsoft", _identity(
            test_user.email, subject="s", trusted=False, issuer="https://login.microsoftonline.com/b/v2.0"))
    assert err.value.code == "email_unverified"


def test_a_recreated_account_is_not_linked_on_its_own(db, test_user: User):
    """The same person's new Google account, or someone who now holds their
    address at Google: an admin unlinks the old one first."""
    _link(db, test_user, subject="g-old")
    with pytest.raises(SsoError) as err:
        sso_accounts.user_for_identity(db, "google", _identity(test_user.email, subject="g-new"))
    assert err.value.code == "already_linked"
    assert db.query(UserIdentity).count() == 1


def test_accounts_from_other_issuers_may_be_added(db, test_user: User):
    """One Google account and accounts in two Microsoft tenants: different issuers."""
    _link(db, test_user)
    for tenant in ("a", "b"):
        user, _ = sso_accounts.user_for_identity(db, "microsoft", _identity(
            test_user.email, subject=f"oid-{tenant}", issuer=f"https://login.microsoftonline.com/{tenant}/v2.0"))
        assert user.id == test_user.id
    db.commit()
    assert db.query(UserIdentity).count() == 3


def test_a_parallel_first_sign_in_reuses_the_link_it_lost_to(db, test_user: User, monkeypatch):
    """Two tabs finishing the first sign-in at once: the loser's insert hits the
    unique constraint and it signs in through the winner's link."""
    winner = _link(db, test_user)
    # Pretend the lookup and the already-linked check ran before the winner committed.
    real_linked = sso_accounts._linked
    calls = []

    def racing_lookup(*args):
        calls.append(1)
        return None if len(calls) == 1 else real_linked(*args)

    monkeypatch.setattr(sso_accounts, "_linked", racing_lookup)
    monkeypatch.setattr(sso_accounts, "_already_linked_elsewhere", lambda *a: False)
    user, link = sso_accounts.user_for_identity(db, "google", _identity(test_user.email))
    db.commit()
    assert (user.id, link.id) == (test_user.id, winner.id)
    assert db.query(UserIdentity).count() == 1


def _session(db, user: User, link: UserIdentity = None) -> AuthSession:
    access, _ = issue_tokens(db, user.id, user.organization_id, auth_method=SSO_LOGIN, identity_id=link.id if link else None)
    db.commit()
    return db.get(AuthSession, uuid.UUID(session_id_of(access)))


def test_unlinking_ends_the_sessions_that_account_opened(db, test_user: User):
    link = _link(db, test_user)
    other = _link(db, test_user, subject="ms", provider="microsoft", issuer="https://login.microsoftonline.com/a/v2.0")
    through_link = _session(db, test_user, link)
    through_other = _session(db, test_user, other)
    password = _session(db, test_user)

    assert sso_accounts.unlink(db, test_user.id, link.id) is True
    db.commit()
    assert [i.id for i in sso_accounts.identities_of(db, test_user.id)] == [other.id]
    for session, revoked in ((through_link, True), (through_other, False), (password, False)):
        db.refresh(session)
        assert (session.revoked_at is not None) is revoked


def test_unlinking_someone_elses_account_does_nothing(db, test_user: User):
    link = _link(db, test_user)
    assert sso_accounts.unlink(db, uuid.uuid4(), link.id) is False
    assert db.query(UserIdentity).count() == 1


def test_forgetting_drops_every_link_but_keeps_the_current_session(db, test_user: User):
    link = _link(db, test_user)
    current = _session(db, test_user, link)
    elsewhere = _session(db, test_user, link)
    sso_accounts.forget_identities(db, test_user.id, keep_sid=current.id)
    db.commit()
    assert sso_accounts.identities_of(db, test_user.id) == []
    db.refresh(current)
    db.refresh(elsewhere)
    assert current.revoked_at is None
    assert elsewhere.revoked_at is not None


def test_has_identity_counts_only_the_given_providers(db, test_user: User):
    _link(db, test_user)
    assert sso_accounts.has_identity(db, test_user.id, ["google"]) is True
    assert sso_accounts.has_identity(db, test_user.id, ["microsoft"]) is False
    assert sso_accounts.has_identity(db, test_user.id, []) is False

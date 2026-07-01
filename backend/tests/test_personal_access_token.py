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

from datetime import datetime, timedelta, timezone

import pytest

# Personal Access Tokens are an enterprise-only feature; skip cleanly in community checkouts.
pytest.importorskip("app.enterprise.repositories.personal_access_token")

from app.enterprise.repositories.personal_access_token import (  # noqa: E402
    PersonalAccessTokenRepository,
    generate_pat,
    TOKEN_PREFIX,
)
from app.enterprise.services.pat import resolve_pat_user  # noqa: E402


def test_generate_pat_format():
    token, prefix = generate_pat()
    assert token.startswith(TOKEN_PREFIX)
    assert prefix == token[: len(prefix)]
    assert len(token) > len(prefix)
    # two calls produce different secrets
    other, _ = generate_pat()
    assert other != token


def test_create_token_persists_hash_not_plaintext(db, test_user):
    repo = PersonalAccessTokenRepository(db)
    row, plain = repo.create_token(
        user_id=test_user.id, organization_id=test_user.organization_id, name="cli"
    )
    assert plain.startswith(TOKEN_PREFIX)
    assert row.token_hash != plain            # stored hashed, not plaintext
    assert row.token_prefix == plain[: len(row.token_prefix)]
    assert row.is_active is True
    assert row.user_id == test_user.id


def test_validate_token_roundtrip_and_last_used(db, test_user):
    repo = PersonalAccessTokenRepository(db)
    row, plain = repo.create_token(
        user_id=test_user.id, organization_id=test_user.organization_id, name="cli"
    )
    assert row.last_used_at is None

    validated = repo.validate_token(plain)
    assert validated is not None
    assert validated.id == row.id
    assert validated.last_used_at is not None   # touched on use


def test_validate_token_rejects_wrong_and_garbage(db, test_user):
    repo = PersonalAccessTokenRepository(db)
    repo.create_token(user_id=test_user.id, organization_id=test_user.organization_id, name="cli")
    assert repo.validate_token("cmat_not-a-real-token") is None
    assert repo.validate_token("jwt-style-token") is None
    assert repo.validate_token("") is None


def test_validate_token_rejects_revoked(db, test_user):
    repo = PersonalAccessTokenRepository(db)
    row, plain = repo.create_token(
        user_id=test_user.id, organization_id=test_user.organization_id, name="cli"
    )
    assert repo.revoke(row.id, test_user.id) is True
    assert repo.validate_token(plain) is None


def test_validate_token_rejects_expired(db, test_user):
    repo = PersonalAccessTokenRepository(db)
    row, plain = repo.create_token(
        user_id=test_user.id, organization_id=test_user.organization_id, name="cli"
    )
    # Force expiry into the past.
    row.expires_at = datetime.now(timezone.utc) - timedelta(days=1)
    db.commit()
    assert repo.validate_token(plain) is None


def test_list_and_scope(db, test_user):
    repo = PersonalAccessTokenRepository(db)
    repo.create_token(user_id=test_user.id, organization_id=test_user.organization_id, name="a")
    repo.create_token(user_id=test_user.id, organization_id=test_user.organization_id, name="b")
    tokens = repo.list_for_user(test_user.id)
    assert len(tokens) == 2
    # get_by_id is scoped to the owning user
    assert repo.get_by_id(tokens[0].id, test_user.id) is not None


def test_resolve_pat_user_returns_owner(db, test_user):
    repo = PersonalAccessTokenRepository(db)
    _, plain = repo.create_token(
        user_id=test_user.id, organization_id=test_user.organization_id, name="cli"
    )
    user = resolve_pat_user(plain, db)
    assert user is not None
    assert user.id == test_user.id


def test_resolve_pat_user_rejects_inactive_user(db, test_user):
    repo = PersonalAccessTokenRepository(db)
    _, plain = repo.create_token(
        user_id=test_user.id, organization_id=test_user.organization_id, name="cli"
    )
    test_user.is_active = False
    db.commit()
    assert resolve_pat_user(plain, db) is None


def test_resolve_pat_user_rejects_non_pat_token(db):
    assert resolve_pat_user("not-a-pat", db) is None
    assert resolve_pat_user("", db) is None


# --- Integration: the open-source get_current_user hook resolves cmat_ tokens ---

import asyncio  # noqa: E402

from fastapi import HTTPException  # noqa: E402
from starlette.requests import Request  # noqa: E402

from app.core.auth import get_current_user  # noqa: E402


def _request_with_bearer(token: str) -> Request:
    headers = [(b"authorization", f"Bearer {token}".encode())]
    scope = {
        "type": "http", "method": "GET", "path": "/", "query_string": b"",
        "headers": headers,
    }
    return Request(scope)


def test_get_current_user_accepts_valid_pat(db, test_user):
    repo = PersonalAccessTokenRepository(db)
    _, plain = repo.create_token(
        user_id=test_user.id, organization_id=test_user.organization_id, name="cli"
    )
    user = asyncio.run(get_current_user(_request_with_bearer(plain), None, db))
    assert user.id == test_user.id


def test_get_current_user_rejects_bogus_pat(db, test_user):
    with pytest.raises(HTTPException) as exc:
        asyncio.run(get_current_user(_request_with_bearer("cmat_bogus"), None, db))
    assert exc.value.status_code == 401


# --- Security: a PAT cannot be used to mint further PATs ---

from app.enterprise.routes.personal_access_token import (  # noqa: E402
    create_personal_access_token,
)
from app.enterprise.schemas.personal_access_token import PATCreate  # noqa: E402


def test_create_pat_rejected_when_request_uses_a_pat(db, test_user):
    req = _request_with_bearer("cmat_sometoken")
    with pytest.raises(HTTPException) as exc:
        # current_user/request are passed as kwargs, matching how FastAPI invokes the
        # handler (the rate-limit decorator reads current_user from kwargs).
        asyncio.run(create_personal_access_token(
            PATCreate(name="child"), request=req, db=db, current_user=test_user))
    assert exc.value.status_code == 403


def test_create_pat_allowed_with_interactive_session(db, test_user):
    # A JWT bearer (not cmat_) represents an interactive login and is allowed.
    req = _request_with_bearer("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.payload.sig")
    resp = asyncio.run(create_personal_access_token(
        PATCreate(name="ok"), request=req, db=db, current_user=test_user))
    assert resp.token.startswith("cmat_")

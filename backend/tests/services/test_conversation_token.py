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

Minting, rotating and classifying conversation tokens. A visitor keeps their
identity across a token rotation, and a token that has lapsed is never mistaken for
a visitor who never had one.
"""
from datetime import datetime, timedelta, timezone

import pytest
from jose import jwt

from app.core.security import ALGORITHM, CONVERSATION_SECRET_KEY
from app.services import conversation_token

WIDGET_ID = "widget-1"
CUSTOMER_ID = "3f4c1f2e-0d0a-4a1e-9d1f-2b3c4d5e6f70"

IDENTIFIED_CLAIMS = {
    "sub": CUSTOMER_ID,
    "customer_id": CUSTOMER_ID,
    "widget_id": WIDGET_ID,
    "customer_email": "signed.in@example.com",
    "customer_name": "Signed In",
    "custom_data": {"plan": "pro", "student_name": "Ada"},
}


@pytest.fixture(autouse=True)
def redis_accepts_every_jti(monkeypatch):
    """Redis is not part of what these tests are about; each case sets its own."""
    monkeypatch.setattr(conversation_token, "_store_token_in_redis", lambda *a, **k: True)
    monkeypatch.setattr(conversation_token, "_is_token_in_redis", lambda jti: True)


def _claims(token: str) -> dict:
    return jwt.decode(token, CONVERSATION_SECRET_KEY, algorithms=[ALGORITHM],
                      options={"verify_sub": False})


def test_mint_carries_identity_and_a_bounded_lifetime():
    token, expires_at, ttl = conversation_token.mint(IDENTIFIED_CLAIMS, ttl_seconds=120)

    claims = _claims(token)
    assert ttl == 120
    assert claims["customer_email"] == "signed.in@example.com"
    assert claims["custom_data"] == {"plan": "pro", "student_name": "Ada"}
    assert claims["type"] == "conversation"
    assert claims["exp"] - claims["iat"] == 120
    assert expires_at > datetime.now(timezone.utc)


def test_mint_drops_empty_claims_so_anonymous_tokens_stay_decodable():
    token, _, _ = conversation_token.mint({"widget_id": WIDGET_ID, "sub": None})

    assert "sub" not in _claims(token)
    assert conversation_token.inspect(token, WIDGET_ID).is_live


def test_mint_clamps_an_unsupported_lifetime():
    _, _, ttl = conversation_token.mint(IDENTIFIED_CLAIMS, ttl_seconds=10)
    assert ttl == conversation_token.MIN_TTL_SECONDS

    _, _, ttl = conversation_token.mint(IDENTIFIED_CLAIMS, ttl_seconds=999_999)
    assert ttl == conversation_token.MAX_TTL_SECONDS


def test_rotation_keeps_the_visitor_and_their_custom_data():
    token, _, _ = conversation_token.mint(IDENTIFIED_CLAIMS, ttl_seconds=600)
    original = _claims(token)

    rotated_token, _, ttl = conversation_token.rotate(original)
    rotated = _claims(rotated_token)

    # The whole point: the replacement is the same person, for the same lifetime.
    assert rotated["sub"] == CUSTOMER_ID
    assert rotated["customer_email"] == original["customer_email"]
    assert rotated["customer_name"] == original["customer_name"]
    assert rotated["custom_data"] == original["custom_data"]
    assert ttl == 600
    assert rotated["jti"] != original["jti"]
    # Same second in a test that rotates instantly; the lifetime runs from now on.
    assert rotated["exp"] >= original["exp"]


def test_rotation_does_not_reset_the_absolute_ceiling():
    token, _, _ = conversation_token.mint(IDENTIFIED_CLAIMS, ttl_seconds=600)
    first = _claims(token)

    rotated_token, _, _ = conversation_token.rotate(first)
    second = _claims(rotated_token)

    assert second[conversation_token.CHAIN_START_CLAIM] == first[conversation_token.CHAIN_START_CLAIM]


def test_rotation_stops_once_the_chain_is_too_old():
    long_ago = int((datetime.now(timezone.utc)
                    - timedelta(seconds=conversation_token.MAX_CHAIN_SECONDS + 60)).timestamp())
    token, _, _ = conversation_token.mint(
        {**IDENTIFIED_CLAIMS, conversation_token.CHAIN_START_CLAIM: long_ago},
        ttl_seconds=600,
    )

    assert conversation_token.rotate(_claims(token)) is None


def test_inspect_rejects_a_token_issued_for_another_widget():
    token, _, _ = conversation_token.mint(IDENTIFIED_CLAIMS, ttl_seconds=600)

    state = conversation_token.inspect(token, "another-widget")

    assert not state.is_live
    # Not this widget's problem to re-identify - it is not this widget's visitor.
    assert not state.identity_lost


def test_inspect_reports_a_lapsed_identity_rather_than_a_missing_one(monkeypatch):
    token, _, _ = conversation_token.mint(IDENTIFIED_CLAIMS, ttl_seconds=600)
    monkeypatch.setattr(conversation_token, "_is_token_in_redis", lambda jti: False)

    state = conversation_token.inspect(token, WIDGET_ID)

    assert not state.is_live
    assert state.identity_lost


def test_inspect_reports_an_expired_identified_token_as_lost():
    expired = jwt.encode(
        {
            **IDENTIFIED_CLAIMS,
            "type": "conversation",
            "jti": "expired-jti",
            "iat": int((datetime.now(timezone.utc) - timedelta(hours=2)).timestamp()),
            "exp": int((datetime.now(timezone.utc) - timedelta(hours=1)).timestamp()),
        },
        CONVERSATION_SECRET_KEY,
        algorithm=ALGORITHM,
    )

    state = conversation_token.inspect(expired, WIDGET_ID)

    assert not state.is_live
    assert state.identity_lost


def test_inspect_treats_an_expired_anonymous_token_as_no_token():
    expired = jwt.encode(
        {
            "widget_id": WIDGET_ID,
            "type": "conversation",
            "jti": "anon-jti",
            "exp": int((datetime.now(timezone.utc) - timedelta(hours=1)).timestamp()),
        },
        CONVERSATION_SECRET_KEY,
        algorithm=ALGORITHM,
    )

    state = conversation_token.inspect(expired, WIDGET_ID)

    # Nobody to re-identify: the visitor may simply start over anonymously.
    assert not state.is_live
    assert not state.identity_lost


def test_a_lapsed_widget_minted_token_is_replaceable_not_lost():
    """The widget mints its own customers (<timestamp>@noemail.com) with a `sub` but
    no asserted email. Those must keep being replaced silently - refusing them would
    break every anonymous visitor whose long-lived token ran out, and the Explore
    demo along with them."""
    expired = jwt.encode(
        {
            "widget_id": WIDGET_ID,
            "type": "conversation",
            "jti": "widget-minted",
            "sub": CUSTOMER_ID,
            "exp": int((datetime.now(timezone.utc) - timedelta(hours=1)).timestamp()),
        },
        CONVERSATION_SECRET_KEY,
        algorithm=ALGORITHM,
    )

    state = conversation_token.inspect(expired, WIDGET_ID)

    assert not state.is_live
    assert not state.identity_lost


def test_inspect_ignores_garbage_and_foreign_signatures():
    foreign = jwt.encode({"widget_id": WIDGET_ID, "type": "conversation"},
                         "not-our-secret", algorithm=ALGORITHM)

    assert not conversation_token.inspect("not-a-jwt", WIDGET_ID).is_live
    assert not conversation_token.inspect(foreign, WIDGET_ID).identity_lost
    assert not conversation_token.inspect(None, WIDGET_ID).is_live


def test_inspect_rejects_a_token_of_another_kind():
    other = jwt.encode({"widget_id": WIDGET_ID, "type": "access", "sub": CUSTOMER_ID},
                       CONVERSATION_SECRET_KEY, algorithm=ALGORITHM)

    assert not conversation_token.inspect(other, WIDGET_ID).is_live

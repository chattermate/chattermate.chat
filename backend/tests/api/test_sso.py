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

The SSO endpoints end to end, with the provider itself replaced: the code
exchange and ID-token verification are stubbed, everything on our side
(state and its browser cookie, account linking, avatar, shop linking,
session cookies, redirects) is real.
"""

import base64
import hashlib
import time
import uuid
from unittest.mock import AsyncMock
from urllib.parse import parse_qs, urlparse

import httpx
import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from jose import jwt

from app.api import sso as sso_api
from app.api import user_identities as identities_api
from app.api import users as users_api
from app.core.config import settings
from app.database import get_db
from app.models.auth_session import AuthSession
from app.models.organization import Organization
from app.models.shopify.shopify_shop import ShopifyShop
from app.models.user import User
from app.models.user_identity import UserIdentity
from app.services import profile_pictures
from app.services import sso as sso_service
from app.services.auth_sessions import session_id_of
from app.services.sign_in_policy import SignInRefused

# The SSO router on its own, like the other API test modules do: app.main's
# `app` is the socket.io wrapper, which has no dependency_overrides. Plus the
# users routes the dashboard calls next (/users/me) and the admin's identities.
app = FastAPI()
app.include_router(sso_api.router, prefix="/api/v1/sso")
app.include_router(users_api.router, prefix="/api/v1/users")
app.include_router(identities_api.router, prefix="/api/v1/users")

GOOGLE_DISCOVERY = {
    "issuer": "https://accounts.google.com",
    "authorization_endpoint": "https://accounts.google.com/o/oauth2/v2/auth",
    "token_endpoint": "https://oauth2.googleapis.com/token",
    "jwks_uri": "https://www.googleapis.com/oauth2/v3/certs",
}
SSO_OK = "https://app.example.test/login?sso=ok"
PHOTO_URL = "/api/v1/uploads/user/org/u/profile.png"


@pytest.fixture
def client(db, monkeypatch) -> TestClient:
    """A client on the test database with the REAL cookie authentication, so
    /users/me is exercised the way the dashboard reaches it. https, because
    the cookies are Secure and would otherwise not be sent back."""
    def override_get_db():
        yield db
    app.dependency_overrides[get_db] = override_get_db
    # The photo is adopted after the response, in a session of its own.
    monkeypatch.setattr(profile_pictures, "_open_session", lambda: db)
    with TestClient(app, base_url="https://testserver") as test_client:
        yield test_client
    app.dependency_overrides.pop(get_db, None)


def _common_settings(monkeypatch):
    monkeypatch.setattr(settings, "FRONTEND_URL", "https://app.example.test")
    monkeypatch.setattr(settings, "BACKEND_URL", "https://api.example.test")
    monkeypatch.setattr(settings, "PASSWORD_LOGIN_ENABLED", True)
    monkeypatch.setattr(settings, "GOOGLE_SSO_HOSTED_DOMAIN", "")


@pytest.fixture
def google_only(monkeypatch):
    _common_settings(monkeypatch)
    monkeypatch.setattr(settings, "GOOGLE_SSO_CLIENT_ID", "google-client")
    monkeypatch.setattr(settings, "GOOGLE_SSO_CLIENT_SECRET", "google-secret")
    monkeypatch.setattr(settings, "MICROSOFT_SSO_CLIENT_ID", "")
    monkeypatch.setattr(settings, "MICROSOFT_SSO_CLIENT_SECRET", "")
    monkeypatch.setattr(sso_service, "discovery", AsyncMock(return_value=GOOGLE_DISCOVERY))
    sso_service.clear_caches()
    yield
    sso_service.clear_caches()


@pytest.fixture
def microsoft_common(monkeypatch):
    """Microsoft open to every directory, the default tenant."""
    _common_settings(monkeypatch)
    monkeypatch.setattr(settings, "GOOGLE_SSO_CLIENT_ID", "")
    monkeypatch.setattr(settings, "MICROSOFT_SSO_CLIENT_ID", "ms-client")
    monkeypatch.setattr(settings, "MICROSOFT_SSO_CLIENT_SECRET", "ms-secret")
    monkeypatch.setattr(settings, "MICROSOFT_SSO_TENANT", "common")
    monkeypatch.setattr(sso_service, "discovery", AsyncMock(return_value={
        **GOOGLE_DISCOVERY, "authorization_endpoint": "https://login.microsoftonline.com/common/oauth2/v2.0/authorize",
    }))


def _query_of(response) -> dict:
    assert response.status_code == 302
    return {k: v[0] for k, v in parse_qs(urlparse(response.headers["location"]).query).items()}


def _error_of(response) -> str:
    return _query_of(response).get("sso_error", "")


def _begin(client: TestClient, query: str = "", provider: str = "google") -> dict:
    """Start a sign-in and return the query the provider was sent (state, nonce...).
    The client keeps the state cookie, as the browser would."""
    return _query_of(client.get(f"/api/v1/sso/{provider}/start{query}", follow_redirects=False))


def _started(client: TestClient, state: str) -> dict:
    """What this browser's state cookie holds for the sign-in."""
    return jwt.decode(client.cookies.get(f"sso_{state}"), settings.SECRET_KEY, algorithms=["HS256"])


def _callback(client: TestClient, query: dict, provider: str = "google"):
    return client.get(f"/api/v1/sso/{provider}/callback?code=abc&state={query['state']}", follow_redirects=False)


def _provider_says(monkeypatch, claims: dict, photo=None, tokens=None):
    exchange = AsyncMock(return_value=tokens or {"id_token": "id", "access_token": "at"})
    monkeypatch.setattr(sso_service, "exchange_code", exchange)
    verify = AsyncMock(return_value=claims)
    monkeypatch.setattr(sso_service, "verify_id_token", verify)
    fetch = AsyncMock(return_value=photo)
    monkeypatch.setattr(profile_pictures, "fetch_provider_photo", fetch)
    monkeypatch.setattr(profile_pictures, "store_profile_picture", AsyncMock(return_value=PHOTO_URL))
    return exchange, verify, fetch


def _google_claims(email: str, sub: str = "g-1", **extra) -> dict:
    return {"iss": "https://accounts.google.com", "sub": sub, "email": email, "email_verified": True,
            "name": "Someone From SSO", "picture": "https://lh3.googleusercontent.com/a/x=s96-c", **extra}


@pytest.fixture
def gmail_user(db, test_user: User) -> User:
    """A team member whose address Google is the authority for."""
    test_user.email = "test.user@gmail.com"
    db.commit()
    return test_user


def _link(db, user: User, sub: str = "g-1") -> UserIdentity:
    link = UserIdentity(user_id=user.id, provider="google", issuer="https://accounts.google.com", subject=sub, email=user.email)
    db.add(link)
    db.commit()
    return link


def _no_providers(monkeypatch):
    for name in ("GOOGLE_SSO_CLIENT_ID", "GOOGLE_SSO_CLIENT_SECRET", "MICROSOFT_SSO_CLIENT_ID", "MICROSOFT_SSO_CLIENT_SECRET"):
        monkeypatch.setattr(settings, name, "")


# --- config --------------------------------------------------------------------

def test_config_lists_only_what_is_configured(client: TestClient, google_only):
    assert client.get("/api/v1/sso/config").json() == {
        "providers": [{"key": "google", "label": "Google"}],
        "password_login": True,
    }


def test_config_is_empty_without_configuration(client: TestClient, monkeypatch):
    _no_providers(monkeypatch)
    assert client.get("/api/v1/sso/config").json() == {"providers": [], "password_login": True}


def test_the_login_page_leads_with_sso_once_switched(client: TestClient, google_only, monkeypatch):
    monkeypatch.setattr(settings, "PASSWORD_LOGIN_ENABLED", False)
    assert client.get("/api/v1/sso/config").json()["password_login"] is False


def test_the_password_form_leads_without_a_provider(client: TestClient, monkeypatch):
    _no_providers(monkeypatch)
    monkeypatch.setattr(settings, "PASSWORD_LOGIN_ENABLED", False)
    assert client.get("/api/v1/sso/config").json()["password_login"] is True


# --- start ---------------------------------------------------------------------

def test_start_sends_the_browser_to_the_provider(client: TestClient, google_only):
    response = client.get("/api/v1/sso/google/start", follow_redirects=False)
    location = response.headers["location"]
    assert location.startswith(GOOGLE_DISCOVERY["authorization_endpoint"] + "?")
    query = _query_of(response)
    assert query["client_id"] == "google-client"
    assert query["redirect_uri"] == "https://api.example.test/api/v1/sso/google/callback"
    assert (query["response_type"], query["scope"], query["prompt"]) == ("code", "openid email profile", "select_account")
    assert query["code_challenge_method"] == "S256"

    # Everything the callback needs is in this browser's cookie, nothing on the server.
    started = _started(client, query["state"])
    assert (started["provider"], started["nonce"], started["carry"]) == ("google", query["nonce"], {})
    # The verifier it keeps hashes to the challenge the provider was sent.
    assert base64.urlsafe_b64encode(hashlib.sha256(started["verifier"].encode()).digest()).rstrip(b"=").decode() == query["code_challenge"]
    header = response.headers["set-cookie"]
    for attribute in ("HttpOnly", "Secure", "SameSite=lax", "Path=/api/v1/sso"):
        assert attribute.lower() in header.lower()


def test_start_carries_only_the_login_page_parameters(client: TestClient, google_only):
    query = _begin(client, "?redirect=%2Fconversations&shopify_flow=1&shop_id=7&shop=s.myshopify.com"
                           "&host=aG9zdA&embedded=true&sso_error=x&evil=1&return_to=%2Fshopify%2Fagent-selection")
    assert _started(client, query["state"])["carry"] == {
        "redirect": "/conversations", "shopify_flow": "1", "shop_id": "7", "shop": "s.myshopify.com",
        "host": "aG9zdA", "embedded": "true", "return_to": "/shopify/agent-selection"}


@pytest.mark.parametrize("param", ["redirect", "return_to"])
@pytest.mark.parametrize("value", ["https://evil.example/", "//evil.example/x", "/%5Cevil.example", "evil"])
def test_start_drops_a_destination_off_the_dashboard(client: TestClient, google_only, param, value):
    query = _begin(client, f"?{param}={value}&shop_id=7")
    assert _started(client, query["state"])["carry"] == {"shop_id": "7"}


def test_start_drops_an_oversized_parameter(client: TestClient, google_only):
    query = _begin(client, "?shop_id=7&host=" + "h" * 300)
    assert _started(client, query["state"])["carry"] == {"shop_id": "7"}


def test_a_hosted_domain_is_asked_for(client: TestClient, google_only, monkeypatch):
    monkeypatch.setattr(settings, "GOOGLE_SSO_HOSTED_DOMAIN", "acme.test")
    assert _begin(client)["hd"] == "acme.test"


@pytest.mark.parametrize("provider", ["microsoft", "okta"])
def test_start_is_404_for_an_unconfigured_or_unknown_provider(client: TestClient, google_only, provider):
    assert client.get(f"/api/v1/sso/{provider}/start", follow_redirects=False).status_code == 404


@pytest.mark.parametrize("failure", [httpx.ConnectError("down"), sso_service.SsoError("provider_error", "no authorization_endpoint")])
def test_start_returns_to_the_login_page_when_the_provider_is_unreachable(client: TestClient, google_only, monkeypatch, failure):
    monkeypatch.setattr(sso_service, "discovery", AsyncMock(side_effect=failure))
    response = client.get("/api/v1/sso/google/start?shop_id=7", follow_redirects=False)
    assert response.headers["location"] == "https://app.example.test/login?sso_error=provider_error&shop_id=7"
    assert "set-cookie" not in response.headers


# --- callback ------------------------------------------------------------------

def test_callback_links_and_signs_in_an_existing_user(client: TestClient, db, gmail_user: User, google_only, monkeypatch):
    query = _begin(client)
    started = _started(client, query["state"])
    # Case must not matter: the provider's spelling of the address is theirs.
    exchange, verify, _ = _provider_says(monkeypatch, _google_claims(gmail_user.email.upper()), photo=(b"\x89PNG", "image/png"))

    response = _callback(client, query)

    assert response.headers["location"] == SSO_OK
    for cookie in ("access_token", "refresh_token", "user_info"):
        assert cookie in response.cookies
    assert f"sso_{query['state']}" not in client.cookies  # spent
    # The verifier and nonce from the start are what the provider is held to.
    assert exchange.call_args.args[2] == started["verifier"]
    assert verify.call_args.args[2] == query["nonce"]
    link = db.query(UserIdentity).one()
    assert (link.user_id, link.provider, link.issuer, link.subject) == (gmail_user.id, "google", "https://accounts.google.com", "g-1")
    session = db.query(AuthSession).filter(AuthSession.user_id == gmail_user.id).one()
    assert (session.auth_method, session.identity_id) == ("sso", link.id)
    db.refresh(gmail_user)
    assert gmail_user.profile_pic == PHOTO_URL
    assert gmail_user.is_online is True

    # The dashboard then picks the user up from the cookies it was just given.
    me = client.get("/api/v1/users/me")
    assert me.status_code == 200
    assert me.json()["email"] == gmail_user.email

    # The sign-in is spent; replaying the callback gets nothing.
    assert _error_of(_callback(client, query)) == "invalid_state"


def test_parallel_sign_ins_in_two_tabs_both_finish(client: TestClient, gmail_user: User, google_only, monkeypatch):
    first, second = _begin(client), _begin(client)
    _provider_says(monkeypatch, _google_claims(gmail_user.email))
    assert _callback(client, first).headers["location"] == SSO_OK
    assert _callback(client, second).headers["location"] == SSO_OK


def test_a_new_sign_in_ends_the_session_the_browser_had(client: TestClient, db, gmail_user: User, google_only, monkeypatch):
    _provider_says(monkeypatch, _google_claims(gmail_user.email))
    _callback(client, _begin(client))
    before = session_id_of(client.cookies.get("access_token"))
    _callback(client, _begin(client))
    assert db.get(AuthSession, uuid.UUID(before)).revoked_at is not None
    assert db.query(AuthSession).filter(AuthSession.revoked_at.is_(None)).count() == 1


def test_callback_hands_the_login_page_parameters_back(client: TestClient, gmail_user: User, google_only, monkeypatch):
    query = _begin(client, "?redirect=%2Fconversations&shopify_flow=1")
    _provider_says(monkeypatch, _google_claims(gmail_user.email))
    assert _query_of(_callback(client, query)) == {"sso": "ok", "redirect": "/conversations", "shopify_flow": "1"}


def test_callback_refuses_a_link_started_in_another_browser(client: TestClient, gmail_user: User, google_only, monkeypatch):
    """Login CSRF: someone else's callback link must not sign this browser in."""
    query = _begin(client)
    _provider_says(monkeypatch, _google_claims(gmail_user.email))
    client.cookies.clear()
    response = _callback(client, query)
    assert _error_of(response) == "invalid_state"
    assert "access_token" not in response.cookies


def test_callback_refuses_a_forged_state_cookie(client: TestClient, gmail_user: User, google_only, monkeypatch):
    query = _begin(client)
    forged = jwt.encode({"state": query["state"], "type": "sso_state", "provider": "google", "nonce": "n",
                         "verifier": "v", "carry": {}, "exp": int(time.time()) + 60}, "not-our-secret", algorithm="HS256")
    _provider_says(monkeypatch, _google_claims(gmail_user.email))
    client.cookies.clear()
    client.cookies.set(f"sso_{query['state']}", forged)
    assert _error_of(_callback(client, query)) == "invalid_state"


def test_a_cookie_for_another_provider_is_refused(client: TestClient, gmail_user: User, google_only, monkeypatch):
    query = _begin(client)
    monkeypatch.setattr(settings, "MICROSOFT_SSO_CLIENT_ID", "ms-client")
    monkeypatch.setattr(settings, "MICROSOFT_SSO_CLIENT_SECRET", "ms-secret")
    _provider_says(monkeypatch, _google_claims(gmail_user.email))
    assert _error_of(_callback(client, query, provider="microsoft")) == "invalid_state"


def test_linked_account_signs_in_whatever_address_it_now_carries(client: TestClient, db, gmail_user: User, google_only, monkeypatch):
    _link(db, gmail_user)
    query = _begin(client)
    _provider_says(monkeypatch, _google_claims("renamed@elsewhere.test", email_verified=False))
    assert _callback(client, query).headers["location"] == SSO_OK
    link = db.query(UserIdentity).one()
    assert link.last_login_at is not None
    assert link.email == "renamed@elsewhere.test"


def test_linked_account_of_a_deactivated_user_is_turned_away(client: TestClient, db, gmail_user: User, google_only, monkeypatch):
    _link(db, gmail_user)
    gmail_user.is_active = False
    db.commit()
    query = _begin(client)
    _provider_says(monkeypatch, _google_claims(gmail_user.email))
    assert _error_of(_callback(client, query)) == "no_account"


def test_a_recreated_google_account_is_not_linked_on_its_own(client: TestClient, db, gmail_user: User, google_only, monkeypatch):
    _link(db, gmail_user, sub="g-old")
    query = _begin(client)
    _provider_says(monkeypatch, _google_claims(gmail_user.email, sub="g-new"))
    response = _callback(client, query)
    assert _error_of(response) == "already_linked"
    assert "access_token" not in response.cookies


def test_callback_keeps_a_picture_the_user_uploaded(client: TestClient, db, gmail_user: User, google_only, monkeypatch):
    gmail_user.profile_pic = "/api/v1/uploads/user/kept.png"
    db.commit()
    query = _begin(client)
    _, _, fetch = _provider_says(monkeypatch, _google_claims(gmail_user.email), photo=(b"\x89PNG", "image/png"))
    assert _callback(client, query).headers["location"] == SSO_OK
    fetch.assert_not_awaited()
    db.refresh(gmail_user)
    assert gmail_user.profile_pic == "/api/v1/uploads/user/kept.png"


def test_callback_keeps_signing_in_when_there_is_no_photo(client: TestClient, db, gmail_user: User, google_only, monkeypatch):
    query = _begin(client)
    _provider_says(monkeypatch, _google_claims(gmail_user.email), photo=None)
    assert _callback(client, query).headers["location"] == SSO_OK
    db.refresh(gmail_user)
    assert gmail_user.profile_pic is None


def test_callback_links_the_shopify_store_the_sign_in_started_from(client: TestClient, db, gmail_user: User, google_only, monkeypatch):
    other = Organization(name="Other", domain="other.example", timezone="UTC")
    db.add(other)
    db.flush()
    unclaimed = ShopifyShop(shop_domain="new.myshopify.com", is_installed=True)
    theirs = ShopifyShop(shop_domain="theirs.myshopify.com", is_installed=True, organization_id=other.id)
    db.add_all([unclaimed, theirs])
    db.commit()
    _provider_says(monkeypatch, _google_claims(gmail_user.email))

    for shop in (unclaimed, theirs):
        query = _begin(client, f"?shopify_flow=1&shop_id={shop.id}")
        assert _query_of(_callback(client, query))["sso"] == "ok"

    db.refresh(unclaimed)
    db.refresh(theirs)
    assert unclaimed.organization_id == gmail_user.organization_id
    assert theirs.organization_id == other.id


def test_callback_turns_away_an_address_without_an_account(client: TestClient, google_only, monkeypatch):
    query = _begin(client, "?shop_id=7")
    _provider_says(monkeypatch, _google_claims("nobody@gmail.com"))
    response = _callback(client, query)
    assert _query_of(response) == {"sso_error": "no_account", "shop_id": "7"}
    assert "access_token" not in response.cookies


def test_callback_turns_away_a_deactivated_user(client: TestClient, db, gmail_user: User, google_only, monkeypatch):
    gmail_user.is_active = False
    db.commit()
    query = _begin(client)
    _provider_says(monkeypatch, _google_claims(gmail_user.email))
    assert _error_of(_callback(client, query)) == "no_account"


def test_callback_refuses_an_address_two_users_share_in_different_case(client: TestClient, db, gmail_user: User, google_only, monkeypatch):
    db.add(User(organization_id=gmail_user.organization_id, email=gmail_user.email.upper(), full_name="Twin",
                hashed_password="x", is_active=True, role_id=gmail_user.role_id))
    db.commit()
    query = _begin(client)
    _provider_says(monkeypatch, _google_claims(gmail_user.email))
    assert _error_of(_callback(client, query)) == "ambiguous_account"
    assert db.query(UserIdentity).count() == 0


def test_google_must_be_the_authority_for_the_address(client: TestClient, db, test_user: User, google_only, monkeypatch):
    """test.user@example.com on a plain Google account: verified once, not vouched for now."""
    query = _begin(client)
    _provider_says(monkeypatch, _google_claims(test_user.email))
    assert _error_of(_callback(client, query)) == "email_unverified"
    assert db.query(UserIdentity).count() == 0


def test_a_workspace_account_of_the_addresss_domain_links(client: TestClient, db, test_user: User, google_only, monkeypatch):
    query = _begin(client)
    _provider_says(monkeypatch, _google_claims(test_user.email, hd="example.com"))
    assert _callback(client, query).headers["location"] == SSO_OK


def test_callback_requires_google_to_have_verified_the_address(client: TestClient, db, gmail_user: User, google_only, monkeypatch):
    query = _begin(client)
    _provider_says(monkeypatch, _google_claims(gmail_user.email, email_verified=False))
    assert _error_of(_callback(client, query)) == "email_unverified"


def test_a_hosted_domain_turns_other_google_accounts_away(client: TestClient, gmail_user: User, google_only, monkeypatch):
    monkeypatch.setattr(settings, "GOOGLE_SSO_HOSTED_DOMAIN", "acme.test")
    query = _begin(client)
    _provider_says(monkeypatch, _google_claims(gmail_user.email))
    assert _error_of(_callback(client, query)) == "wrong_domain"


def test_microsoft_directory_address_cannot_link_an_account(client: TestClient, db, test_user: User, microsoft_common, monkeypatch):
    """nOAuth: any tenant's admin can give a user someone else's address."""
    query = _begin(client, provider="microsoft")
    _provider_says(monkeypatch, {"iss": "https://login.microsoftonline.com/attacker/v2.0", "tid": "attacker",
                                 "sub": "ms-1", "oid": "o-1", "email": test_user.email})
    response = _callback(client, query, provider="microsoft")
    assert _error_of(response) == "email_unverified"
    assert "access_token" not in response.cookies
    assert db.query(UserIdentity).count() == 0


def test_microsoft_verified_domain_links_by_object_id(client: TestClient, db, test_user: User, microsoft_common, monkeypatch):
    query = _begin(client, provider="microsoft")
    _provider_says(monkeypatch, {"iss": "https://login.microsoftonline.com/acme/v2.0", "tid": "acme",
                                 "sub": "pairwise", "oid": "o-1", "email": test_user.email, "xms_edov": True})
    assert _callback(client, query, provider="microsoft").headers["location"] == SSO_OK
    link = db.query(UserIdentity).one()
    assert (link.provider, link.issuer, link.subject) == ("microsoft", "https://login.microsoftonline.com/acme/v2.0", "o-1")


def test_a_sign_in_policy_can_refuse(client: TestClient, db, gmail_user: User, google_only, monkeypatch):
    def refuse(db_, user, method, identity=None):
        assert (method, identity.email) == ("sso", gmail_user.email)
        raise SignInRefused("not today")
    monkeypatch.setattr(sso_api, "check_sign_in", refuse)
    query = _begin(client)
    _provider_says(monkeypatch, _google_claims(gmail_user.email))
    response = _callback(client, query)
    assert _error_of(response) == "sign_in_refused"
    assert "not today" not in response.headers["location"]
    assert db.query(UserIdentity).count() == 0  # rolled back with the refusal


def test_callback_reports_a_bad_token_without_detail(client: TestClient, google_only, monkeypatch):
    query = _begin(client)
    monkeypatch.setattr(sso_service, "exchange_code", AsyncMock(return_value={"id_token": "forged"}))
    monkeypatch.setattr(sso_service, "verify_id_token", AsyncMock(side_effect=sso_service.SsoError("invalid_token", "signature")))
    response = _callback(client, query)
    assert _error_of(response) == "invalid_token"
    assert "signature" not in response.headers["location"]


def test_callback_reports_an_unreachable_provider(client: TestClient, google_only, monkeypatch):
    query = _begin(client, "?redirect=%2Fx")
    monkeypatch.setattr(sso_service, "exchange_code", AsyncMock(side_effect=httpx.ConnectError("down")))
    assert _query_of(_callback(client, query)) == {"sso_error": "provider_error", "redirect": "/x"}


def test_an_unexpected_failure_lands_on_the_login_page(client: TestClient, db, gmail_user: User, google_only, monkeypatch):
    query = _begin(client, "?shop_id=7")
    _provider_says(monkeypatch, _google_claims(gmail_user.email))
    monkeypatch.setattr(sso_api, "issue_tokens", lambda *a, **k: (_ for _ in ()).throw(RuntimeError("db down")))
    response = _callback(client, query)
    assert _query_of(response) == {"sso_error": "server_error", "shop_id": "7"}
    assert f"sso_{query['state']}" not in client.cookies
    assert db.query(UserIdentity).count() == 0


def test_callback_without_a_code_is_a_provider_error(client: TestClient, google_only):
    query = _begin(client)
    response = client.get(f"/api/v1/sso/google/callback?error=access_denied&state={query['state']}", follow_redirects=False)
    assert _error_of(response) == "provider_error"


def test_callback_with_an_unknown_state_is_rejected(client: TestClient, google_only):
    response = client.get("/api/v1/sso/google/callback?code=abc&state=made-up", follow_redirects=False)
    assert _error_of(response) == "invalid_state"


def test_me_needs_a_signed_in_user(client: TestClient, google_only):
    assert client.get("/api/v1/users/me").status_code == 401


# --- an admin's view of linked accounts ---------------------------------------------

def _signed_in_admin(client: TestClient, user: User, monkeypatch) -> None:
    _provider_says(monkeypatch, _google_claims(user.email))
    assert _callback(client, _begin(client)).headers["location"] == SSO_OK


def test_an_admin_lists_and_unlinks_a_team_members_accounts(client: TestClient, db, gmail_user: User, google_only, monkeypatch):
    _signed_in_admin(client, gmail_user, monkeypatch)
    listed = client.get(f"/api/v1/users/{gmail_user.id}/identities").json()
    assert [(i["provider"], i["email"]) for i in listed] == [("google", gmail_user.email)]

    assert client.delete(f"/api/v1/users/{gmail_user.id}/identities/{listed[0]['id']}").status_code == 204
    assert db.query(UserIdentity).count() == 0
    # Unlinking ended the session that account opened, this one included.
    assert client.get("/api/v1/users/me").status_code == 401


def test_unlinking_an_unknown_account_is_404(client: TestClient, gmail_user: User, google_only, monkeypatch):
    _signed_in_admin(client, gmail_user, monkeypatch)
    assert client.delete(f"/api/v1/users/{gmail_user.id}/identities/{uuid.uuid4()}").status_code == 404


def test_another_organizations_team_member_is_404(client: TestClient, db, gmail_user: User, google_only, monkeypatch):
    other = Organization(name="Other", domain="other.example", timezone="UTC")
    db.add(other)
    db.flush()
    stranger = User(organization_id=other.id, email="s@other.example", full_name="S", hashed_password="x", is_active=True)
    db.add(stranger)
    db.commit()
    _signed_in_admin(client, gmail_user, monkeypatch)
    assert client.get(f"/api/v1/users/{stranger.id}/identities").status_code == 404
    assert client.delete(f"/api/v1/users/{stranger.id}/identities/{uuid.uuid4()}").status_code == 404

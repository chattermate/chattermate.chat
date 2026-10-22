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

The parts of SSO that talk to a provider, exercised against real signatures
and an in-memory HTTP transport, and the per-provider rules.
"""

import base64
import hashlib
import time
from unittest.mock import AsyncMock
from urllib.parse import parse_qs, urlparse

import httpx
import pytest
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import rsa
from jose import jwk, jwt

from app.core.config import settings
from app.services import sso
from app.services.sso_providers import (
    MICROSOFT_CONSUMER_TENANT_ID, MICROSOFT_GRAPH_PHOTO_URL, Provider, SsoError, get_provider, providers,
)

GOOGLE_ISS = "https://accounts.google.com"


@pytest.fixture
def both_providers(monkeypatch):
    monkeypatch.setattr(settings, "GOOGLE_SSO_CLIENT_ID", "google-client")
    monkeypatch.setattr(settings, "GOOGLE_SSO_CLIENT_SECRET", "google-secret")
    monkeypatch.setattr(settings, "GOOGLE_SSO_HOSTED_DOMAIN", "")
    monkeypatch.setattr(settings, "MICROSOFT_SSO_CLIENT_ID", "ms-client")
    monkeypatch.setattr(settings, "MICROSOFT_SSO_CLIENT_SECRET", "ms-secret")
    monkeypatch.setattr(settings, "MICROSOFT_SSO_TENANT", "common")
    sso.clear_caches()
    yield
    sso.clear_caches()


@pytest.fixture(scope="module")
def signing_key():
    """An RSA key pair as a provider would publish it: the private PEM signs,
    the public JWK (with a kid) is what the JWKS endpoint serves."""
    private = rsa.generate_private_key(public_exponent=65537, key_size=2048)
    private_pem = private.private_bytes(
        serialization.Encoding.PEM, serialization.PrivateFormat.PKCS8, serialization.NoEncryption()
    ).decode()
    public_pem = private.public_key().public_bytes(
        serialization.Encoding.PEM, serialization.PublicFormat.SubjectPublicKeyInfo
    ).decode()
    public_jwk = jwk.construct(public_pem, algorithm="RS256").to_dict()
    public_jwk["kid"] = "key-1"
    return private_pem, public_jwk


def _token(private_pem: str, claims: dict, kid: str = "key-1") -> str:
    now = int(time.time())
    return jwt.encode({"iat": now, "exp": now + 300, **claims}, private_pem, algorithm="RS256", headers={"kid": kid})


def _stub_metadata(monkeypatch, public_jwk, issuer):
    monkeypatch.setattr(sso, "discovery", AsyncMock(return_value={
        "issuer": issuer, "jwks_uri": "https://keys.example",
        "authorization_endpoint": "https://auth.example/authorize", "token_endpoint": "https://auth.example/token",
    }))
    jwks = AsyncMock(return_value={"keys": [public_jwk]})
    monkeypatch.setattr(sso, "jwks", jwks)
    return jwks


def _transport(handler):
    def factory(**kwargs):
        return httpx.AsyncClient(transport=httpx.MockTransport(handler), **kwargs)
    return factory


# --- configuration -------------------------------------------------------------

def test_providers_follow_configuration_and_tenant(both_providers, monkeypatch):
    assert list(providers()) == ["google", "microsoft"]
    assert "login.microsoftonline.com/common/" in providers()["microsoft"].discovery_url
    monkeypatch.setattr(settings, "MICROSOFT_SSO_TENANT", "11111111-2222-3333-4444-555555555555")
    assert "login.microsoftonline.com/11111111-2222-3333-4444-555555555555/" in providers()["microsoft"].discovery_url
    monkeypatch.setattr(settings, "GOOGLE_SSO_CLIENT_SECRET", "")
    assert list(providers()) == ["microsoft"]


def test_redirect_uri_derives_from_backend_url(both_providers, monkeypatch):
    monkeypatch.setattr(settings, "BACKEND_URL", "https://api.example.test/")
    assert sso.redirect_uri(get_provider("google")) == "https://api.example.test/api/v1/sso/google/callback"


# --- authorization request and code exchange (PKCE) -----------------------------

def test_pkce_pair_is_s256():
    verifier, challenge = sso.new_pkce_pair()
    assert len(verifier) >= 43
    expected = base64.urlsafe_b64encode(hashlib.sha256(verifier.encode()).digest()).rstrip(b"=").decode()
    assert challenge == expected
    assert sso.new_pkce_pair()[0] != verifier


@pytest.mark.asyncio
async def test_authorize_url_carries_state_nonce_and_challenge(both_providers, signing_key, monkeypatch):
    _stub_metadata(monkeypatch, signing_key[1], GOOGLE_ISS)
    url = await sso.authorize_url(get_provider("google"), "st", "no", "ch")
    query = {k: v[0] for k, v in parse_qs(urlparse(url).query).items()}
    assert url.startswith("https://auth.example/authorize?")
    assert (query["state"], query["nonce"], query["code_challenge"], query["code_challenge_method"]) == ("st", "no", "ch", "S256")
    assert "hd" not in query


@pytest.mark.asyncio
async def test_a_hosted_domain_is_asked_for(both_providers, signing_key, monkeypatch):
    monkeypatch.setattr(settings, "GOOGLE_SSO_HOSTED_DOMAIN", "Acme.Test")
    _stub_metadata(monkeypatch, signing_key[1], GOOGLE_ISS)
    url = await sso.authorize_url(get_provider("google"), "st", "no", "ch")
    assert parse_qs(urlparse(url).query)["hd"] == ["acme.test"]


@pytest.mark.asyncio
async def test_the_code_is_redeemed_with_the_verifier(both_providers, signing_key, monkeypatch):
    _stub_metadata(monkeypatch, signing_key[1], GOOGLE_ISS)
    seen = {}

    def handler(request):
        seen.update({k: v[0] for k, v in parse_qs(request.content.decode()).items()})
        return httpx.Response(200, json={"id_token": "id", "access_token": "at"})

    monkeypatch.setattr(sso, "http_client", _transport(handler))
    assert (await sso.exchange_code(get_provider("google"), "the-code", "the-verifier"))["id_token"] == "id"
    assert seen["code"] == "the-code"
    assert seen["code_verifier"] == "the-verifier"
    assert seen["grant_type"] == "authorization_code"


# --- ID token verification -----------------------------------------------------

@pytest.mark.asyncio
async def test_a_genuine_google_token_is_accepted(both_providers, signing_key, monkeypatch):
    private_pem, public_jwk = signing_key
    _stub_metadata(monkeypatch, public_jwk, GOOGLE_ISS)
    token = _token(private_pem, {"iss": GOOGLE_ISS, "aud": "google-client", "sub": "1", "nonce": "n1",
                                 "email": "a@example.test", "email_verified": True})
    claims = await sso.verify_id_token(get_provider("google"), token, "n1")
    assert claims["email"] == "a@example.test"


@pytest.mark.asyncio
@pytest.mark.parametrize("bad, code_detail", [
    ({"aud": "someone-else"}, "rejected"),      # not addressed to us
    ({"nonce": "other"}, "nonce"),              # not the sign-in we started
    ({"nonce": None}, "nonce"),                 # no nonce at all
    ({"iss": "https://evil.example"}, "issuer"), # not the provider
    ({"exp": int(time.time()) - 10}, "rejected"),  # expired
])
async def test_tokens_that_are_not_for_us_are_refused(both_providers, signing_key, monkeypatch, bad, code_detail):
    private_pem, public_jwk = signing_key
    _stub_metadata(monkeypatch, public_jwk, GOOGLE_ISS)
    claims = {k: v for k, v in {"iss": GOOGLE_ISS, "aud": "google-client", "sub": "1", "nonce": "n1", **bad}.items() if v is not None}
    token = _token(private_pem, claims)
    with pytest.raises(SsoError) as err:
        await sso.verify_id_token(get_provider("google"), token, "n1")
    assert err.value.code == "invalid_token"
    assert code_detail in err.value.detail


@pytest.mark.asyncio
async def test_a_sign_in_without_a_nonce_is_refused(both_providers, signing_key, monkeypatch):
    private_pem, public_jwk = signing_key
    _stub_metadata(monkeypatch, public_jwk, GOOGLE_ISS)
    token = _token(private_pem, {"iss": GOOGLE_ISS, "aud": "google-client", "sub": "1"})
    with pytest.raises(SsoError) as err:
        await sso.verify_id_token(get_provider("google"), token, "")
    assert err.value.code == "invalid_token"


@pytest.mark.asyncio
async def test_a_token_signed_by_another_key_is_refused(both_providers, signing_key, monkeypatch):
    _, public_jwk = signing_key
    other = rsa.generate_private_key(public_exponent=65537, key_size=2048)
    other_pem = other.private_bytes(serialization.Encoding.PEM, serialization.PrivateFormat.PKCS8,
                                    serialization.NoEncryption()).decode()
    jwks = _stub_metadata(monkeypatch, public_jwk, GOOGLE_ISS)
    claims = {"iss": GOOGLE_ISS, "aud": "google-client", "sub": "1", "nonce": "n1"}
    with pytest.raises(SsoError):
        await sso.verify_id_token(get_provider("google"), _token(other_pem, claims, kid="key-1"), "n1")
    # An unknown kid is looked up once more in case the provider rotated keys.
    with pytest.raises(SsoError) as err:
        await sso.verify_id_token(get_provider("google"), _token(other_pem, claims, kid="key-9"), "n1")
    assert "unknown key" in err.value.detail
    assert jwks.call_args.kwargs.get("force") is True


@pytest.mark.asyncio
async def test_microsoft_multi_tenant_issuer_must_match_the_tokens_tenant(both_providers, signing_key, monkeypatch):
    private_pem, public_jwk = signing_key
    _stub_metadata(monkeypatch, public_jwk, "https://login.microsoftonline.com/{tenantid}/v2.0")
    provider = get_provider("microsoft")
    good = _token(private_pem, {"iss": "https://login.microsoftonline.com/tenant-a/v2.0", "tid": "tenant-a",
                                "aud": "ms-client", "sub": "1", "nonce": "n1", "email": "b@example.test"})
    assert (await sso.verify_id_token(provider, good, "n1"))["tid"] == "tenant-a"
    forged = _token(private_pem, {"iss": "https://login.microsoftonline.com/tenant-a/v2.0", "tid": "tenant-b",
                                  "aud": "ms-client", "sub": "1", "nonce": "n1"})
    with pytest.raises(SsoError):
        await sso.verify_id_token(provider, forged, "n1")


@pytest.mark.asyncio
async def test_a_pinned_microsoft_tenant_checks_the_published_issuer(both_providers, signing_key, monkeypatch):
    private_pem, public_jwk = signing_key
    monkeypatch.setattr(settings, "MICROSOFT_SSO_TENANT", "tenant-a")
    _stub_metadata(monkeypatch, public_jwk, "https://login.microsoftonline.com/tenant-a/v2.0")
    other_tenant = _token(private_pem, {"iss": "https://login.microsoftonline.com/tenant-b/v2.0", "tid": "tenant-b",
                                        "aud": "ms-client", "sub": "1", "nonce": "n1"})
    with pytest.raises(SsoError):
        await sso.verify_id_token(get_provider("microsoft"), other_tenant, "n1")


# --- identity and trust ----------------------------------------------------------

def _ms(tid: str, **claims) -> dict:
    return {"iss": f"https://login.microsoftonline.com/{tid}/v2.0", "tid": tid, "sub": "pairwise", "oid": "oid-1", **claims}


def test_google_identity(both_providers):
    identity = sso.identity_from_claims(get_provider("google"), {
        "iss": "accounts.google.com", "sub": "g-1", "email": "A@Gmail.com", "email_verified": True, "name": "Ann"})
    # One spelling of the issuer, whichever Google sent.
    assert (identity.issuer, identity.subject, identity.email, identity.email_trusted, identity.name) == (
        GOOGLE_ISS, "g-1", "a@gmail.com", True, "Ann")
    with pytest.raises(SsoError) as err:
        sso.identity_from_claims(get_provider("google"), {"iss": GOOGLE_ISS, "email": "a@gmail.com", "email_verified": True})
    assert err.value.code == "invalid_token"


@pytest.mark.parametrize("claims, trusted", [
    ({"email": "a@gmail.com", "email_verified": True}, True),
    ({"email": "a@googlemail.com", "email_verified": "true"}, True),
    ({"email": "a@acme.test", "email_verified": True, "hd": "acme.test"}, True),
    # A Google account made with a work address, not a Workspace account: Google
    # only saw that address once, so it can't vouch for it now.
    ({"email": "a@acme.test", "email_verified": True}, False),
    ({"email": "a@acme.test", "email_verified": True, "hd": "other.test"}, False),
    ({"email": "a@gmail.com", "email_verified": False}, False),
    ({"email": "a@gmail.com"}, False),
])
def test_google_vouches_only_where_it_is_the_authority(both_providers, claims, trusted):
    identity = sso.identity_from_claims(get_provider("google"), {"iss": GOOGLE_ISS, "sub": "g-1", **claims})
    assert identity.email_trusted is trusted


def test_a_hosted_domain_turns_other_accounts_away(both_providers, monkeypatch):
    monkeypatch.setattr(settings, "GOOGLE_SSO_HOSTED_DOMAIN", "acme.test")
    google = get_provider("google")
    assert sso.identity_from_claims(google, {"iss": GOOGLE_ISS, "sub": "1", "email": "a@acme.test",
                                             "email_verified": True, "hd": "acme.test"}).hosted_domain == "acme.test"
    for claims in ({"email": "a@gmail.com", "email_verified": True}, {"email": "a@x.test", "email_verified": True, "hd": "x.test"}):
        with pytest.raises(SsoError) as err:
            sso.identity_from_claims(google, {"iss": GOOGLE_ISS, "sub": "1", **claims})
        assert err.value.code == "wrong_domain"


def test_microsoft_account_is_its_tenant_object_id(both_providers):
    """`sub` changes with the app registration; `oid` doesn't."""
    identity = sso.identity_from_claims(get_provider("microsoft"), _ms("acme", email="a@acme.test"))
    assert (identity.subject, identity.tenant_id) == ("oid-1", "acme")
    no_oid = {k: v for k, v in _ms("acme").items() if k != "oid"}
    assert sso.identity_from_claims(get_provider("microsoft"), no_oid).subject == "pairwise"


def test_microsoft_directory_address_is_not_trusted_on_a_shared_tenant(both_providers):
    """nOAuth: in someone else's tenant the admin types in whatever address they like."""
    identity = sso.identity_from_claims(get_provider("microsoft"), _ms("attacker", email="ceo@victim.test"))
    assert identity.email == "ceo@victim.test"
    assert identity.email_trusted is False


@pytest.mark.parametrize("claims", [
    _ms("acme", email="a@acme.test", xms_edov=True),
    _ms("acme", email="a@acme.test", xms_edov="1"),
    _ms(MICROSOFT_CONSUMER_TENANT_ID, email="a@outlook.test"),
])
def test_microsoft_address_is_trusted_when_microsoft_vouches_for_it(both_providers, claims):
    assert sso.identity_from_claims(get_provider("microsoft"), claims).email_trusted is True


@pytest.mark.parametrize("tenant, trusted", [
    ("11111111-2222-3333-4444-555555555555", True),
    ("acme.onmicrosoft.com", True),
    ("organizations", False),
    ("Common", False),
])
def test_a_pinned_tenant_trusts_its_own_directory(both_providers, monkeypatch, tenant, trusted):
    monkeypatch.setattr(settings, "MICROSOFT_SSO_TENANT", tenant)
    identity = sso.identity_from_claims(get_provider("microsoft"), _ms("acme", email="a@acme.test"))
    assert identity.email_trusted is trusted


def test_microsoft_falls_back_to_the_sign_in_name(both_providers):
    microsoft = get_provider("microsoft")
    identity = sso.identity_from_claims(microsoft, _ms("acme", preferred_username="Bob@Example.Test",
                                                       given_name="Bob", family_name="B"))
    assert (identity.email, identity.name) == ("bob@example.test", "Bob B")
    bare = sso.identity_from_claims(microsoft, _ms("acme", preferred_username="bob"))
    assert (bare.email, bare.email_trusted) == ("", False)


def test_a_plain_oidc_provider_gets_the_generic_rules():
    """What a third provider would get without a subclass: its own issuer,
    `sub`, `email_verified`, and no photo (never Microsoft's Graph)."""
    plain = Provider(key="okta", label="Okta", discovery_url="https://okta.example/.well-known/openid-configuration",
                     scopes="openid email", client_id="c", client_secret="s")
    claims = {"iss": "https://okta.example", "sub": "o-1", "email": "a@acme.test", "email_verified": True, "oid": "x"}
    assert plain.issuer_ok(claims, {"issuer": "https://okta.example"})
    assert not plain.issuer_ok(claims, {"issuer": "https://other.example"})
    identity = sso.identity_from_claims(plain, claims)
    assert (identity.subject, identity.email_trusted) == ("o-1", True)
    assert plain.photo_request(claims, "token") is None


def test_photo_requests(both_providers):
    google, microsoft = get_provider("google"), get_provider("microsoft")
    assert google.photo_request({"picture": "https://lh3.googleusercontent.com/a/abc=s96-c"}, None) == (
        "https://lh3.googleusercontent.com/a/abc=s256-c", {})
    for picture in ("https://evil.example/x.png", "http://lh3.googleusercontent.com/x", ""):
        assert google.photo_request({"picture": picture}, None) is None
    assert microsoft.photo_request({}, "graph-token") == (MICROSOFT_GRAPH_PHOTO_URL, {"Authorization": "Bearer graph-token"})
    assert microsoft.photo_request({}, None) is None


# --- provider metadata ------------------------------------------------------------

@pytest.mark.asyncio
@pytest.mark.parametrize("response", [
    httpx.Response(200, content=b"<html>maintenance</html>"),
    httpx.Response(200, json=["not", "an", "object"]),
])
async def test_metadata_that_is_not_a_json_object_is_a_provider_error(both_providers, monkeypatch, response):
    monkeypatch.setattr(sso, "http_client", _transport(lambda r: response))
    with pytest.raises(SsoError) as err:
        await sso.discovery(get_provider("google"))
    assert err.value.code == "provider_error"


@pytest.mark.asyncio
async def test_a_discovery_document_without_endpoints_is_a_provider_error(both_providers, monkeypatch):
    monkeypatch.setattr(sso, "discovery", AsyncMock(return_value={"issuer": GOOGLE_ISS}))
    google = get_provider("google")
    for call in (sso.authorize_url(google, "s", "n", "c"), sso.exchange_code(google, "c", "v"), sso.jwks(google)):
        with pytest.raises(SsoError) as err:
            await call
        assert err.value.code == "provider_error"


@pytest.mark.asyncio
@pytest.mark.parametrize("response, detail", [
    (httpx.Response(200, content=b"<html>"), "not JSON"),
    (httpx.Response(200, json={"access_token": "at"}), "no id_token"),
    (httpx.Response(400, json={"error": "invalid_grant"}), "answered 400"),
])
async def test_a_bad_token_response_is_a_provider_error(both_providers, monkeypatch, response, detail):
    monkeypatch.setattr(sso, "discovery", AsyncMock(return_value={"token_endpoint": "https://token.example"}))
    monkeypatch.setattr(sso, "http_client", _transport(lambda r: response))
    with pytest.raises(SsoError) as err:
        await sso.exchange_code(get_provider("google"), "c", "v")
    assert err.value.code == "provider_error"
    assert detail in err.value.detail

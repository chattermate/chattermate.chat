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

Single sign-on for the dashboard over OpenID Connect (authorization-code flow
with PKCE).

/sso/{provider}/start sends the browser to the provider; it comes back to
/sso/{provider}/callback with a code. The backend exchanges the code, checks
the ID token against the provider's published signing keys, finds the
dashboard user the account is linked to (app.services.sso_accounts) and opens
the same session a password login would. SSO never creates accounts: admins
still decide who is on the team, SSO only decides how they sign in.

What differs per provider lives in app.services.sso_providers; the browser
side of a sign-in in progress in app.services.sso_state.

No client library: discovery documents and key sets are fetched with httpx
and the token is verified with python-jose, which already signs the app's own
JWTs.
"""

import base64
import hashlib
import secrets
import time
from dataclasses import dataclass, field
from typing import Dict, Optional, Tuple
from urllib.parse import urlencode

import httpx
from jose import JWTError, jwt

from app.core.config import settings
from app.services.sso_providers import Provider, SsoError

_HTTP_TIMEOUT = 10.0
_METADATA_TTL_SECONDS = 60 * 60


def redirect_uri(provider: Provider) -> str:
    """Derived from BACKEND_URL like every other OAuth callback in the app, so
    the only thing to register at the provider is this exact URL."""
    return f"{settings.BACKEND_URL.rstrip('/')}{settings.API_V1_STR}/sso/{provider.key}/callback"


def new_pkce_pair() -> Tuple[str, str]:
    """(code_verifier, S256 code_challenge) for one sign-in."""
    verifier = secrets.token_urlsafe(48)
    challenge = base64.urlsafe_b64encode(hashlib.sha256(verifier.encode()).digest()).rstrip(b"=").decode()
    return verifier, challenge


# ---------------------------------------------------------------------------
# Provider metadata. Per-process caches: a worker refetches two small documents
# an hour, which is nothing, and a rotated key is picked up on demand.
# ---------------------------------------------------------------------------
_discovery_cache: Dict[str, Tuple[dict, float]] = {}
_jwks_cache: Dict[str, Tuple[dict, float]] = {}


def http_client(**kwargs) -> httpx.AsyncClient:
    return httpx.AsyncClient(timeout=_HTTP_TIMEOUT, verify=settings.VERIFY_SSL_CERTIFICATES, **kwargs)


def _json_of(response: httpx.Response, what: str) -> dict:
    try:
        body = response.json()
    except ValueError:
        raise SsoError("provider_error", f"{what} is not JSON: {response.text[:200]}")
    if not isinstance(body, dict):
        raise SsoError("provider_error", f"{what} is not a JSON object")
    return body


def _endpoint(doc: dict, name: str) -> str:
    """A URL the discovery document must publish."""
    url = doc.get(name)
    if not isinstance(url, str) or not url:
        raise SsoError("provider_error", f"discovery document has no {name}")
    return url


async def _get_json(url: str) -> dict:
    async with http_client() as client:
        response = await client.get(url)
        response.raise_for_status()
        return _json_of(response, url)


def _fresh(entry: Optional[Tuple[dict, float]]) -> Optional[dict]:
    if entry and time.time() - entry[1] < _METADATA_TTL_SECONDS:
        return entry[0]
    return None


async def discovery(provider: Provider) -> dict:
    doc = _fresh(_discovery_cache.get(provider.key))
    if doc is None:
        doc = await _get_json(provider.discovery_url)
        _discovery_cache[provider.key] = (doc, time.time())
    return doc


async def jwks(provider: Provider, force: bool = False) -> dict:
    keys = None if force else _fresh(_jwks_cache.get(provider.key))
    if keys is None:
        keys = await _get_json(_endpoint(await discovery(provider), "jwks_uri"))
        _jwks_cache[provider.key] = (keys, time.time())
    return keys


def clear_caches() -> None:
    """Tests and config changes."""
    _discovery_cache.clear()
    _jwks_cache.clear()


# ---------------------------------------------------------------------------
# The flow
# ---------------------------------------------------------------------------
async def authorize_url(provider: Provider, state: str, nonce: str, code_challenge: str) -> str:
    doc = await discovery(provider)
    params = {
        "client_id": provider.client_id,
        "redirect_uri": redirect_uri(provider),
        "response_type": "code",
        "scope": provider.scopes,
        "state": state,
        "nonce": nonce,
        "code_challenge": code_challenge,
        "code_challenge_method": "S256",
        # Always offer the account chooser: a shared machine must not silently
        # sign in whoever Google/Microsoft remembers.
        "prompt": "select_account",
        **provider.authorize_params(),
    }
    return f"{_endpoint(doc, 'authorization_endpoint')}?{urlencode(params)}"


async def exchange_code(provider: Provider, code: str, code_verifier: str) -> dict:
    """Redeem the authorization code. Returns the provider's token response
    (id_token, access_token, ...)."""
    doc = await discovery(provider)
    async with http_client() as client:
        response = await client.post(
            _endpoint(doc, "token_endpoint"),
            data={
                "grant_type": "authorization_code",
                "code": code,
                "redirect_uri": redirect_uri(provider),
                "client_id": provider.client_id,
                "client_secret": provider.client_secret,
                "code_verifier": code_verifier,
            },
        )
    if response.status_code != 200:
        raise SsoError("provider_error", f"{provider.key} token endpoint answered {response.status_code}: {response.text[:200]}")
    tokens = _json_of(response, f"{provider.key} token response")
    if not tokens.get("id_token"):
        raise SsoError("provider_error", f"{provider.key} token response carries no id_token")
    return tokens


def _key_for(keys: dict, kid: Optional[str]) -> Optional[dict]:
    for key in keys.get("keys", []):
        if key.get("kid") == kid:
            return key
    return None


async def verify_id_token(provider: Provider, id_token: str, nonce: str) -> dict:
    """The claims of an ID token that is genuinely for us: signed by a key the
    provider publishes, addressed to our client id, from the expected issuer,
    unexpired, and carrying the nonce this sign-in started with."""
    if not nonce:
        raise SsoError("invalid_token", "sign-in carries no nonce to check the id_token against")
    try:
        header = jwt.get_unverified_header(id_token)
    except JWTError as e:
        raise SsoError("invalid_token", f"unreadable id_token header: {e}")
    kid = header.get("kid")
    key = _key_for(await jwks(provider), kid)
    if key is None:
        # Key rotation: the set we hold predates this key. Refetch once.
        key = _key_for(await jwks(provider, force=True), kid)
        if key is None:
            raise SsoError("invalid_token", f"{provider.key} id_token signed with unknown key {kid}")
    try:
        claims = jwt.decode(
            id_token,
            key,
            algorithms=["RS256"],
            audience=provider.client_id,
            options={"verify_at_hash": False},
        )
    except JWTError as e:
        raise SsoError("invalid_token", f"{provider.key} id_token rejected: {e}")
    if not provider.issuer_ok(claims, await discovery(provider)):
        raise SsoError("invalid_token", f"{provider.key} id_token from unexpected issuer {claims.get('iss')}")
    if not secrets.compare_digest(str(claims.get("nonce") or ""), nonce):
        raise SsoError("invalid_token", f"{provider.key} id_token nonce mismatch")
    return claims


@dataclass(frozen=True)
class SsoIdentity:
    """Who the provider says signed in. `issuer` + `subject` is the stable
    account id; the e-mail is only good for linking when `email_trusted`.
    `hosted_domain`, `tenant_id` and `claims` are there for sign-in policy."""
    issuer: str
    subject: str
    email: str
    email_trusted: bool
    name: str
    hosted_domain: Optional[str] = None
    tenant_id: Optional[str] = None
    claims: dict = field(default_factory=dict, compare=False, repr=False)


def identity_from_claims(provider: Provider, claims: dict) -> SsoIdentity:
    """The account a verified ID token describes."""
    provider.check_claims(claims)
    subject = provider.subject(claims)
    if not subject:
        raise SsoError("invalid_token", f"{provider.key} id_token carries no subject")
    email = provider.email(claims)
    name = claims.get("name") or " ".join(
        part for part in (claims.get("given_name"), claims.get("family_name")) if part
    )
    return SsoIdentity(
        issuer=provider.issuer(claims),
        subject=subject,
        email=email,
        email_trusted=bool(email) and provider.email_trusted(claims, email),
        name=name or email,
        hosted_domain=provider.hosted_domain(claims),
        tenant_id=provider.tenant_id(claims),
        claims=claims,
    )

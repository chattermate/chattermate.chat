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

The browser's half of a single sign-on in progress.

/sso/{provider}/start puts everything the callback needs (provider, nonce,
PKCE verifier, the login page's parameters) in a short-lived httpOnly cookie
signed with a key derived from SECRET_KEY and named after the sign-in's `state`. Nothing is kept
on the server, so any worker or replica can finish the sign-in, Redis or not.
A callback link started in another browser finds no cookie and is refused
(login CSRF). Starting a sign-in clears any this browser left unfinished.
"""

import hashlib
import hmac
import re
import time
from typing import Optional
from urllib.parse import urlparse

from fastapi import Request, Response
from jose import JWTError, jwt

from app.core.config import settings

TTL_SECONDS = 10 * 60
_COOKIE_PREFIX = "sso_"
_TOKEN_TYPE = "sso_state"
# What `secrets.token_urlsafe(24)` yields; anything else can't be ours and
# must not end up in a cookie name.
_STATE_PATTERN = re.compile(r"^[A-Za-z0-9_-]{16,64}$")


def cookie_path(api_path: str = "/sso") -> str:
    """Where `api_path` (under /api/v1; the callback by default) is served, as
    the browser sees it: BACKEND_URL may carry a path a reverse proxy strips
    before the app."""
    prefix = urlparse(settings.BACKEND_URL).path.rstrip("/")
    return f"{prefix}{settings.API_V1_STR}{api_path}"


def _cookie_name(state: str) -> Optional[str]:
    return f"{_COOKIE_PREFIX}{state}" if state and _STATE_PATTERN.match(state) else None


def signing_key(purpose: str = _TOKEN_TYPE) -> str:
    """A key of its own for each kind of signed cookie, so one can never be
    mistaken for another (or for a session token) whatever its claims say."""
    return hmac.new(settings.SECRET_KEY.encode(), purpose.encode(), hashlib.sha256).hexdigest()


def remember(response: Response, state: str, payload: dict) -> None:
    """Hand this browser the sign-in it is starting."""
    token = jwt.encode(
        {**payload, "state": state, "type": _TOKEN_TYPE, "exp": int(time.time()) + TTL_SECONDS},
        signing_key(),
        algorithm="HS256",
    )
    # Lax: the provider brings the browser back with a top-level GET.
    response.set_cookie(
        _cookie_name(state), token, max_age=TTL_SECONDS, path=cookie_path(),
        httponly=True, secure=True, samesite="lax",
    )


def _payload(request: Request, state: Optional[str], expired_ok: bool) -> Optional[dict]:
    name = _cookie_name(state or "")
    token = request.cookies.get(name) if name else None
    if not token:
        return None
    try:
        payload = jwt.decode(token, signing_key(), algorithms=["HS256"], options={"verify_exp": not expired_ok})
    except JWTError:
        return None
    if payload.get("type") != _TOKEN_TYPE or payload.get("state") != state:
        return None
    return payload


def recall(request: Request, state: Optional[str]) -> Optional[dict]:
    """The sign-in this browser started with `state`, or None when it started
    none (expired, tampered with, or someone else's link)."""
    return _payload(request, state, expired_ok=False)


def carried_after_expiry(request: Request, state: Optional[str]) -> dict:
    """The login page's parameters of a sign-in this browser started but took
    too long to finish, so the retry stays in the same flow (a Shopify install,
    a ?redirect=). Only what we signed, never anything to sign in with."""
    payload = _payload(request, state, expired_ok=True)
    carried = payload.get("carry") if payload else None
    return carried if isinstance(carried, dict) else {}


def _delete(response: Response, name: str) -> None:
    response.delete_cookie(name, path=cookie_path(), httponly=True, secure=True, samesite="lax")


def forget(response: Response, state: Optional[str]) -> None:
    """Spend the sign-in, whatever its outcome."""
    name = _cookie_name(state or "")
    if name:
        _delete(response, name)


def forget_abandoned(request: Request, response: Response) -> None:
    """Clear sign-ins this browser started and never finished (the person went
    back from the provider): each is a cookie of a few KB, and a handful would
    push the Cookie header past what proxies accept."""
    for name in request.cookies:
        if name.startswith(_COOKIE_PREFIX) and _STATE_PATTERN.match(name[len(_COOKIE_PREFIX):]):
            _delete(response, name)

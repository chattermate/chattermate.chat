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

The browser half of an SSO sign-in: a signed cookie per sign-in.
"""

import time

import pytest
from fastapi import Response
from jose import jwt
from starlette.requests import Request

from app.core.config import settings
from app.services import sso_state

STATE = "s" * 32


def _request(cookies: dict) -> Request:
    header = "; ".join(f"{k}={v}" for k, v in cookies.items())
    return Request({"type": "http", "headers": [(b"cookie", header.encode())] if header else []})


def _issued(state: str = STATE, payload: dict = None) -> tuple:
    response = Response()
    sso_state.remember(response, state, payload or {"provider": "google", "nonce": "n"})
    cookie = response.headers["set-cookie"]
    name, _, rest = cookie.partition("=")
    return name, rest.split(";")[0], cookie


def test_the_cookie_is_named_after_the_sign_in_and_locked_down(monkeypatch):
    monkeypatch.setattr(settings, "BACKEND_URL", "https://api.example.test")
    name, _, header = _issued()
    assert name == f"sso_{STATE}"
    for attribute in ("HttpOnly", "Secure", "SameSite=lax", "Path=/api/v1/sso", f"Max-Age={sso_state.TTL_SECONDS}"):
        assert attribute.lower() in header.lower()


def test_the_cookie_path_follows_a_backend_url_prefix(monkeypatch):
    monkeypatch.setattr(settings, "BACKEND_URL", "https://example.test/backend/")
    assert sso_state.cookie_path() == "/backend/api/v1/sso"


def test_this_browser_recalls_what_it_started():
    name, value, _ = _issued(payload={"provider": "google", "nonce": "n", "carry": {"redirect": "/x"}})
    started = sso_state.recall(_request({name: value}), STATE)
    assert (started["provider"], started["nonce"], started["carry"]) == ("google", "n", {"redirect": "/x"})


def test_parallel_sign_ins_keep_their_own_state():
    first, second = "a" * 32, "b" * 32
    n1, v1, _ = _issued(first, {"provider": "google", "nonce": "1"})
    n2, v2, _ = _issued(second, {"provider": "google", "nonce": "2"})
    cookies = {n1: v1, n2: v2}
    assert sso_state.recall(_request(cookies), first)["nonce"] == "1"
    assert sso_state.recall(_request(cookies), second)["nonce"] == "2"


@pytest.mark.parametrize("cookies, state", [
    ({}, STATE),                                              # another browser
    ({f"sso_{STATE}": "garbage"}, STATE),                      # not ours
    ({f"sso_{STATE}": "x"}, None),                             # no state at all
    ({f"sso_{STATE}": "x"}, "bad state;"),                     # not a state we issue
])
def test_anything_but_this_browsers_own_sign_in_is_refused(cookies, state):
    assert sso_state.recall(_request(cookies), state) is None


def test_a_tampered_expired_or_foreign_token_is_refused():
    name = f"sso_{STATE}"
    forged = jwt.encode({"state": STATE, "type": "sso_state", "provider": "google", "exp": int(time.time()) + 60},
                        "not-our-secret", algorithm="HS256")
    expired = jwt.encode({"state": STATE, "type": "sso_state", "exp": int(time.time()) - 1}, settings.SECRET_KEY, algorithm="HS256")
    other_state = jwt.encode({"state": "x" * 32, "type": "sso_state", "exp": int(time.time()) + 60}, settings.SECRET_KEY, algorithm="HS256")
    # An access token is signed with the same key but is not a sign-in in progress.
    access = jwt.encode({"state": STATE, "type": "access", "exp": int(time.time()) + 60}, settings.SECRET_KEY, algorithm="HS256")
    for token in (forged, expired, other_state, access):
        assert sso_state.recall(_request({name: token}), STATE) is None


def test_forgetting_expires_only_that_sign_ins_cookie():
    response = Response()
    sso_state.forget(response, STATE)
    assert response.headers["set-cookie"].startswith(f"sso_{STATE}=")
    assert "max-age=0" in response.headers["set-cookie"].lower()
    untouched = Response()
    sso_state.forget(untouched, "bad state;")
    assert "set-cookie" not in untouched.headers

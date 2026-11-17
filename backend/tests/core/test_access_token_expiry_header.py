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

Only our own surfaces may use the dashboard's sign-in cookies cross-origin.

An org's domain is whatever was typed at signup, unverified, and every org
domain is in the CORS list. If those origins were also allowed credentials, a
page on any signed-up domain could read a signed-in dashboard user's account.
"""
"""The dashboard learns the access token's lifetime from a response header:
the token itself is an httpOnly cookie it cannot read."""

from types import SimpleNamespace
from uuid import uuid4

from fastapi import Response

import app.main  # noqa: F401 - the CORS middleware is added on import
from app.core import cors
from app.core.application import app as api
from app.core.auth import ACCESS_COOKIE_MAX_AGE, set_session_cookies


def test_every_sign_in_tells_the_dashboard_when_its_token_runs_out():
    response = Response()
    user = SimpleNamespace(id=uuid4(), email="a@example.test", full_name="A", organization_id=uuid4())

    set_session_cookies(response, user, None, "access", "refresh")

    assert response.headers[cors.ACCESS_TOKEN_EXPIRES_IN_HEADER] == str(ACCESS_COOKIE_MAX_AGE)


def test_the_dashboard_may_read_it_cross_origin():
    layers = [m for m in api.user_middleware if isinstance(m.cls, type) and issubclass(m.cls, cors.CORSMiddleware)]

    assert layers
    for layer in layers:
        assert cors.ACCESS_TOKEN_EXPIRES_IN_HEADER in layer.kwargs["expose_headers"]

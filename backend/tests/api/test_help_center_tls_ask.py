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

Tests for the on-demand-TLS "ask" gate (GET /health/help-center-domain) that an
edge proxy (e.g. Caddy) calls before issuing a certificate for a hostname.
"""

from unittest.mock import patch

from fastapi.testclient import TestClient

import app.main  # noqa: F401 — registers routes on the FastAPI app
from app.core.application import app

client = TestClient(app)
ASK = "/health/help-center-domain"


def test_allows_slug_subdomain():
    # {slug}.HELP_CENTER_BASE_DOMAIN is a help-center host without any DB lookup.
    assert client.get(ASK, params={"domain": "acme.chattermate.help"}).status_code == 200


def test_allows_verified_custom_domain():
    with patch("app.core.help_center_host._domain_cache") as cache:
        cache.contains.return_value = True
        assert client.get(ASK, params={"domain": "help.customer.com"}).status_code == 200


def test_rejects_unknown_domain():
    with patch("app.core.help_center_host._domain_cache") as cache:
        cache.contains.return_value = False
        assert client.get(ASK, params={"domain": "evil.example.com"}).status_code == 404


def test_rejects_missing_or_empty_domain():
    assert client.get(ASK).status_code == 404
    assert client.get(ASK, params={"domain": ""}).status_code == 404


def test_normalizes_host_with_port_and_uppercase():
    # SNI can arrive with a port / mixed case; normalize_host must canonicalize
    # it so the slug match still succeeds.
    assert client.get(ASK, params={"domain": "ACME.chattermate.help:443"}).status_code == 200

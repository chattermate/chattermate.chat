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

sign_s3_url_stable, with a real boto3 client: presigning is local, so dummy
keys sign fine and no request leaves the machine.
"""

from unittest.mock import patch
from urllib.parse import parse_qs, urlparse

import pytest

from app.core import s3
from app.core.config import settings

BUCKET = "app.example.test"
LIFETIME = 3600
WINDOW = LIFETIME // 2


@pytest.fixture
def signer(monkeypatch):
    """S3 on, dummy credentials, a clock we control, and no cached URLs or client."""
    clock = {"now": 1_800_000_000.25}
    monkeypatch.setattr(settings, "S3_FILE_STORAGE", True)
    monkeypatch.setattr(settings, "S3_BUCKET", BUCKET)
    monkeypatch.setattr(settings, "S3_REGION", "us-east-1")
    monkeypatch.setattr(settings, "AWS_ACCESS_KEY_ID", "AKIATESTTESTTESTTEST")
    monkeypatch.setattr(settings, "AWS_SECRET_ACCESS_KEY", "secret")
    monkeypatch.setattr(settings, "S3_PRESIGN_EXPIRY_SECONDS", LIFETIME)
    s3.get_s3_client.cache_clear()
    s3._sign_until.cache_clear()
    with patch("time.time", side_effect=lambda: clock["now"]):
        yield clock
    s3.get_s3_client.cache_clear()
    s3._sign_until.cache_clear()


def _url(key: str = "agents/org/photo.webp") -> str:
    return s3.url_for_s3_key(key)


def _query(url: str) -> dict:
    return {k: v[0] for k, v in parse_qs(urlparse(url).query).items()}


def _expiry(url: str) -> int:
    query = _query(url)
    if "Expires" in query:  # SigV2
        return int(query["Expires"])
    raise AssertionError("expected a SigV2 URL")


def test_the_url_is_the_same_throughout_a_window(signer):
    first = s3.sign_s3_url_stable(_url())
    signer["now"] += WINDOW - 2

    assert s3.sign_s3_url_stable(_url()) == first


def test_a_new_window_gives_a_new_url(signer):
    first = s3.sign_s3_url_stable(_url())
    signer["now"] += WINDOW

    assert s3.sign_s3_url_stable(_url()) != first


def test_a_url_is_never_valid_for_longer_than_the_configured_lifetime(signer):
    for offset in (0, 1, WINDOW // 2, WINDOW - 1):
        signer["now"] = 1_800_000_000.25 + offset
        s3._sign_until.cache_clear()
        remaining = _expiry(s3.sign_s3_url_stable(_url())) - int(signer["now"])
        assert WINDOW <= remaining <= LIFETIME


def test_the_sigv2_url_is_identical_across_processes(signer):
    # A second process: nothing cached, same clock window.
    first = s3.sign_s3_url_stable(_url())
    s3._sign_until.cache_clear()
    signer["now"] += 17

    assert s3.sign_s3_url_stable(_url()) == first


def test_the_url_asks_the_browser_to_cache_the_photo(signer):
    query = _query(s3.sign_s3_url_stable(_url()))

    assert query["response-cache-control"] == f"private, max-age={WINDOW}"


def test_a_sigv4_url_is_stable_within_a_window_too(signer, monkeypatch):
    monkeypatch.setattr(settings, "S3_REGION", "eu-central-1")
    s3.get_s3_client.cache_clear()

    first = s3.sign_s3_url_stable(_url())
    signer["now"] += 60

    assert "X-Amz-Signature" in first
    assert s3.sign_s3_url_stable(_url()) == first


@pytest.mark.parametrize("value", [None, "", "data:image/png;base64,AAAA", "https://example.com/a.png"])
def test_anything_not_an_s3_object_comes_back_unchanged(signer, value):
    assert s3.sign_s3_url_stable(value) == value


def test_nothing_is_signed_without_s3(signer, monkeypatch):
    monkeypatch.setattr(settings, "S3_FILE_STORAGE", False)

    assert s3.sign_s3_url_stable(_url()) == _url()


def test_a_signing_failure_is_not_cached(signer):
    with patch.object(s3, "get_s3_client", side_effect=RuntimeError("no credentials")):
        assert s3.sign_s3_url_stable(_url()) == _url()

    assert "Signature" in s3.sign_s3_url_stable(_url())


def test_plain_signing_is_unchanged(signer):
    """sign_s3_url still gives a full-lifetime URL with no cache header."""
    signed = s3.sign_s3_url(_url())

    assert _expiry(signed) == int(signer["now"] + LIFETIME)
    assert "response-cache-control" not in _query(signed)

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

from unittest.mock import MagicMock, patch

import pytest

from app.knowledge import url_safety
from app.knowledge.url_safety import (
    BlockedHostError,
    guard_url,
    is_blocked_host,
    resolves_to_blocked_host,
    safe_get,
)


def test_is_blocked_host_literal_ips():
    assert is_blocked_host("http://169.254.169.254/latest/meta-data/")  # cloud metadata
    assert is_blocked_host("http://127.0.0.1/x")
    assert is_blocked_host("http://10.0.0.5/x")
    assert is_blocked_host("http://192.168.1.1/x")
    assert is_blocked_host("http://localhost/x")
    assert not is_blocked_host("https://site.com/x")
    assert not is_blocked_host("https://8.8.8.8/x")  # public IP allowed


def test_resolves_to_blocked_host_when_hostname_maps_to_internal_ip():
    # Attacker domain whose A record points at the metadata IP (DNS rebinding).
    with patch.object(
        url_safety.socket, "getaddrinfo",
        return_value=[(2, 1, 6, "", ("169.254.169.254", 0))],
    ):
        assert resolves_to_blocked_host("http://imds.attacker.com/latest/meta-data/")


def test_resolves_to_blocked_host_allows_public_resolution():
    with patch.object(
        url_safety.socket, "getaddrinfo",
        return_value=[(2, 1, 6, "", ("93.184.216.34", 0))],
    ):
        assert not resolves_to_blocked_host("https://example.com/x")


def test_resolves_to_blocked_host_unresolvable_is_not_blocked():
    import socket as _socket
    with patch.object(url_safety.socket, "getaddrinfo", side_effect=_socket.gaierror):
        assert not resolves_to_blocked_host("https://nope.invalid/x")


def _redirect_response(location, url="https://site.com/start"):
    resp = MagicMock()
    resp.is_redirect = True
    resp.headers = {"location": location}
    resp.url = url
    return resp


def _ok_response():
    resp = MagicMock()
    resp.is_redirect = False
    return resp


def test_safe_get_blocks_redirect_to_internal_ip():
    # A public URL 302-redirects to the metadata IP; safe_get must refuse the hop.
    client = MagicMock()
    client.get.return_value = _redirect_response("http://169.254.169.254/")
    with patch.object(url_safety, "resolves_to_blocked_host", side_effect=lambda u: "169.254" in u):
        with pytest.raises(BlockedHostError):
            safe_get(client, "https://site.com/start")


def test_safe_get_follows_safe_redirect():
    client = MagicMock()
    client.get.side_effect = [
        _redirect_response("https://site.com/final"),
        _ok_response(),
    ]
    with patch.object(url_safety, "resolves_to_blocked_host", return_value=False):
        resp = safe_get(client, "https://site.com/start")
    assert resp.is_redirect is False
    assert client.get.call_count == 2


def test_guard_url_raises_on_blocked():
    with patch.object(url_safety, "resolves_to_blocked_host", return_value=True):
        with pytest.raises(BlockedHostError):
            guard_url("http://127.0.0.1/x")

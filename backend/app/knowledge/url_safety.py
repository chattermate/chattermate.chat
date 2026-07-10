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

"""Shared SSRF guards for the crawler / sitemap fetchers."""

import ipaddress
import socket
from urllib.parse import urljoin, urlparse

from app.core.logger import get_logger

logger = get_logger(__name__)

# Match httpx's default so the manual (SSRF-checked) redirect following doesn't
# reject legitimate sites with longer redirect chains.
MAX_REDIRECTS = 20


class BlockedHostError(Exception):
    """Raised when a fetch target resolves to a private/internal address."""


def _ip_is_internal(ip: ipaddress._BaseAddress) -> bool:
    return (
        ip.is_private
        or ip.is_loopback
        or ip.is_link_local
        or ip.is_reserved
        or ip.is_multicast
        or ip.is_unspecified
    )


def is_blocked_host(url: str) -> bool:
    """True if the URL targets a literal private/loopback/link-local IP host.

    Catches the obvious internal targets given as an IP literal (cloud metadata
    ``169.254.169.254``, ``127.0.0.1``, RFC1918 ranges) plus ``localhost``.
    """
    host = (urlparse(url).hostname or "").lower()
    if host in ("localhost", "localhost.localdomain"):
        return True
    try:
        return _ip_is_internal(ipaddress.ip_address(host))
    except ValueError:
        return False


def resolves_to_blocked_host(url: str) -> bool:
    """True if the URL's host is, or DNS-resolves to, an internal address.

    Extends :func:`is_blocked_host` by resolving hostnames — this closes the
    "attacker domain with an A record pointing at 169.254.169.254 / an RFC1918
    IP" SSRF vector. Hosts that can't be resolved are not blocked here (the
    request will simply fail to connect).
    """
    if is_blocked_host(url):
        return True
    host = (urlparse(url).hostname or "").lower()
    if not host:
        return False
    try:
        infos = socket.getaddrinfo(host, None)
    except (socket.gaierror, UnicodeError, ValueError, OSError):
        return False
    for info in infos:
        addr = info[4][0]
        try:
            if _ip_is_internal(ipaddress.ip_address(addr)):
                return True
        except ValueError:
            continue
    return False


def guard_url(url: str) -> None:
    """Raise BlockedHostError if the URL targets an internal address."""
    if resolves_to_blocked_host(url):
        raise BlockedHostError(f"Refusing to fetch internal/blocked host: {url}")


def safe_get(client, url: str, *, max_redirects: int = MAX_REDIRECTS, **kwargs):
    """httpx GET that follows redirects manually, re-validating each hop's host.

    Prevents the "public URL 302-redirects to an internal IP" SSRF: every hop
    (including the initial URL) is checked with :func:`guard_url` before it is
    fetched. Returns the final non-redirect response; the caller handles status.
    """
    current = url
    for _ in range(max_redirects + 1):
        guard_url(current)
        resp = client.get(current, follow_redirects=False, **kwargs)
        if resp.is_redirect:
            location = resp.headers.get("location")
            if not location:
                return resp
            current = urljoin(str(resp.url), location)
            continue
        return resp
    raise BlockedHostError(f"Too many redirects while fetching {url}")

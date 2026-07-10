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
from urllib.parse import urlparse


def is_blocked_host(url: str) -> bool:
    """True if the URL targets a literal private/loopback/link-local IP (SSRF guard).

    Only IP-literal hosts are rejected here — this catches the obvious internal
    targets (cloud metadata ``169.254.169.254``, ``127.0.0.1``, RFC1918 ranges,
    ``localhost``). Hostnames are not DNS-resolved (resolving + per-redirect
    re-validation is a deeper, separate hardening), matching the crawler's
    existing behaviour for hostname targets.
    """
    host = (urlparse(url).hostname or "").lower()
    if host in ("localhost", "localhost.localdomain"):
        return True
    try:
        ip = ipaddress.ip_address(host)
    except ValueError:
        return False
    return (
        ip.is_private
        or ip.is_loopback
        or ip.is_link_local
        or ip.is_reserved
        or ip.is_multicast
    )

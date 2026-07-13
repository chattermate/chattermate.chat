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

Single canonical registrable-domain helper, used everywhere a sub-page URL is
compared against its source's domain (website crawler, sitemap parser, manual
add-subpage). Same-domain enforcement stops one plan-limited knowledge source
from accumulating content across unrelated domains. Handles common ccTLDs
(co.uk, com.au, …) so 'a.example.co.uk' → 'example.co.uk' rather than 'co.uk'
(the latter would wrongly treat every *.co.uk host as one domain).
"""

from urllib.parse import urlparse

# Second-level labels that sit under a 2-letter ccTLD (best-effort; a full
# public-suffix list would be a heavy dependency for marginal gain here).
_CCTLD_SECOND_LEVELS = frozenset(
    {"co", "com", "org", "net", "edu", "gov", "ac", "gov", "ltd", "plc", "me", "or", "ne"}
)


def registrable_domain(host: str) -> str:
    """Registrable domain for a HOST (not a full URL): lowercased, port/userinfo
    already stripped by the caller's urlparse(...).hostname, 'www.' removed."""
    host = (host or "").lower().strip().rstrip(".")
    if host.startswith("www."):
        host = host[4:]
    if not host:
        return ""
    parts = host.split(".")
    if len(parts) > 2 and parts[-2] in _CCTLD_SECOND_LEVELS and len(parts[-1]) == 2:
        return ".".join(parts[-3:])
    return ".".join(parts[-2:]) if len(parts) > 1 else host


def domain_of_url(url: str) -> str:
    """Registrable domain of a URL string. A scheme-less value ('example.com/x')
    is normalized so its host is still recognised (else it would parse as a
    path with no hostname and silently bypass a same-domain check)."""
    text = (url or "").strip()
    if not text:
        return ""
    if "://" not in text:
        text = f"https://{text}"
    return registrable_domain(urlparse(text).hostname or "")

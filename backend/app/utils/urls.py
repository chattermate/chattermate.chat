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

import re

# Any scheme prefix, matched case-insensitively so "HTTP://" can't sneak past
# scheme checks or get a second scheme prepended.
_SCHEME_RE = re.compile(r"^([a-zA-Z][a-zA-Z0-9+.-]*)://")


def normalize_url(value: str, require_https: bool = False) -> str:
    """Normalize a user-supplied URL: default the scheme to https and lowercase
    an existing scheme. Raises ValueError for blank input, non-http(s) schemes,
    and — when require_https is set — plain http URLs.
    """
    value = value.strip()
    if not value:
        raise ValueError("URL must not be blank")
    match = _SCHEME_RE.match(value)
    if match:
        scheme = match.group(1).lower()
        if scheme not in ("http", "https"):
            raise ValueError("URL must use http or https")
        if require_https and scheme != "https":
            raise ValueError("URL must use https")
        return f"{scheme}://{value[match.end():]}"
    return f"https://{value}"

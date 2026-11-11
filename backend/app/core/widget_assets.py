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

import hashlib
from pathlib import Path
from typing import Dict, Tuple
from urllib.parse import parse_qs

from fastapi.staticfiles import StaticFiles

# The widget bundle: the frame page links both files with the same ?v=.
BUNDLE_FILES = ("widget.js", "widget.css")

# A versioned address names one build forever, so a browser may keep it for a
# year without asking again. Anything else is checked on every load, so a
# release reaches embedded sites straight away.
VERSIONED_CACHE = "public, max-age=31536000, immutable"
UNVERSIONED_CACHE = "no-cache"

# (path, mtime_ns, size) of each file -> version, so a page load costs a stat,
# not a hash of the whole bundle.
_versions: Dict[Tuple, str] = {}


def bundle_version(assets_dir: Path) -> str:
    """A short hash of the bundle's contents, or "" when it isn't on this disk.

    From the contents rather than the files' times: a deploy that changes only
    widget.css must still change the address, or a year-long cache would keep
    serving the old stylesheet.
    """
    try:
        stats = tuple((name, *_stat(assets_dir / name)) for name in BUNDLE_FILES)
    except OSError:
        return ""  # Served from somewhere else (dev server, CDN): nothing to stamp
    version = _versions.get(stats)
    if version is None:
        digest = hashlib.sha256()
        for name in BUNDLE_FILES:
            digest.update((assets_dir / name).read_bytes())
        version = digest.hexdigest()[:16]
        _versions.clear()
        _versions[stats] = version
    return version


def _stat(path: Path) -> Tuple[int, int]:
    stat = path.stat()
    return stat.st_mtime_ns, stat.st_size


class WidgetAssets(StaticFiles):
    """The widget bundle, cached for a year when asked for by its current version."""

    def __init__(self, directory: str):
        super().__init__(directory=directory)
        self.assets_dir = Path(directory)

    async def get_response(self, path, scope):
        response = await super().get_response(path, scope)
        if response.status_code in (200, 304):
            asked = parse_qs(scope.get("query_string", b"").decode("latin-1")).get("v", [""])[0]
            current = bundle_version(self.assets_dir)
            # Only the current build's version: an old page asking for an old
            # version gets today's file, which must not be pinned under that name.
            fresh = bool(asked) and asked == current
            response.headers["Cache-Control"] = VERSIONED_CACHE if fresh else UNVERSIONED_CACHE
        return response

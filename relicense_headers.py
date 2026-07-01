#!/usr/bin/env python3
"""
Relicense source-file headers to Apache-2.0.

Replaces the old AGPL-3.0 per-file headers (and any previously-inserted
Apache header) with the Apache-2.0 short header, in the correct comment
syntax for each file type. Idempotent: running it twice produces no diff.

Covers .py / .vue / .ts / .tsx under backend/ and frontend/src/, skipping
node_modules, virtualenvs, build output, and the proprietary enterprise
submodules (which are licensed separately).

Usage:  python relicense_headers.py
"""

import os
import re
import sys
from typing import List, Tuple

# --- Apache-2.0 short header ------------------------------------------------

COPYRIGHT = "Copyright 2024-2026 ChatterMate"

BODY = f"""{COPYRIGHT}

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License."""

HEADERS = {
    "py": '"""\n' + BODY + '\n"""\n\n',
    "vue": "<!--\n" + BODY + "\n-->\n\n",
    "ts": "/*\n" + BODY + "\n*/\n\n",
}

# Any leading comment/docstring containing one of these markers is treated as
# an existing license block and replaced (covers relicensing + idempotency).
LICENSE_MARKERS = (
    "GNU Affero General Public License",
    "Licensed under the Apache License",
)

# --- File discovery ---------------------------------------------------------

ROOTS = ["backend", "frontend/src"]

EXCLUDE_DIRS = {
    "node_modules", "venv", ".venv", "env", "__pycache__", "dist", "build",
    "coverage_html", "htmlcov", ".git", "temp", "uploads", "logs",
    ".mypy_cache", ".pytest_cache",
}

# Proprietary enterprise submodules — licensed separately, never touched here.
EXCLUDE_PREFIXES = (
    os.path.join("backend", "app", "enterprise"),
    os.path.join("frontend", "src", "modules", "enterprise"),
)

EXT_STYLE = {".py": "py", ".vue": "vue", ".ts": "ts", ".tsx": "ts"}


def find_files() -> List[str]:
    found = []
    for root in ROOTS:
        if not os.path.isdir(root):
            continue
        for dirpath, dirnames, filenames in os.walk(root):
            dirnames[:] = [d for d in dirnames if d not in EXCLUDE_DIRS]
            rel = os.path.relpath(dirpath)
            if rel.startswith(EXCLUDE_PREFIXES):
                dirnames[:] = []
                continue
            for name in filenames:
                if os.path.splitext(name)[1] in EXT_STYLE:
                    found.append(os.path.join(dirpath, name))
    return found


# --- Header manipulation ----------------------------------------------------

def split_py_preamble(content: str) -> Tuple[str, str]:
    """Peel off a shebang and/or PEP-263 coding declaration to preserve them."""
    prefix, rest = "", content
    if rest.startswith("#!"):
        nl = rest.find("\n")
        if nl == -1:
            return rest, ""
        prefix, rest = rest[: nl + 1], rest[nl + 1:]
    m = re.match(r"#.*coding[:=]\s*[-\w.]+.*\n", rest)
    if m:
        prefix, rest = prefix + rest[: m.end()], rest[m.end():]
    return prefix, rest


def is_license_block(block: str) -> bool:
    return any(marker in block for marker in LICENSE_MARKERS)


def strip_leading_license(rest: str, style: str) -> str:
    """Remove a leading license comment/docstring if present; otherwise keep."""
    stripped = rest.lstrip("\n \t\r")
    if style == "py":
        for q in ('"""', "'''"):
            if stripped.startswith(q):
                end = stripped.find(q, len(q))
                if end != -1 and is_license_block(stripped[: end + len(q)]):
                    return stripped[end + len(q):].lstrip("\n")
                return rest
    elif style == "vue":
        if stripped.startswith("<!--"):
            end = stripped.find("-->")
            if end != -1 and is_license_block(stripped[: end + 3]):
                return stripped[end + 3:].lstrip("\n")
    elif style == "ts":
        if stripped.startswith("/*"):
            end = stripped.find("*/")
            if end != -1 and is_license_block(stripped[: end + 2]):
                return stripped[end + 2:].lstrip("\n")
    return rest


def relicense(path: str) -> bool:
    style = EXT_STYLE[os.path.splitext(path)[1]]
    with open(path, "r", encoding="utf-8") as f:
        original = f.read()

    if style == "py":
        prefix, rest = split_py_preamble(original)
    else:
        prefix, rest = "", original

    body = strip_leading_license(rest, style)
    new_content = prefix + HEADERS[style] + body

    if new_content == original:
        return False
    with open(path, "w", encoding="utf-8") as f:
        f.write(new_content)
    return True


def main() -> None:
    files = find_files()
    changed = 0
    by_ext = {}
    for path in files:
        try:
            if relicense(path):
                changed += 1
                ext = os.path.splitext(path)[1]
                by_ext[ext] = by_ext.get(ext, 0) + 1
        except Exception as e:  # noqa: BLE001
            print(f"Error processing {path}: {e}", file=sys.stderr)
    print(f"Scanned {len(files)} files, updated {changed}.")
    for ext, n in sorted(by_ext.items()):
        print(f"  {ext}: {n}")


if __name__ == "__main__":
    main()

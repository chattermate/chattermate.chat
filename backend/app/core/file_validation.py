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

Shared upload validation: content-type, size, and magic-byte checks.

The frontend performs its own checks, but those are not a security boundary — the
CLI, AI agents, and raw API callers bypass them, so validate every upload here.
"""

import os
from typing import Tuple
from uuid import uuid4

from fastapi import HTTPException, UploadFile, status

# Magic-byte signatures used across the app.
PDF_MAGIC = b"%PDF-"


async def read_validated(
    file: UploadFile,
    *,
    max_size: int,
    allowed_content_types: Tuple[str, ...],
    magic_prefix: bytes,
    label: str = "file",
) -> bytes:
    """Validate an ``UploadFile`` and return its content as bytes.

    Checks the declared content type, the actual byte size, and the leading magic
    bytes (content type is advisory since clients can lie; the magic-byte check is
    the real gate). Raises ``HTTPException`` (400/413) on any failure.
    """
    name = file.filename or label

    if file.content_type not in allowed_content_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"{name}: unsupported content type",
        )

    # Determine size from the spooled temp file without buffering into our own memory.
    file.file.seek(0, 2)
    size = file.file.tell()
    file.file.seek(0)
    if size > max_size:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"{name}: exceeds the {max_size // 1024 // 1024}MB limit",
        )

    content = await file.read()
    if not content:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"{name}: empty file",
        )
    if not content.startswith(magic_prefix):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"{name}: not a valid {label}",
        )
    return content


def safe_filename(filename: str) -> str:
    """Return a filesystem-safe, collision-resistant name from ``filename``.

    Strips directory components (prevents path traversal via ``../`` or absolute
    paths) and prefixes a UUID so distinct uploads never overwrite each other.
    """
    base = os.path.basename(filename or "").replace("\\", "").strip()
    if not base or base in (".", ".."):
        base = "upload"
    return f"{uuid4().hex}_{base}"

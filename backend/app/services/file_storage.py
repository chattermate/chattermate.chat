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

Storage backend shim shared by upload endpoints: S3 when configured, else the
local uploads/ directory (served by the /api/v1/uploads static mount).
"""

import os

import aiofiles

from app.core.config import settings
from app.core.s3 import (
    delete_file_from_s3,
    download_file_from_s3,
    get_s3_signed_url,
    upload_file_to_s3,
)


async def store_upload(content: bytes, folder: str, file_name: str, content_type: str) -> str:
    """Persist bytes and return the URL to store. S3 mode returns the raw S3
    URL (sign with resolve_public_url before handing to clients); local mode
    returns the path under the /api/v1/uploads static mount."""
    if settings.S3_FILE_STORAGE:
        return await upload_file_to_s3(content, folder, file_name, content_type=content_type)
    upload_dir = os.path.join("uploads", folder)
    os.makedirs(upload_dir, exist_ok=True)
    async with aiofiles.open(os.path.join(upload_dir, file_name), "wb") as f:
        await f.write(content)
    # The uploads/ directory is static-mounted at {API_V1_STR}/uploads.
    return f"{settings.API_V1_STR}/uploads/{folder}/{file_name}"


def local_upload_path(stored: str) -> str:
    """Filesystem path under `uploads/` for a stored local upload URL.

    Tolerates every shape the app has ever written: the current
    `{API_V1_STR}/uploads/...`, the legacy bare `/uploads/...` that
    agent photos and profile pictures carried before they were normalised,
    and a plain relative key with no prefix at all.
    """
    relative = stored.lstrip("/")
    api_prefix = f"{settings.API_V1_STR.strip('/')}/"
    if relative.startswith(api_prefix):
        relative = relative[len(api_prefix):]
    if relative.startswith("uploads/"):
        relative = relative[len("uploads/"):]
    return os.path.join("uploads", relative)


async def load_upload(stored: str) -> bytes:
    """Read back a previously stored upload by the URL/path store_upload
    returned. Used by workers running in a different container than the API
    (shared local uploads mount or S3)."""
    if stored.startswith("http"):
        return await download_file_from_s3(stored)
    async with aiofiles.open(local_upload_path(stored), "rb") as f:
        return await f.read()


async def delete_upload(stored: str) -> None:
    """Best-effort removal of a stored upload (temp import files)."""
    try:
        if stored.startswith("http"):
            await delete_file_from_s3(stored)
            return
        os.remove(local_upload_path(stored))
    except Exception:
        pass


async def resolve_public_url(stored_url: str) -> str:
    """Client-facing URL for a stored upload: signed for private S3 objects,
    verbatim otherwise."""
    if stored_url and settings.S3_FILE_STORAGE and stored_url.startswith("http"):
        return await get_s3_signed_url(stored_url)
    return stored_url

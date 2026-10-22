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
local uploads/ directory. Only PUBLIC_UPLOAD_FOLDERS are static-mounted under
/api/v1/uploads; private files are reached through signed links.
"""

import os
from typing import Optional

import aiofiles

from app.core.config import settings
from app.core.local_file_urls import sign_local_key
from app.core.s3 import (
    delete_file_from_s3,
    download_file_from_s3,
    get_s3_signed_url,
    upload_file_to_s3,
)


def profile_pic_folder(organization_id, user_id) -> str:
    """Where a user's profile picture lives: `users/` on S3 and the public
    `user/` mount on disk, as profile pictures have always been stored."""
    root = "users" if settings.S3_FILE_STORAGE else "user"
    return f"{root}/{organization_id}/{user_id}"


async def store_upload(content: bytes, folder: str, file_name: str, content_type: str) -> str:
    """Persist bytes and return the URL to store. S3 mode returns the raw S3
    URL, local mode the {API_V1_STR}/uploads/... path; either way, pass it
    through resolve_public_url before handing it to a client."""
    if settings.S3_FILE_STORAGE:
        return await upload_file_to_s3(content, folder, file_name, content_type=content_type)
    upload_dir = os.path.join("uploads", folder)
    os.makedirs(upload_dir, exist_ok=True)
    async with aiofiles.open(os.path.join(upload_dir, file_name), "wb") as f:
        await f.write(content)
    return f"{settings.API_V1_STR}/uploads/{folder}/{file_name}"


# Local-storage folders anyone may read, static-mounted at {API_V1_STR}/uploads/<folder>:
# agent avatars and agents' profile pictures shown to anonymous widget visitors,
# and help-center logos and article images. Everything else under uploads/ (chat
# attachments, PDF imports awaiting a worker) is private.
PUBLIC_UPLOAD_FOLDERS = ("agents", "user", "help_center")
# Private folders handed to clients as short-lived signed links, the local
# counterpart of an S3 presigned URL.
SIGNED_UPLOAD_FOLDERS = ("chat_attachments",)


def upload_key(stored: str) -> str:
    """Key relative to `uploads/` for a stored local upload URL.

    Tolerates every shape the app has ever written: the current
    `{API_V1_STR}/uploads/...`, the legacy bare `/uploads/...` that
    agent photos, profile pictures and chat attachments carried, and a plain
    relative key with no prefix at all.
    """
    relative = stored.lstrip("/")
    api_prefix = f"{settings.API_V1_STR.strip('/')}/"
    if relative.startswith(api_prefix):
        relative = relative[len(api_prefix):]
    if relative.startswith("uploads/"):
        relative = relative[len("uploads/"):]
    return relative


def local_upload_path(stored: str) -> str:
    """Filesystem path under `uploads/` for a stored local upload URL."""
    return os.path.join("uploads", upload_key(stored))


def signed_upload_key(stored: Optional[str]) -> Optional[str]:
    """The key of a stored local upload that is only served through a signed
    link, or None for anything else (S3 and other absolute URLs, public files)."""
    if not stored or "://" in stored or stored.startswith(("data:", "blob:")):
        return None
    key = upload_key(stored)
    return key if key.split("/", 1)[0] in SIGNED_UPLOAD_FOLDERS else None


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
    """Client-facing URL for a stored upload: presigned for S3 objects, a
    signed link for private local files, verbatim otherwise."""
    if stored_url and settings.S3_FILE_STORAGE and stored_url.startswith("http"):
        return await get_s3_signed_url(stored_url)
    key = signed_upload_key(stored_url)
    return sign_local_key(key) if key else stored_url

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

Avatars (agent photos, people's profile pictures): checked, shrunk to a small
WebP and stored.

They are only ever shown small (the widget header, the inbox, the Shopify app
home), so keeping the original upload made every page load download a
full-size picture. Only pixels we drew ourselves are stored, which also drops
metadata and anything hiding after the image data.
"""

import asyncio
import io
import posixpath
from typing import Optional
from uuid import uuid4

from PIL import Image, ImageOps

from app.core.config import settings
from app.core.s3 import owned_s3_key
from app.services.file_storage import delete_upload, store_upload, upload_key

AVATAR_PIXELS = 256
AVATAR_QUALITY = 80
AVATAR_FORMAT = 'WEBP'
AVATAR_CONTENT_TYPE = 'image/webp'
AVATAR_EXTENSION = '.webp'
# Checked from the header, before decoding: a small file can expand to gigabytes.
MAX_SOURCE_PIXELS = 25_000_000
# Judged from the bytes; the client's content type proves nothing. MPO is how Pillow
# names the multi-picture JPEGs many phones and cameras save.
ALLOWED_FORMATS = ('PNG', 'JPEG', 'MPO', 'WEBP', 'GIF')
OPAQUE = 255
# Blocks a re-encode drops; a file still carrying one is not done yet.
METADATA_KEYS = ('exif', 'xmp', 'icc_profile')


class AvatarRejected(ValueError):
    """The upload isn't an image we can use."""


def avatar_name() -> str:
    """A fresh stored name for every upload, never derived from the caller's
    filename. Fresh so a replaced picture never reuses a URL a browser cached."""
    return f"{uuid4()}{AVATAR_EXTENSION}"


def owned_key_in(stored_url: Optional[str], folder: str) -> Optional[str]:
    """The storage key of ``stored_url`` when it is a file of ours inside
    ``folder``, else None.

    A stored avatar URL is whatever the last profile or customization save
    wrote, so it can name anything: an inline data: image, an external URL,
    someone else's file, or a path with ``..`` in it. Check it with this before
    deleting or rewriting the file it names.
    """
    if not stored_url or stored_url.startswith('data:'):
        return None
    if settings.S3_FILE_STORAGE:
        key = owned_s3_key(stored_url)
    else:
        key = None if '://' in stored_url else upload_key(stored_url)
    if not key or '..' in key.split('/') or posixpath.normpath(key) != key:
        return None
    return key if key.startswith(f"{folder}/") else None


def _open_checked(content: bytes) -> Image.Image:
    try:
        image = Image.open(io.BytesIO(content))
    except Exception:
        raise AvatarRejected("Not an image we can read")
    if image.format not in ALLOWED_FORMATS:
        raise AvatarRejected(f"Unsupported image format: {image.format}")
    width, height = image.size
    if width <= 0 or height <= 0 or width * height > MAX_SOURCE_PIXELS:
        raise AvatarRejected("Image dimensions out of range")
    return image


def is_shrunk(content: bytes) -> bool:
    """True when the bytes already are what shrink_avatar produces, so a rerun
    of the backfill leaves the file alone: a small, still, metadata-free WebP.
    Reads the header only."""
    try:
        image = Image.open(io.BytesIO(content))
    except Exception:
        return False
    return (image.format == AVATAR_FORMAT
            and max(image.size) <= AVATAR_PIXELS
            and not getattr(image, 'is_animated', False)
            and not any(image.info.get(key) for key in METADATA_KEYS))


def shrink_avatar(content: bytes) -> bytes:
    """Validate, fit within AVATAR_PIXELS (aspect kept, never enlarged) and
    re-encode as WebP. Transparency survives; a fully opaque image is stored
    without an alpha channel, which keeps it smaller. CPU-bound: run it off the
    event loop (store_avatar does)."""
    image = _open_checked(content)
    try:
        # Animated files open on their first frame, and only that frame is drawn.
        rgba = ImageOps.exif_transpose(image).convert('RGBA')
    except Exception:
        raise AvatarRejected("Not an image we can read")

    has_transparency = rgba.getchannel('A').getextrema()[0] < OPAQUE
    pixels = rgba if has_transparency else rgba.convert('RGB')
    pixels.thumbnail((AVATAR_PIXELS, AVATAR_PIXELS), Image.Resampling.LANCZOS)
    # convert() carries the source's info over; drop it so no metadata block
    # (METADATA_KEYS) can ride along into the encoder.
    pixels.info = {}

    output = io.BytesIO()
    pixels.save(output, format=AVATAR_FORMAT, quality=AVATAR_QUALITY, method=6)
    return output.getvalue()


async def store_avatar(content: bytes, folder: str) -> str:
    """Shrink and store an avatar under ``folder``; returns the URL to keep.
    Raises AvatarRejected for anything that isn't a usable image."""
    return await store_shrunk_avatar(await asyncio.to_thread(shrink_avatar, content), folder)


async def store_shrunk_avatar(avatar: bytes, folder: str) -> str:
    """Store bytes shrink_avatar already produced under a fresh name."""
    return await store_upload(avatar, folder, avatar_name(), AVATAR_CONTENT_TYPE)


async def delete_replaced_avatar(stored_url: Optional[str], folder: str) -> None:
    """Best-effort removal of an avatar nothing points at any more. Only a file
    of ours inside ``folder`` is ever removed (see owned_key_in)."""
    if owned_key_in(stored_url, folder):
        await delete_upload(stored_url)

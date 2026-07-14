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

Help-center article images. Images embedded in an article's Markdown must
resolve to a STABLE, ABSOLUTE URL (they render on the help-center domain, and
the reference is stored inline in the answer forever — so no signed/expiring
URLs and no host-relative paths). Shared by the admin upload endpoint and the
article importer's re-hosting path.
"""

from uuid import uuid4

from app.core.config import settings
from app.services.file_storage import store_upload

MAX_FAQ_IMAGE_BYTES = 5 * 1024 * 1024
# Reject larger-than-this on a side up front (bomb guard); downscale the stored
# image to fit FAQ_IMAGE_FIT_DIM so article pages stay light.
FAQ_IMAGE_MAX_DIM = 6000
FAQ_IMAGE_FIT_DIM = 1600
FAQ_IMAGE_TYPES = {
    "image/png": ".png",
    "image/jpeg": ".jpg",
    "image/gif": ".gif",
    "image/webp": ".webp",
}
_UPLOAD_FOLDER = "help_center"


def absolute_upload_url(stored: str) -> str:
    """Make a stored upload path absolute. S3 returns an absolute http(s) URL
    already; local mode returns a path under the /api/v1/uploads mount, which we
    anchor to the backend's public origin so it loads cross-domain."""
    if stored.startswith("http"):
        return stored
    return f"{settings.BACKEND_URL.rstrip('/')}{stored}"


async def store_article_image(content: bytes, content_type: str) -> str:
    """Persist validated image bytes and return the stable absolute URL.
    Caller is responsible for size/content-type validation against
    MAX_FAQ_IMAGE_BYTES / FAQ_IMAGE_TYPES."""
    file_name = f"{uuid4()}{FAQ_IMAGE_TYPES[content_type]}"
    stored = await store_upload(content, folder=_UPLOAD_FOLDER, file_name=file_name, content_type=content_type)
    return absolute_upload_url(stored)

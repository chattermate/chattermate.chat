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

Profile pictures taken from a sign-in provider.

A team member without a profile picture gets their SSO account's photo. It is
fetched after the sign-in has answered (a background task with its own
database session), so a slow photo host never holds up the sign-in, and a
picture the person uploaded is never replaced.
"""

from typing import Optional, Tuple

import httpx

from app.core.config import settings
from app.core.logger import get_logger
from app.core.outbound_policy import OutboundTargetBlocked, check_outbound_target
from app.database import SessionLocal
from app.models.user import User
from app.services.file_storage import profile_pic_folder, store_upload
from app.services.sso_providers import Provider

logger = get_logger(__name__)

_PHOTO_TIMEOUT = 5.0
PHOTO_MAX_BYTES = 2 * 1024 * 1024
_PHOTO_EXTENSIONS = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/gif": ".gif",
    "image/webp": ".webp",
}


def _open_session():
    return SessionLocal()


def _client() -> httpx.AsyncClient:
    return httpx.AsyncClient(timeout=_PHOTO_TIMEOUT, verify=settings.VERIFY_SSL_CERTIFICATES, follow_redirects=False)


async def fetch_provider_photo(provider: Provider, claims: dict, access_token: Optional[str]) -> Optional[Tuple[bytes, str]]:
    """The account's photo as (bytes, content type), or None when the provider
    has none or it is not a plain image of a sane size."""
    request = provider.photo_request(claims, access_token)
    if request is None:
        return None
    url, headers = request
    try:
        check_outbound_target(url, "Profile photo URL")
        async with _client() as client:
            response = await client.get(url, headers=headers)
    except (httpx.HTTPError, OutboundTargetBlocked) as e:
        logger.warning(f"Profile photo fetch from {provider.key} failed: {e}")
        return None
    if response.status_code != 200:
        return None
    content_type = response.headers.get("content-type", "").split(";")[0].strip().lower()
    if content_type not in _PHOTO_EXTENSIONS or not response.content or len(response.content) > PHOTO_MAX_BYTES:
        return None
    return response.content, content_type


async def store_profile_picture(user: User, image: Tuple[bytes, str]) -> str:
    """Persist a photo where uploaded profile pictures live and return the URL
    to keep on the user."""
    content, content_type = image
    folder = profile_pic_folder(user.organization_id, user.id)
    return await store_upload(content, folder, f"profile{_PHOTO_EXTENSIONS[content_type]}", content_type)


async def adopt_provider_photo(user_id, provider: Provider, claims: dict, access_token: Optional[str]) -> None:
    """Background task: give a user without a picture their provider's photo.
    Never raises; a missing photo is not worth an error anywhere."""
    db = _open_session()
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if user is None or user.profile_pic:
            return
        image = await fetch_provider_photo(provider, claims, access_token)
        if image is None:
            return
        user.profile_pic = await store_profile_picture(user, image)
        db.commit()
    except Exception as e:
        db.rollback()
        logger.warning(f"Profile photo for user {user_id} could not be stored: {e}")
    finally:
        db.close()

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
fetched after the sign-in has answered (a background task that holds no
database connection while it downloads), so a slow photo host never holds up
the sign-in, and a picture the person uploaded is never replaced, even one
uploaded while the photo was on its way.
"""

from typing import Optional, Tuple

import httpx
from sqlalchemy import or_

from app.core.logger import get_logger
from app.core.outbound_policy import OutboundTargetBlocked, check_outbound_target
from app.database import SessionLocal
from app.models.user import User
from app.services.avatar_image import store_avatar
from app.services.file_storage import profile_pic_folder
from app.services.sso_providers import Provider

logger = get_logger(__name__)

_PHOTO_TIMEOUT = 5.0
PHOTO_MAX_BYTES = 2 * 1024 * 1024
# Screened before download is kept; the bytes are judged again when stored.
_PHOTO_CONTENT_TYPES = frozenset({"image/jpeg", "image/png", "image/gif", "image/webp"})


def _open_session():
    return SessionLocal()


def _client() -> httpx.AsyncClient:
    # Always verified: these are the providers' public hosts, whatever
    # VERIFY_SSL_CERTIFICATES says for the operator's own services.
    return httpx.AsyncClient(timeout=_PHOTO_TIMEOUT, verify=True, follow_redirects=False)


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
    if content_type not in _PHOTO_CONTENT_TYPES or not response.content or len(response.content) > PHOTO_MAX_BYTES:
        return None
    return response.content, content_type


async def store_profile_picture(organization_id, user_id, image: Tuple[bytes, str]) -> str:
    """Persist a photo the way an uploaded profile picture is stored (shrunk to
    a small WebP, same folder) and return the URL to keep on the user. Raises
    AvatarRejected when the provider sent something that isn't a usable image."""
    content, _content_type = image
    return await store_avatar(content, profile_pic_folder(organization_id, user_id))


def _user_without_picture(user_id) -> Optional[Tuple]:
    """(organization_id, user_id) of a user still without a picture, or None.
    The session is closed again before any network call, so a slow photo host
    never holds a pooled connection."""
    db = _open_session()
    try:
        row = db.query(User.organization_id, User.id, User.profile_pic).filter(User.id == user_id).first()
    finally:
        db.close()
    if row is None or row.profile_pic:
        return None
    return row.organization_id, row.id


def _keep_unless_uploaded(user_id, url: str) -> bool:
    """Set the picture only if the person hasn't uploaded one meanwhile."""
    db = _open_session()
    try:
        updated = db.query(User).filter(
            User.id == user_id, or_(User.profile_pic.is_(None), User.profile_pic == "")
        ).update(
            {"profile_pic": url}, synchronize_session=False
        )
        db.commit()
        return bool(updated)
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


async def adopt_provider_photo(user_id, provider: Provider, claims: dict, access_token: Optional[str]) -> None:
    """Background task: give a user without a picture their provider's photo.
    Never raises; a missing photo is not worth an error anywhere."""
    try:
        found = _user_without_picture(user_id)
        if found is None:
            return
        image = await fetch_provider_photo(provider, claims, access_token)
        if image is None:
            return
        _keep_unless_uploaded(user_id, await store_profile_picture(*found, image))
    except Exception as e:
        logger.warning(f"Profile photo for user {user_id} could not be stored: {e}")

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

A team member without a picture gets their SSO account's photo, after the
sign-in has answered.
"""

from unittest.mock import AsyncMock

import httpx
import pytest

from app.core.config import settings
from app.models.user import User
from app.services import profile_pictures
from app.services.sso_providers import GoogleProvider

GOOGLE = GoogleProvider(key="google", label="Google", discovery_url="", scopes="", client_id="c", client_secret="s")
PICTURE = {"picture": "https://lh3.googleusercontent.com/a/abc=s96-c"}


def _transport(handler):
    def factory():
        return httpx.AsyncClient(transport=httpx.MockTransport(handler))
    return factory


@pytest.mark.asyncio
async def test_the_photo_is_fetched_from_where_the_provider_says(monkeypatch):
    seen = {}

    def handler(request):
        seen["url"] = str(request.url)
        return httpx.Response(200, content=b"\xff\xd8jpeg", headers={"content-type": "image/jpeg; charset=binary"})

    monkeypatch.setattr(profile_pictures, "_client", _transport(handler))
    assert await profile_pictures.fetch_provider_photo(GOOGLE, PICTURE, None) == (b"\xff\xd8jpeg", "image/jpeg")
    assert seen["url"] == "https://lh3.googleusercontent.com/a/abc=s256-c"


@pytest.mark.asyncio
@pytest.mark.parametrize("response", [
    httpx.Response(404),
    httpx.Response(302, headers={"location": "http://169.254.169.254/"}),
    httpx.Response(200, content=b"<html>", headers={"content-type": "text/html"}),
    httpx.Response(200, content=b"", headers={"content-type": "image/png"}),
    httpx.Response(200, content=b"x" * (profile_pictures.PHOTO_MAX_BYTES + 1), headers={"content-type": "image/png"}),
])
async def test_photos_that_are_missing_or_not_images_are_skipped(monkeypatch, response):
    monkeypatch.setattr(profile_pictures, "_client", _transport(lambda r: response))
    assert await profile_pictures.fetch_provider_photo(GOOGLE, PICTURE, None) is None


@pytest.mark.asyncio
async def test_an_unreachable_photo_host_is_skipped(monkeypatch):
    def handler(request):
        raise httpx.ConnectTimeout("slow")
    monkeypatch.setattr(profile_pictures, "_client", _transport(handler))
    assert await profile_pictures.fetch_provider_photo(GOOGLE, PICTURE, None) is None


@pytest.mark.asyncio
async def test_no_photo_request_means_no_fetch(monkeypatch):
    client = AsyncMock()
    monkeypatch.setattr(profile_pictures, "_client", client)
    assert await profile_pictures.fetch_provider_photo(GOOGLE, {}, None) is None
    client.assert_not_called()


@pytest.mark.asyncio
@pytest.mark.parametrize("s3, folder", [(False, "user/org-1/user-1"), (True, "users/org-1/user-1")])
async def test_the_photo_is_stored_like_an_uploaded_profile_picture(monkeypatch, s3, folder):
    """Same place the profile-picture upload uses, on disk and on S3."""
    monkeypatch.setattr(settings, "S3_FILE_STORAGE", s3)
    store = AsyncMock(return_value="stored-url")
    monkeypatch.setattr(profile_pictures, "store_upload", store)

    class U:
        organization_id = "org-1"
        id = "user-1"

    assert await profile_pictures.store_profile_picture(U(), (b"jpeg", "image/jpeg")) == "stored-url"
    store.assert_awaited_once_with(b"jpeg", folder, "profile.jpg", "image/jpeg")


@pytest.fixture
def background_session(db, monkeypatch):
    monkeypatch.setattr(profile_pictures, "_open_session", lambda: db)
    return db


@pytest.mark.asyncio
async def test_a_user_without_a_picture_adopts_the_photo(background_session, test_user: User, monkeypatch):
    monkeypatch.setattr(profile_pictures, "fetch_provider_photo", AsyncMock(return_value=(b"png", "image/png")))
    monkeypatch.setattr(profile_pictures, "store_profile_picture", AsyncMock(return_value="/api/v1/uploads/user/o/u/profile.png"))
    await profile_pictures.adopt_provider_photo(test_user.id, GOOGLE, PICTURE, None)
    background_session.refresh(test_user)
    assert test_user.profile_pic == "/api/v1/uploads/user/o/u/profile.png"


@pytest.mark.asyncio
async def test_an_uploaded_picture_is_never_replaced(background_session, test_user: User, monkeypatch):
    test_user.profile_pic = "/api/v1/uploads/user/mine.png"
    background_session.commit()
    fetch = AsyncMock()
    monkeypatch.setattr(profile_pictures, "fetch_provider_photo", fetch)
    await profile_pictures.adopt_provider_photo(test_user.id, GOOGLE, PICTURE, None)
    fetch.assert_not_awaited()
    background_session.refresh(test_user)
    assert test_user.profile_pic == "/api/v1/uploads/user/mine.png"


@pytest.mark.asyncio
async def test_storage_trouble_is_swallowed(background_session, test_user: User, monkeypatch):
    monkeypatch.setattr(profile_pictures, "fetch_provider_photo", AsyncMock(return_value=(b"png", "image/png")))
    monkeypatch.setattr(profile_pictures, "store_profile_picture", AsyncMock(side_effect=OSError("disk full")))
    await profile_pictures.adopt_provider_photo(test_user.id, GOOGLE, PICTURE, None)
    background_session.refresh(test_user)
    assert test_user.profile_pic is None

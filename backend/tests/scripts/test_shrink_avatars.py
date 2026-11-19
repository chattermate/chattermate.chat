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

scripts.shrink_avatars against a real SQLAlchemy engine and local storage.
"""

import io
import os

import pytest
from PIL import Image
from sqlalchemy import create_engine, text

from app.core.config import settings
from app.services.avatar_image import AVATAR_PIXELS
from app.services.file_storage import local_upload_path
from scripts import shrink_avatars as script

ORG = "11111111-1111-1111-1111-111111111111"
OTHER_ORG = "22222222-2222-2222-2222-222222222222"


def _png(size: int = 512) -> bytes:
    buffer = io.BytesIO()
    Image.linear_gradient("L").resize((size, size)).convert("RGB").save(buffer, format="PNG")
    return buffer.getvalue()


def _put(folder: str, name: str, content: bytes) -> str:
    os.makedirs(os.path.join("uploads", folder), exist_ok=True)
    with open(os.path.join("uploads", folder, name), "wb") as f:
        f.write(content)
    return f"{settings.API_V1_STR}/uploads/{folder}/{name}"


@pytest.fixture
def engine(tmp_path, monkeypatch):
    monkeypatch.chdir(tmp_path)
    monkeypatch.setattr(settings, "S3_FILE_STORAGE", False)
    engine = create_engine(f"sqlite:///{tmp_path / 'db.sqlite'}")
    with engine.begin() as conn:
        conn.execute(text("CREATE TABLE agents (id TEXT PRIMARY KEY, organization_id TEXT)"))
        conn.execute(text("CREATE TABLE agent_customizations (id INTEGER PRIMARY KEY, agent_id TEXT, photo_url TEXT)"))
        conn.execute(text("CREATE TABLE users (id TEXT PRIMARY KEY, organization_id TEXT, profile_pic TEXT)"))
    yield engine
    engine.dispose()


def _add(engine, row_id: int, photo_url, organization_id: str = ORG) -> None:
    with engine.begin() as conn:
        conn.execute(text("INSERT INTO agents VALUES (:id, :org)"), {"id": f"a{row_id}", "org": organization_id})
        conn.execute(text("INSERT INTO agent_customizations VALUES (:id, :agent, :url)"),
                     {"id": row_id, "agent": f"a{row_id}", "url": photo_url})


def _photo_url(engine, row_id: int):
    with engine.connect() as conn:
        return conn.execute(text("SELECT photo_url FROM agent_customizations WHERE id = :id"),
                            {"id": row_id}).scalar()


@pytest.mark.asyncio
async def test_a_large_photo_is_rewritten_and_the_old_file_removed(engine):
    old_url = _put(f"agents/{ORG}", "big.png", _png())
    _add(engine, 1, old_url)

    report = await script.run(engine, dry_run=False)

    new_url = _photo_url(engine, 1)
    assert new_url != old_url and new_url.endswith(".webp")
    assert f"/uploads/agents/{ORG}/" in new_url
    stored = Image.open(local_upload_path(new_url))
    assert stored.format == "WEBP" and max(stored.size) <= AVATAR_PIXELS
    assert not os.path.exists(local_upload_path(old_url))
    assert (report.shrunk, report.failed) == (1, 0)


@pytest.mark.asyncio
async def test_dry_run_changes_nothing(engine):
    old_url = _put(f"agents/{ORG}", "big.png", _png())
    _add(engine, 1, old_url)

    report = await script.run(engine, dry_run=True)

    assert _photo_url(engine, 1) == old_url
    assert os.path.exists(local_upload_path(old_url))
    assert os.listdir(os.path.join("uploads", "agents", ORG)) == ["big.png"]
    assert report.shrunk == 1 and report.bytes_after < report.bytes_before


@pytest.mark.asyncio
async def test_a_second_run_is_a_no_op(engine):
    _add(engine, 1, _put(f"agents/{ORG}", "big.png", _png()))
    await script.run(engine, dry_run=False)
    first = _photo_url(engine, 1)

    report = await script.run(engine, dry_run=False)

    assert _photo_url(engine, 1) == first
    assert (report.shrunk, report.already_small) == (0, 1)


@pytest.mark.asyncio
async def test_rows_sharing_a_file_all_move_together(engine):
    shared = _put(f"agents/{ORG}", "shared.png", _png())
    _add(engine, 1, shared)
    _add(engine, 2, shared)

    await script.run(engine, dry_run=False)

    assert _photo_url(engine, 1) == _photo_url(engine, 2) != shared
    assert not os.path.exists(local_upload_path(shared))


@pytest.mark.asyncio
@pytest.mark.parametrize("url", [
    "data:image/svg+xml;base64,PHN2Zy8+",
    "https://example.com/avatar.png",
])
async def test_inline_and_external_photos_are_left_alone(engine, url):
    _add(engine, 1, url)

    report = await script.run(engine, dry_run=False)

    assert _photo_url(engine, 1) == url
    assert report.failed == 0


@pytest.mark.asyncio
async def test_a_file_outside_the_organizations_folder_is_never_touched(engine):
    # A customization pointing at another organization's photo.
    foreign = _put(f"agents/{OTHER_ORG}", "theirs.png", _png())
    _add(engine, 1, foreign, organization_id=ORG)

    report = await script.run(engine, dry_run=False)

    assert _photo_url(engine, 1) == foreign
    assert os.path.exists(local_upload_path(foreign))
    assert report.skipped == 1


@pytest.mark.asyncio
async def test_a_photo_replaced_meanwhile_is_not_overwritten(engine, monkeypatch):
    old_url = _put(f"agents/{ORG}", "big.png", _png())
    _add(engine, 1, old_url)
    replacement = f"{settings.API_V1_STR}/uploads/agents/{ORG}/fresh.webp"
    real_repoint = script.repoint

    def repoint_after_a_new_upload(engine, photo, new_url):
        with engine.begin() as conn:
            conn.execute(text("UPDATE agent_customizations SET photo_url = :u WHERE id = 1"), {"u": replacement})
        return real_repoint(engine, photo, new_url)

    monkeypatch.setattr(script, "repoint", repoint_after_a_new_upload)


    await script.run(engine, dry_run=False)

    assert _photo_url(engine, 1) == replacement
    # Our rewritten copy is cleaned up; nothing else was removed.
    assert os.listdir(os.path.join("uploads", "agents", ORG)) == ["big.png"]


@pytest.mark.asyncio
async def test_an_unreadable_photo_is_reported_and_the_rest_still_run(engine):
    _add(engine, 1, _put(f"agents/{ORG}", "broken.png", b"not an image"))
    _add(engine, 2, _put(f"agents/{ORG}", "big.png", _png()))

    report = await script.run(engine, dry_run=False)

    assert (report.failed, report.shrunk) == (1, 1)
    assert _photo_url(engine, 2).endswith(".webp")


def _add_user(engine, user_id: str, picture, organization_id=ORG) -> None:
    with engine.begin() as conn:
        conn.execute(text("INSERT INTO users VALUES (:id, :org, :pic)"),
                     {"id": user_id, "org": organization_id, "pic": picture})


def _picture(engine, user_id: str):
    with engine.connect() as conn:
        return conn.execute(text("SELECT profile_pic FROM users WHERE id = :id"), {"id": user_id}).scalar()


@pytest.mark.asyncio
async def test_a_profile_picture_is_rewritten_in_the_users_own_folder(engine):
    old_url = _put(f"user/{ORG}/u1", "profile.png", _png())
    _add_user(engine, "u1", old_url)

    report = await script.run(engine, dry_run=False)

    new_url = _picture(engine, "u1")
    assert new_url.endswith(".webp") and f"/uploads/user/{ORG}/u1/" in new_url
    assert Image.open(local_upload_path(new_url)).format == "WEBP"
    assert not os.path.exists(local_upload_path(old_url))
    assert report.shrunk == 1


@pytest.mark.asyncio
async def test_another_users_picture_is_never_touched(engine):
    theirs = _put(f"user/{ORG}/u2", "profile.png", _png())
    _add_user(engine, "u1", theirs)

    report = await script.run(engine, dry_run=False)

    assert _picture(engine, "u1") == theirs
    assert os.path.exists(local_upload_path(theirs))
    assert report.skipped == 1


@pytest.mark.asyncio
async def test_a_user_without_an_organization_is_left_alone(engine):
    picture = _put("user/None/u1", "profile.png", _png())
    _add_user(engine, "u1", picture, organization_id=None)

    report = await script.run(engine, dry_run=False)

    assert _picture(engine, "u1") == picture
    assert (report.shrunk, report.skipped, report.failed) == (0, 0, 0)

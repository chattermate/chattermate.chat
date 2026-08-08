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
"""

import io
import os
from uuid import uuid4

import pytest
from fastapi import UploadFile
from PIL import Image

from app.api.agent import save_file
from app.api.users import save_upload_file
from app.core.config import settings
from app.services.file_storage import local_upload_path, store_upload

MOUNT = f"{settings.API_V1_STR}/uploads"


def _png_upload(name: str = "a.png") -> UploadFile:
    buf = io.BytesIO()
    Image.new("RGB", (2, 2), "red").save(buf, format="PNG")
    buf.seek(0)
    return UploadFile(filename=name, file=buf, headers={"content-type": "image/png"})


class TestLocalUploadPath:
    """The stored-URL → filesystem-path direction has to read every shape the
    app has written, because rows predating the normalisation are still bare."""

    def test_current_prefixed_shape(self):
        assert local_upload_path(f"{MOUNT}/agents/org/a.png") == os.path.join(
            "uploads", "agents/org/a.png")

    def test_legacy_bare_shape(self):
        # What agent photos and profile pictures carried before the migration.
        assert local_upload_path("/uploads/agents/org/a.png") == os.path.join(
            "uploads", "agents/org/a.png")

    def test_relative_key(self):
        assert local_upload_path("agents/org/a.png") == os.path.join(
            "uploads", "agents/org/a.png")

    def test_never_doubles_the_uploads_segment(self):
        for stored in (f"{MOUNT}/x.png", "/uploads/x.png", "uploads/x.png", "x.png"):
            assert local_upload_path(stored) == os.path.join("uploads", "x.png"), stored


class TestWritersAgree:
    """Every local writer must emit the same prefix, or the frontend resolves
    the path against the API origin and 404s off the static mount."""

    @pytest.mark.asyncio
    async def test_store_upload_prefixes(self, tmp_path, monkeypatch):
        monkeypatch.chdir(tmp_path)
        monkeypatch.setattr(settings, "S3_FILE_STORAGE", False)
        stored = await store_upload(b"x", "help_center", "a.png", "image/png")
        assert stored.startswith(f"{MOUNT}/")

    @pytest.mark.asyncio
    async def test_agent_photo_prefixes_and_round_trips(self, tmp_path, monkeypatch):
        monkeypatch.chdir(tmp_path)
        monkeypatch.setattr(settings, "S3_FILE_STORAGE", False)
        stored = await save_file(_png_upload(), uuid4())
        assert stored.startswith(f"{MOUNT}/")
        # The delete path reads it back through local_upload_path.
        assert os.path.exists(local_upload_path(stored))

    @pytest.mark.asyncio
    async def test_profile_pic_prefixes_and_round_trips(self, tmp_path, monkeypatch):
        monkeypatch.chdir(tmp_path)
        monkeypatch.setattr(settings, "S3_FILE_STORAGE", False)
        stored = await save_upload_file(_png_upload(), str(uuid4()), str(uuid4()))
        assert stored.startswith(f"{MOUNT}/")
        assert os.path.exists(local_upload_path(stored))

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
from unittest.mock import patch
from uuid import uuid4

import pytest
from fastapi import HTTPException, UploadFile
from PIL import Image

from app.api.agent import save_file
from app.services.avatar_image import AVATAR_PIXELS

# A real PNG, since save_file decodes the bytes with Pillow before storing.
def _png_bytes(size: int = 1) -> bytes:
    buffer = io.BytesIO()
    Image.new("RGB", (size, size)).save(buffer, format="PNG")
    return buffer.getvalue()


def _upload(filename: str, content_type: str = "image/png", content: bytes = None) -> UploadFile:
    return UploadFile(
        filename=filename,
        file=io.BytesIO(_png_bytes() if content is None else content),
        headers={"content-type": content_type},
    )


@pytest.mark.asyncio
class TestAgentPhotoStoredName:
    """The stored name must not inherit anything from the caller's filename.

    It used to be `uuid4() + os.path.splitext(file.filename)[1]`, so the caller
    chose the extension. Every photo is now re-encoded to WebP, so the name is
    always a fresh uuid plus .webp, which keeps caller-supplied text out of the
    path entirely.
    """

    async def test_the_stored_photo_is_always_webp(self, tmp_path, monkeypatch):
        monkeypatch.chdir(tmp_path)
        with patch("app.api.agent.settings.S3_FILE_STORAGE", False):
            path = await save_file(_upload("holiday snap.png"), uuid4())

        assert path.endswith(".webp")

    async def test_a_lying_extension_is_ignored(self, tmp_path, monkeypatch):
        # Caller says .php; the bytes and the content type say PNG.
        monkeypatch.chdir(tmp_path)
        with patch("app.api.agent.settings.S3_FILE_STORAGE", False):
            path = await save_file(_upload("shell.php"), uuid4())

        assert path.endswith(".webp")
        assert ".php" not in path

    async def test_traversal_in_the_filename_cannot_reach_the_path(self, tmp_path, monkeypatch):
        monkeypatch.chdir(tmp_path)
        organization_id = uuid4()
        with patch("app.api.agent.settings.S3_FILE_STORAGE", False):
            path = await save_file(_upload("../../../../etc/passwd.png"), organization_id)

        assert ".." not in path
        assert path.endswith(".webp")
        # Everything written stays under the organization's own upload folder.
        assert f"uploads/agents/{organization_id}" in path
        written = os.path.join("uploads", "agents", str(organization_id))
        assert len(os.listdir(written)) == 1

    async def test_a_disallowed_content_type_is_refused(self):
        with pytest.raises(HTTPException) as excinfo:
            await save_file(_upload("payload.svg", content_type="image/svg+xml"), uuid4())

        assert excinfo.value.status_code == 400

    async def test_bytes_that_are_not_an_image_are_refused(self, tmp_path, monkeypatch):
        # The content type claims PNG; the bytes say otherwise.
        monkeypatch.chdir(tmp_path)
        with patch("app.api.agent.settings.S3_FILE_STORAGE", False), pytest.raises(HTTPException) as excinfo:
            await save_file(_upload("photo.png", content=b"<?php echo 1; ?>"), uuid4())

        assert excinfo.value.status_code == 400
        assert not os.path.exists("uploads")


@pytest.mark.asyncio
class TestAgentPhotoIsShrunk:
    """The photo is shown as a small avatar, so a large upload is never kept."""

    async def test_a_large_png_is_stored_as_a_small_webp(self, tmp_path, monkeypatch):
        monkeypatch.chdir(tmp_path)
        with patch("app.api.agent.settings.S3_FILE_STORAGE", False):
            path = await save_file(_upload("me.png", content=_png_bytes(512)), uuid4())

        stored = Image.open(os.path.join("uploads", path.split("/uploads/", 1)[1]))
        assert stored.format == "WEBP"
        assert stored.size == (AVATAR_PIXELS, AVATAR_PIXELS)

    async def test_s3_gets_the_webp_with_its_content_type(self):
        organization_id = uuid4()
        with patch("app.services.file_storage.settings.S3_FILE_STORAGE", True), \
             patch("app.services.file_storage.upload_file_to_s3", return_value="https://s3/x.webp") as upload:
            await save_file(_upload("me.png", content=_png_bytes(512)), organization_id)

        content, folder, name = upload.call_args.args
        assert folder == f"agents/{organization_id}"
        assert name.endswith(".webp")
        assert upload.call_args.kwargs["content_type"] == "image/webp"
        assert Image.open(io.BytesIO(content)).size == (AVATAR_PIXELS, AVATAR_PIXELS)

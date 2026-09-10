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

# A real 1x1 PNG, since save_file verifies the bytes with Pillow before storing.
def _png_bytes() -> bytes:
    buffer = io.BytesIO()
    Image.new("RGB", (1, 1)).save(buffer, format="PNG")
    return buffer.getvalue()


def _upload(filename: str, content_type: str = "image/png") -> UploadFile:
    return UploadFile(
        filename=filename,
        file=io.BytesIO(_png_bytes()),
        headers={"content-type": content_type},
    )


@pytest.mark.asyncio
class TestAgentPhotoStoredName:
    """The stored name must not inherit anything from the caller's filename.

    It used to be `uuid4() + os.path.splitext(file.filename)[1]`, so the caller
    chose the extension. The name now comes from the content type we already
    validated, which keeps caller-supplied text out of the path entirely.
    """

    async def test_extension_comes_from_the_content_type(self, tmp_path, monkeypatch):
        monkeypatch.chdir(tmp_path)
        with patch("app.api.agent.settings.S3_FILE_STORAGE", False):
            path = await save_file(_upload("holiday snap.png"), uuid4())

        assert path.endswith(".png")

    async def test_a_lying_extension_is_ignored(self, tmp_path, monkeypatch):
        # Caller says .php; the bytes and the content type say PNG.
        monkeypatch.chdir(tmp_path)
        with patch("app.api.agent.settings.S3_FILE_STORAGE", False):
            path = await save_file(_upload("shell.php"), uuid4())

        assert path.endswith(".png")
        assert ".php" not in path

    async def test_traversal_in_the_filename_cannot_reach_the_path(self, tmp_path, monkeypatch):
        monkeypatch.chdir(tmp_path)
        organization_id = uuid4()
        with patch("app.api.agent.settings.S3_FILE_STORAGE", False):
            path = await save_file(_upload("../../../../etc/passwd.png"), organization_id)

        assert ".." not in path
        assert path.endswith(".png")
        # Everything written stays under the organization's own upload folder.
        assert f"uploads/agents/{organization_id}" in path
        written = os.path.join("uploads", "agents", str(organization_id))
        assert len(os.listdir(written)) == 1

    async def test_a_disallowed_content_type_is_refused(self):
        with pytest.raises(HTTPException) as excinfo:
            await save_file(_upload("payload.svg", content_type="image/svg+xml"), uuid4())

        assert excinfo.value.status_code == 400

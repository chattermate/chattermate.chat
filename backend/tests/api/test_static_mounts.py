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

from pathlib import Path

import pytest
from fastapi.testclient import TestClient

import app.main  # noqa: F401 — the static mounts are added when main is imported
from app.core.application import app

# Escapes that must never reach a file outside the mounted directory, in the
# encodings a proxy will happily pass through untouched.
TRAVERSALS = [
    "/assets/../requirements.txt",
    "/assets/%2e%2e/requirements.txt",
    "/assets/..%2frequirements.txt",
    "/assets/%2e%2e%2frequirements.txt",
    "/assets//etc/passwd",
    "/api/v1/uploads/../requirements.txt",
]


@pytest.fixture(scope="module")
def client():
    return TestClient(app)


class TestStaticMounts:
    """The widget bundle is served straight off disk by StaticFiles, so these
    mounts are the app's only file-serving surface and worth pinning down."""

    def test_widget_bundle_is_served(self, client):
        response = client.get("/assets/widget.js")

        assert response.status_code == 200
        assert response.content, "widget.js served empty"

    def test_uploaded_file_is_served(self, client, tmp_path):
        uploaded = Path("uploads") / "static-mount-probe.txt"
        uploaded.write_text("probe")
        try:
            response = client.get("/api/v1/uploads/static-mount-probe.txt")
        finally:
            uploaded.unlink(missing_ok=True)

        assert response.status_code == 200
        assert response.text == "probe"

    def test_missing_file_is_a_404_not_a_route_fallthrough(self, client):
        response = client.get("/assets/does-not-exist.js")

        assert response.status_code == 404

    @pytest.mark.parametrize("path", TRAVERSALS)
    def test_traversal_cannot_escape_the_mounted_directory(self, client, path):
        response = client.get(path)

        assert response.status_code != 200, f"{path} escaped the mount"
        assert "fastapi" not in response.text.lower(), f"{path} leaked requirements.txt"

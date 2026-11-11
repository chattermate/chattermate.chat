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

"""Local-storage chat attachments are served only through signed links."""

import time
from unittest.mock import MagicMock, patch
from urllib.parse import parse_qs, urlparse

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlalchemy import inspect

from app.api.file_upload import router
from app.core.local_file_urls import sign_local_key, verify_local_signature
from app.models.chat_history import ChatHistory
from app.models.file_attachment import FileAttachment
from app.repositories.chat import ChatRepository
from app.services.file_storage import resolve_public_url, signed_upload_key

ORG_ID = "bab82aab-d095-46f8-bf16-da638671bcf4"
OTHER_ORG_ID = "11111111-2222-3333-4444-555555555555"
KEY = f"chat_attachments/{ORG_ID}/3f1c2b4e.txt"
STORED = f"/uploads/{KEY}"  # what FileUploadService writes to file_url

test_app = FastAPI()
test_app.include_router(router, prefix="/api/v1/files")


@pytest.fixture
def client(tmp_path, monkeypatch):
    """Serve from a throwaway uploads/ with one attachment per org."""
    monkeypatch.chdir(tmp_path)
    for org in (ORG_ID, OTHER_ORG_ID):
        folder = tmp_path / "uploads" / "chat_attachments" / org
        folder.mkdir(parents=True)
        (folder / "3f1c2b4e.txt").write_text(f"attachment of {org}")
    return TestClient(test_app)


def _query(url):
    return {k: v[0] for k, v in parse_qs(urlparse(url).query).items()}


class TestSignedRoute:
    def test_a_valid_signature_is_served(self, client):
        response = client.get(sign_local_key(KEY))

        assert response.status_code == 200
        assert response.text == f"attachment of {ORG_ID}"
        assert response.headers["content-security-policy"] == "script-src 'none'"
        assert response.headers["x-content-type-options"] == "nosniff"

    def test_an_unsigned_path_is_refused(self, client):
        assert client.get(f"/api/v1/files/local/{KEY}").status_code == 403

    def test_a_forged_signature_is_refused(self, client):
        exp = int(time.time()) + 600
        response = client.get(f"/api/v1/files/local/{KEY}?exp={exp}&sig={'0' * 64}")
        assert response.status_code == 403

    def test_an_expired_signature_is_refused(self, client):
        response = client.get(sign_local_key(KEY, expires_in=-1))
        assert response.status_code == 403

    def test_extending_the_expiry_breaks_the_signature(self, client):
        params = _query(sign_local_key(KEY, expires_in=60))
        response = client.get(
            f"/api/v1/files/local/{KEY}?exp={int(params['exp']) + 3600}&sig={params['sig']}")
        assert response.status_code == 403

    def test_a_signature_for_one_org_does_not_open_another_orgs_file(self, client):
        params = _query(sign_local_key(KEY))
        other = f"chat_attachments/{OTHER_ORG_ID}/3f1c2b4e.txt"
        response = client.get(
            f"/api/v1/files/local/{other}?exp={params['exp']}&sig={params['sig']}")
        assert response.status_code == 403

    @pytest.mark.parametrize("path", [
        "help_center_imports/x.pdf",
        f"chat_attachments/{ORG_ID}/../../secret.txt",
        "chat_attachments/not-a-uuid/file.txt",
    ])
    def test_only_attachment_paths_are_servable(self, client, path):
        signed = f"/api/v1/files/local/{path}?" + urlparse(sign_local_key(path)).query
        assert client.get(signed).status_code == 404

    def test_a_signed_link_to_a_missing_file_is_a_404(self, client):
        missing = f"chat_attachments/{ORG_ID}/gone.txt"
        assert client.get(sign_local_key(missing)).status_code == 404


class TestSigning:
    def test_signature_is_bound_to_key_and_expiry(self):
        params = _query(sign_local_key(KEY))
        exp, sig = int(params["exp"]), params["sig"]
        assert verify_local_signature(KEY, exp, sig)
        assert not verify_local_signature(KEY + "x", exp, sig)
        assert not verify_local_signature(KEY, exp + 1, sig)
        assert not verify_local_signature(KEY, None, sig)
        assert not verify_local_signature(KEY, exp, None)

    @pytest.mark.parametrize("stored", [STORED, f"/api/v1{STORED}", KEY])
    def test_every_stored_shape_of_an_attachment_is_signed(self, stored):
        assert signed_upload_key(stored) == KEY

    @pytest.mark.parametrize("stored", [
        "/api/v1/uploads/agents/org/a.png",
        "/api/v1/uploads/help_center/logo.png",
        "https://bucket.s3.amazonaws.com/chat_attachments/x.png",
        "data:image/png;base64,AAAA",
        None,
    ])
    def test_public_and_remote_urls_are_left_alone(self, stored):
        assert signed_upload_key(stored) is None

    @pytest.mark.asyncio
    async def test_resolve_public_url_hands_out_a_link_the_route_serves(self, client):
        url = await resolve_public_url(STORED)

        assert url.startswith(f"/api/v1/files/local/{KEY}?exp=")
        assert client.get(url).status_code == 200

    @pytest.mark.asyncio
    async def test_s3_urls_are_still_presigned(self, monkeypatch):
        from app.services import file_storage
        monkeypatch.setattr(file_storage.settings, "S3_FILE_STORAGE", True)
        with patch.object(file_storage, "sign_s3_url", return_value="https://signed") as presign:
            assert await resolve_public_url("https://b.s3.amazonaws.com/k") == "https://signed"
        presign.assert_called_once()


@pytest.mark.asyncio
async def test_session_history_signs_without_dirtying_the_row():
    """The signed link must never be flushed back over the stored path."""
    attachment = FileAttachment(file_url=STORED, filename="a.txt",
                                content_type="text/plain", file_size=1)
    message = ChatHistory(message="hi", message_type="user")
    message.attachments = [attachment]
    db = MagicMock()
    db.query.return_value.options.return_value.filter.return_value \
        .order_by.return_value.all.return_value = [message]

    messages = await ChatRepository(db).get_session_history(
        "00000000-0000-0000-0000-000000000001")

    assert messages[0].attachments[0].file_url.startswith("/api/v1/files/local/")
    assert not inspect(attachment).attrs.file_url.history.has_changes()

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
from unittest.mock import patch
from uuid import uuid4

import pytest
from fastapi import FastAPI, HTTPException
from fastapi.testclient import TestClient
from PIL import Image

from app.api import agent as agent_router
from app.api import agent_logo
from app.core.auth import get_unified_auth
from app.database import get_db
from app.models.agent import Agent, AgentCustomization, AgentType
from app.models.permission import Permission, role_permissions
from app.models.role import Role
from app.models.user import User
from app.services import launcher

app = FastAPI()
app.include_router(agent_router.router, prefix="/api/agent")
app.include_router(agent_logo.router, prefix="/api/agent")


def _png(color=(0, 0, 0, 0), size=(200, 200)):
    buffer = io.BytesIO()
    Image.new("RGBA", size, color).save(buffer, format="PNG")
    return buffer.getvalue()


def _files(content, name="logo.png", content_type="image/png"):
    return {"logo": (name, content, content_type)}


@pytest.fixture
def user(db, test_organization_id):
    permission = Permission(name="manage_agents", description="x")
    role = Role(name="Admin", description="x", organization_id=test_organization_id, is_default=True)
    db.add_all([permission, role])
    db.commit()
    db.execute(role_permissions.insert().values(role_id=role.id, permission_id=permission.id))
    user = User(id=uuid4(), email="logo@example.com", hashed_password="x", is_active=True,
                organization_id=test_organization_id, full_name="U", role_id=role.id)
    db.add(user)
    db.commit()
    return user


@pytest.fixture
def agent(db, user):
    agent = Agent(id=uuid4(), name="A", display_name="A", description="d", agent_type=AgentType.CUSTOMER_SUPPORT,
                  instructions=["i"], is_active=True, organization_id=user.organization_id)
    db.add(agent)
    db.commit()
    return agent


@pytest.fixture
def client(db, user, tmp_path, monkeypatch):
    monkeypatch.chdir(tmp_path)

    async def auth():
        return {"auth_type": "jwt", "organization_id": user.organization_id, "user_id": user.id, "current_user": user}

    def override_db():
        yield db

    app.dependency_overrides[get_unified_auth] = auth
    app.dependency_overrides[get_db] = override_db
    with patch("app.services.file_storage.settings.S3_FILE_STORAGE", False):
        yield TestClient(app)
    app.dependency_overrides.clear()


def _row(db, agent):
    db.expire_all()
    return db.query(AgentCustomization).filter(AgentCustomization.agent_id == agent.id).first()


def _deny(*args, **kwargs):
    raise HTTPException(status_code=403, detail=launcher.UPGRADE_MESSAGE)


class TestUpload:
    def test_stores_a_webp_and_records_transparency(self, client, db, agent, tmp_path):
        response = client.post(f"/api/agent/{agent.id}/customization/logo", files=_files(_png()))
        assert response.status_code == 200
        row = _row(db, agent)
        assert row.icon_url.endswith(".webp")
        assert f"agents/{agent.organization_id}/" in row.icon_url
        assert row.customization_metadata["launcher"]["logo_transparent"] is True
        assert response.json()["icon_url"] == row.icon_url

    def test_opaque_logo(self, client, db, agent):
        client.post(f"/api/agent/{agent.id}/customization/logo", files=_files(_png((1, 2, 3, 255))))
        assert _row(db, agent).customization_metadata["launcher"]["logo_transparent"] is False

    def test_keeps_other_metadata(self, client, db, agent):
        db.add(AgentCustomization(agent_id=agent.id, customization_metadata={"avatar_style": "orb", "launcher": {"size": "sm"}}))
        db.commit()
        client.post(f"/api/agent/{agent.id}/customization/logo", files=_files(_png()))
        metadata = _row(db, agent).customization_metadata
        assert metadata["avatar_style"] == "orb"
        assert metadata["launcher"]["size"] == "sm"

    def test_replacing_deletes_the_old_file_only_after_saving(self, client, db, agent):
        client.post(f"/api/agent/{agent.id}/customization/logo", files=_files(_png()))
        old = _row(db, agent).icon_url
        seen = {}

        async def spy(stored):
            seen["stored"] = stored
            seen["row_url_at_delete"] = _row(db, agent).icon_url

        with patch("app.api.agent_logo.delete_upload", side_effect=spy):
            client.post(f"/api/agent/{agent.id}/customization/logo", files=_files(_png()))
        assert seen["stored"] == old
        assert seen["row_url_at_delete"] != old

    def test_failed_store_keeps_the_old_logo(self, client, db, agent):
        client.post(f"/api/agent/{agent.id}/customization/logo", files=_files(_png()))
        old = _row(db, agent).icon_url
        with patch("app.api.agent_logo.store_upload", side_effect=RuntimeError("s3 down")), \
                patch("app.api.agent_logo.delete_upload") as delete:
            response = client.post(f"/api/agent/{agent.id}/customization/logo", files=_files(_png()))
        assert response.status_code == 500
        assert "s3 down" not in response.text
        delete.assert_not_called()
        assert _row(db, agent).icon_url == old

    def test_failed_save_removes_the_new_file_and_keeps_the_old_logo(self, client, db, agent):
        client.post(f"/api/agent/{agent.id}/customization/logo", files=_files(_png()))
        old = _row(db, agent).icon_url
        with patch.object(db, "commit", side_effect=RuntimeError("db down")), \
                patch("app.api.agent_logo.delete_upload") as delete:
            response = client.post(f"/api/agent/{agent.id}/customization/logo", files=_files(_png()))
        assert response.status_code == 500
        assert "db down" not in response.text
        delete.assert_called_once()
        assert delete.call_args.args[0] != old
        assert _row(db, agent).icon_url == old

    def test_content_type_is_not_trusted(self, client, agent):
        svg = b'<svg xmlns="http://www.w3.org/2000/svg"></svg>'
        response = client.post(f"/api/agent/{agent.id}/customization/logo", files=_files(svg, "a.png", "image/png"))
        assert response.status_code == 400

    def test_rejections_reach_the_user(self, client, agent):
        response = client.post(f"/api/agent/{agent.id}/customization/logo", files=_files(_png(size=(50, 50))))
        assert response.status_code == 400
        assert "too small" in response.json()["detail"]

    def test_oversize_body(self, client, agent):
        response = client.post(f"/api/agent/{agent.id}/customization/logo", files=_files(b"x" * (1024 * 1024 + 10)))
        assert response.status_code == 400
        assert "1 MB" in response.json()["detail"]

    def test_needs_the_plan(self, client, db, agent):
        with patch("app.api.agent_logo.check_feature_access", side_effect=_deny) as gate:
            response = client.post(f"/api/agent/{agent.id}/customization/logo", files=_files(_png()))
        assert response.status_code == 403
        assert gate.call_args.args[2] == "custom_branding"
        assert _row(db, agent) is None

    def test_another_orgs_agent_looks_missing(self, client, db, agent):
        other = Agent(id=uuid4(), name="B", display_name="B", description="d", agent_type=AgentType.CUSTOMER_SUPPORT,
                      instructions=["i"], organization_id=uuid4())
        db.add(other)
        db.commit()
        assert client.post(f"/api/agent/{other.id}/customization/logo", files=_files(_png())).status_code == 404
        assert client.delete(f"/api/agent/{other.id}/customization/logo").status_code == 404

    def test_unknown_agent(self, client):
        response = client.post(f"/api/agent/{uuid4()}/customization/logo", files=_files(_png()))
        assert response.status_code == 404


class TestRemove:
    def test_clears_logo_and_falls_back(self, client, db, agent):
        client.post(f"/api/agent/{agent.id}/customization/logo", files=_files(_png()))
        row = _row(db, agent)
        url = row.icon_url
        row.customization_metadata = {"launcher": {"icon": "logo", "background": "none", "logo_transparent": True, "size": "sm"}}
        db.commit()
        with patch("app.api.agent_logo.delete_upload") as delete:
            response = client.delete(f"/api/agent/{agent.id}/customization/logo")
        assert response.status_code == 200
        delete.assert_called_once_with(url)
        row = _row(db, agent)
        assert row.icon_url is None
        assert row.customization_metadata["launcher"] == {"icon": "dots", "size": "sm"}

    def test_works_after_a_downgrade(self, client, db, agent):
        client.post(f"/api/agent/{agent.id}/customization/logo", files=_files(_png()))
        with patch("app.api.agent_logo.check_feature_access", side_effect=_deny):
            assert client.delete(f"/api/agent/{agent.id}/customization/logo").status_code == 200

    def test_nothing_to_remove(self, client, agent):
        assert client.delete(f"/api/agent/{agent.id}/customization/logo").status_code == 404


class TestCustomizationWrite:
    def _save(self, client, agent, **body):
        return client.post(f"/api/agent/{agent.id}/customization", json=body)

    def test_a_posted_url_is_not_stored(self, client, db, agent):
        response = self._save(client, agent, icon_url="https://evil.example/x.png")
        assert response.status_code == 200
        assert _row(db, agent).icon_url is None

    def test_a_posted_url_cannot_replace_the_logo(self, client, db, agent):
        client.post(f"/api/agent/{agent.id}/customization/logo", files=_files(_png()))
        url = _row(db, agent).icon_url
        self._save(client, agent, icon_url="https://evil.example/x.png", accent_color="#000000")
        assert _row(db, agent).icon_url == url

    def test_new_paid_choice_without_the_plan(self, client, db, agent):
        with patch("app.services.launcher.check_feature_access", side_effect=_deny):
            response = self._save(client, agent, customization_metadata={"launcher": {"animation": "swoosh"}})
        assert response.status_code == 403
        assert _row(db, agent) is None

    def test_downgraded_org_saves_a_colour(self, client, db, agent):
        db.add(AgentCustomization(agent_id=agent.id, customization_metadata={"launcher": {"icon": "logo", "animation": "glow"}}))
        db.commit()
        with patch("app.services.launcher.check_feature_access", side_effect=_deny):
            response = self._save(client, agent, accent_color="#123456",
                                  customization_metadata={"launcher": {"icon": "logo", "animation": "glow"}})
        assert response.status_code == 200
        assert _row(db, agent).accent_color == "#123456"

    def test_save_without_metadata_leaves_it_alone(self, client, db, agent):
        db.add(AgentCustomization(agent_id=agent.id, customization_metadata={"launcher": {"size": "sm"}}))
        db.commit()
        assert self._save(client, agent, accent_color="#123456").status_code == 200
        assert _row(db, agent).customization_metadata == {"launcher": {"size": "sm"}}

    def test_form_cannot_change_logo_transparent(self, client, db, agent):
        db.add(AgentCustomization(agent_id=agent.id, customization_metadata={"launcher": {"logo_transparent": False}}))
        db.commit()
        self._save(client, agent, customization_metadata={"launcher": {"logo_transparent": True, "size": "md"}})
        assert _row(db, agent).customization_metadata["launcher"] == {"size": "md", "logo_transparent": False}

    def test_a_first_save_keeps_a_new_agent_on_medium(self, client, db, agent):
        self._save(client, agent, accent_color="#123456")
        assert _row(db, agent).customization_metadata == {"launcher": {"size": "md"}}

    def test_a_first_save_keeps_a_chosen_size(self, client, db, agent):
        self._save(client, agent, customization_metadata={"launcher": {"size": "lg"}})
        assert _row(db, agent).customization_metadata["launcher"]["size"] == "lg"

    def test_a_first_logo_keeps_a_new_agent_on_medium(self, client, db, agent):
        client.post(f"/api/agent/{agent.id}/customization/logo", files=_files(_png()))
        assert _row(db, agent).customization_metadata["launcher"]["size"] == "md"

    def test_later_saves_add_nothing(self, client, db, agent):
        db.add(AgentCustomization(agent_id=agent.id, customization_metadata={}))
        db.commit()
        self._save(client, agent, customization_metadata={"avatar_style": "orb"})
        assert _row(db, agent).customization_metadata == {"avatar_style": "orb"}

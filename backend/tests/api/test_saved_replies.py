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

"""Saved replies: the team's shared library, scoped to the organization."""

from uuid import uuid4

import pytest
from fastapi import FastAPI, status
from fastapi.testclient import TestClient

from app.api import saved_replies
from app.core.auth import get_current_user
from app.database import get_db
from app.models.permission import Permission, role_permissions
from app.models.role import Role
from app.models.saved_reply import SavedReply
from app.models.user import User

app = FastAPI()
app.include_router(saved_replies.router, prefix="/api/v1/saved-replies")
URL = "/api/v1/saved-replies"


def _role(db, org_id, *names):
    role = Role(name=f"role-{uuid4().hex[:6]}", description="", organization_id=org_id, is_default=False)
    db.add(role)
    db.commit()
    for name in names:
        perm = db.query(Permission).filter(Permission.name == name).first() or Permission(name=name, description=name)
        db.add(perm)
        db.commit()
        db.execute(role_permissions.insert().values(role_id=role.id, permission_id=perm.id))
    db.commit()
    return role


def _user(db, org_id, role):
    user = User(id=uuid4(), email=f"u-{uuid4().hex[:6]}@example.com", hashed_password="x", full_name="Sam",
                organization_id=org_id, role_id=role.id, is_active=True)
    db.add(user)
    db.commit()
    return user


@pytest.fixture
def agent(db, test_organization_id):
    return _user(db, test_organization_id, _role(db, test_organization_id, "manage_assigned_chats", "view_assigned_chats"))


@pytest.fixture
def viewer(db, test_organization_id):
    return _user(db, test_organization_id, _role(db, test_organization_id, "view_assigned_chats"))


@pytest.fixture
def client(db, agent):
    app.dependency_overrides[get_current_user] = lambda: agent
    app.dependency_overrides[get_db] = lambda: db
    yield TestClient(app)
    app.dependency_overrides.clear()


def _as(user):
    app.dependency_overrides[get_current_user] = lambda: user


REFUND = {"title": "EU refund", "body": "Hi {{customer.first_name}}, returns within the EU are free.", "shortcut": "/Refund-EU "}


def test_the_team_adds_lists_edits_and_removes_a_reply(client):
    created = client.post(URL, json=REFUND)
    assert created.status_code == status.HTTP_201_CREATED
    reply = created.json()
    assert reply["shortcut"] == "refund-eu"

    assert [r["title"] for r in client.get(URL).json()] == ["EU refund"]

    edited = client.put(f"{URL}/{reply['id']}", json={**REFUND, "title": "EU returns", "shortcut": ""})
    assert edited.json()["title"] == "EU returns"
    assert edited.json()["shortcut"] is None

    assert client.delete(f"{URL}/{reply['id']}").status_code == status.HTTP_204_NO_CONTENT
    assert client.get(URL).json() == []


def test_a_shortcut_is_unique_in_the_organization(client):
    client.post(URL, json=REFUND)
    clash = client.post(URL, json={**REFUND, "title": "Another"})
    assert clash.status_code == 409
    other = client.post(URL, json={**REFUND, "title": "Other", "shortcut": "other"}).json()
    assert client.put(f"{URL}/{other['id']}", json={**REFUND, "shortcut": "refund-eu"}).status_code == 409
    # Keeping its own shortcut is not a clash
    assert client.put(f"{URL}/{other['id']}", json={**REFUND, "shortcut": "other"}).status_code == 200


@pytest.mark.parametrize("payload", [
    {"title": "", "body": "x"},
    {"title": "   ", "body": "x"},
    {"title": "x", "body": ""},
    {"title": "x" * 101, "body": "x"},
    {"title": "x", "body": "x" * 4001},
    {"title": "x", "body": "x", "shortcut": "has space"},
    {"title": "x", "body": "x", "shortcut": "émoji"},
])
def test_refuses_what_is_not_a_reply(client, payload):
    assert client.post(URL, json=payload).status_code == 422


def test_someone_who_only_views_chats_can_use_but_not_change_them(db, client, agent, viewer):
    reply = client.post(URL, json=REFUND).json()
    _as(viewer)
    assert client.get(URL).status_code == 200
    assert client.post(URL, json={**REFUND, "shortcut": "x"}).status_code == 403
    assert client.put(f"{URL}/{reply['id']}", json=REFUND).status_code == 403
    assert client.delete(f"{URL}/{reply['id']}").status_code == 403


def test_another_organizations_replies_stay_out_of_reach(db, client, agent):
    other_org = uuid4()
    theirs = SavedReply(organization_id=other_org, title="Theirs", body="secret")
    db.add(theirs)
    db.commit()

    assert client.get(URL).json() == []
    assert client.put(f"{URL}/{theirs.id}", json=REFUND).status_code == 404
    assert client.delete(f"{URL}/{theirs.id}").status_code == 404
    db.refresh(theirs)
    assert theirs.title == "Theirs"


def test_without_inbox_access_even_the_list_is_refused(db, client, test_organization_id):
    _as(_user(db, test_organization_id, _role(db, test_organization_id)))
    assert client.get(URL).status_code == 403

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

"""AI help in the inbox: who may ask, on which plan, and what comes back."""

from unittest.mock import AsyncMock, patch
from uuid import uuid4

import pytest
from fastapi import FastAPI, status
from fastapi.testclient import TestClient

from app.api import inbox_assistant as assist_api
from app.core.auth import get_current_user
from app.database import get_db
from app.models.agent import Agent
from app.models.customer import Customer
from app.models.permission import Permission, role_permissions
from app.models.role import Role
from app.models.session_to_agent import SessionStatus, SessionToAgent
from app.models.user import User
from app.services.inbox_assistant import AssistFailed, AssistUnavailable, KnowledgeDraft, ModelSetup

app = FastAPI()
app.include_router(assist_api.router, prefix="/api/v1/sessions")

SETUP = ModelSetup(model_type='OPENAI', api_key='k', model_name='m', base_url=None)


def _role(db, org_id, *names):
    role = Role(name=f"Role {uuid4().hex[:6]}", description="", organization_id=org_id, is_default=False)
    db.add(role)
    db.commit()
    for name in names:
        perm = db.query(Permission).filter(Permission.name == name).first()
        if perm is None:
            perm = Permission(name=name, description=name)
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
def me(db, test_organization_id):
    return _user(db, test_organization_id, _role(db, test_organization_id, "manage_all_chats", "manage_knowledge"))


@pytest.fixture
def chat(db, test_organization_id, me):
    agent = Agent(id=uuid4(), name="Bot", agent_type="CUSTOMER_SUPPORT", instructions=["x"],
                  organization_id=test_organization_id)
    customer = Customer(id=uuid4(), email="maya@example.com", full_name="Maya", organization_id=test_organization_id)
    db.add_all([agent, customer])
    db.commit()
    session = SessionToAgent(session_id=uuid4(), organization_id=test_organization_id, agent_id=agent.id,
                             customer_id=customer.id, status=SessionStatus.OPEN, user_id=me.id)
    db.add(session)
    db.commit()
    return session


@pytest.fixture
def client(db, me):
    app.dependency_overrides[get_current_user] = lambda: me
    app.dependency_overrides[get_db] = lambda: db
    yield TestClient(app)
    app.dependency_overrides.clear()


@pytest.fixture
def model():
    with patch('app.api.inbox_assistant.inbox_assistant.model_setup', return_value=SETUP), \
         patch('app.api.inbox_assistant.inbox_assistant.transcript', return_value="Customer: hi\nTeammate: hello"):
        yield


def _url(chat, action):
    return f"/api/v1/sessions/{chat.session_id}/assist/{action}"


class TestImprove:
    def test_returns_the_rewrite(self, client, chat, model):
        with patch('app.api.inbox_assistant.inbox_assistant.improve', new=AsyncMock(return_value="Hello, Maya!")) as improve:
            response = client.post(_url(chat, 'improve'), json={"text": "hello maya", "style": "fix"})
        assert response.status_code == 200
        assert response.json() == {"text": "Hello, Maya!"}
        assert improve.await_args.args[1:3] == ("hello maya", "fix")

    def test_refuses_an_unknown_style(self, client, chat, model):
        assert client.post(_url(chat, 'improve'), json={"text": "x", "style": "pirate"}).status_code == 422

    def test_a_model_that_does_not_answer_is_a_502(self, client, chat, model):
        with patch('app.api.inbox_assistant.inbox_assistant.improve', new=AsyncMock(side_effect=AssistFailed())):
            response = client.post(_url(chat, 'improve'), json={"text": "x", "style": "shorter"})
        assert response.status_code == status.HTTP_502_BAD_GATEWAY


class TestPlanAndSetup:
    def test_a_plan_without_ai_in_the_inbox_is_refused(self, client, chat, model):
        with patch('app.services.inbox_plan.plan_flag_on', return_value=False):
            response = client.post(_url(chat, 'summary'))
        assert response.status_code == 403
        assert "Growth" in response.json()["detail"]

    def test_no_model_set_up_says_so(self, client, chat):
        with patch('app.api.inbox_assistant.inbox_assistant.model_setup',
                   side_effect=AssistUnavailable("Set up an AI model in AI configuration first")):
            response = client.post(_url(chat, 'summary'))
        assert response.status_code == 409
        assert response.json()["detail"] == "Set up an AI model in AI configuration first"

    def test_another_organizations_chat_is_not_found(self, db, client, model):
        other = SessionToAgent(session_id=uuid4(), organization_id=uuid4(), customer_id=uuid4(),
                               status=SessionStatus.OPEN)
        db.add(other)
        db.commit()
        assert client.post(_url(other, 'summary')).status_code == 404


class TestKnowledge:
    def test_returns_the_draft(self, client, chat, model):
        draft = KnowledgeDraft(ready=True, reason="r", question="Do you ship to Norway?",
                               answer="Yes, delivery takes 5 to 7 working days.")
        with patch('app.api.inbox_assistant.inbox_assistant.knowledge_draft', new=AsyncMock(return_value=draft)):
            response = client.post(_url(chat, 'knowledge'))
        assert response.json() == {"ready": True, "reason": "r", "question": "Do you ship to Norway?",
                                   "answer": "Yes, delivery takes 5 to 7 working days."}

    def test_needs_the_permission_to_edit_knowledge(self, db, client, chat, test_organization_id, model):
        agent_only = _user(db, test_organization_id, _role(db, test_organization_id, "manage_all_chats"))
        app.dependency_overrides[get_current_user] = lambda: agent_only
        assert client.post(_url(chat, 'knowledge')).status_code == 403


class TestSummary:
    def test_returns_the_summary(self, client, chat, model):
        with patch('app.api.inbox_assistant.inbox_assistant.summarize',
                   new=AsyncMock(return_value="- Wants a refund\n- Order 10587")):
            response = client.post(_url(chat, 'summary'))
        assert response.json() == {"summary": "- Wants a refund\n- Order 10587"}

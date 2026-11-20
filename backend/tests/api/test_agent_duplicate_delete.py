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

Duplicating and deleting an agent (services/agent_copy, services/agent_removal).
"""

from unittest.mock import AsyncMock, patch
from uuid import UUID, uuid4

import pytest

from app.models.agent import Agent, AgentCustomization, AgentType, agent_usergroup
from app.models.chat_history import ChatHistory
from app.models.knowledge import Knowledge, SourceType
from app.models.jira import AgentJiraConfig
from app.models.knowledge_to_agent import KnowledgeToAgent
from app.models.shopify.agent_shopify_config import AgentShopifyConfig
from app.models.lead_capture import LeadCaptureConfig
from app.models.widget import Widget
from app.models.workflow import Workflow, WorkflowStatus
from app.services import agent_quota
from app.services.agent_copy import copy_name
# The agent API's own test app and fixtures
from tests.api.test_agent import (  # noqa: F401
    app, client, test_agent, test_customization, test_group, test_permissions, test_role, test_user,
)

BASE = "/api/agents"


@pytest.fixture
def second_agent(db, test_user) -> Agent:
    agent = Agent(id=uuid4(), name="Sales Agent", agent_type=AgentType.SALES,
                  instructions=["Sell"], organization_id=test_user.organization_id)
    db.add(agent)
    db.commit()
    return agent


@pytest.fixture
def knowledge(db, test_user) -> Knowledge:
    source = Knowledge(source="https://example.com", source_type=SourceType.WEBSITE,
                       organization_id=test_user.organization_id)
    db.add(source)
    db.commit()
    return source


class TestDuplicate:
    def test_copies_settings_look_knowledge_groups_and_lead_capture(
            self, client, db, test_agent, test_customization, test_group, knowledge):
        db.add(KnowledgeToAgent(knowledge_id=knowledge.id, agent_id=test_agent.id))
        db.execute(agent_usergroup.insert().values(agent_id=test_agent.id, group_id=test_group.id))
        db.add(LeadCaptureConfig(agent_id=test_agent.id, enabled=True, guidance="Ask for a phone"))
        db.commit()

        r = client.post(f"{BASE}/{test_agent.id}/duplicate")

        assert r.status_code == 201, r.text
        body = r.json()
        assert body["name"] == "Test Agent (copy)"
        assert body["display_name"] == test_agent.display_name
        assert body["instructions"] == test_agent.instructions
        assert body["transfer_to_human"] is True
        copy_id = UUID(body["id"])
        assert copy_id != test_agent.id

        copy_look = db.query(AgentCustomization).filter(AgentCustomization.agent_id == copy_id).one()
        assert copy_look.id != test_customization.id
        assert copy_look.chat_bubble_color == test_customization.chat_bubble_color
        assert db.query(KnowledgeToAgent).filter(KnowledgeToAgent.agent_id == copy_id).count() == 1
        groups = db.execute(agent_usergroup.select().where(agent_usergroup.c.agent_id == copy_id)).all()
        assert [g.group_id for g in groups] == [test_group.id]
        lead = db.query(LeadCaptureConfig).filter(LeadCaptureConfig.agent_id == copy_id).one()
        assert lead.guidance == "Ask for a phone"
        # The original keeps its own rows
        assert db.query(KnowledgeToAgent).filter(KnowledgeToAgent.agent_id == test_agent.id).count() == 1

    def test_leaves_widgets_and_workflows_with_the_original(self, client, db, test_agent):
        db.add(Widget(name="Site", organization_id=test_agent.organization_id, agent_id=test_agent.id))
        workflow = Workflow(name="Flow", agent_id=test_agent.id, organization_id=test_agent.organization_id,
                            status=WorkflowStatus.PUBLISHED)
        db.add(workflow)
        db.commit()
        test_agent.use_workflow = True
        test_agent.active_workflow_id = workflow.id
        test_agent.is_default = True
        db.commit()

        copy_id = UUID(client.post(f"{BASE}/{test_agent.id}/duplicate").json()["id"])

        copy = db.get(Agent, copy_id)
        assert (copy.use_workflow, copy.active_workflow_id, copy.is_default) == (False, None, False)
        assert db.query(Widget).filter(Widget.agent_id == copy_id).count() == 0
        assert db.query(Workflow).filter(Workflow.agent_id == copy_id).count() == 0

    def test_copies_jira_and_shopify_settings(self, client, db, test_agent):
        db.add(AgentJiraConfig(agent_id=str(test_agent.id), enabled=True, project_key="SUP"))
        db.add(AgentShopifyConfig(id=str(uuid4()), agent_id=str(test_agent.id), enabled=True))
        db.commit()

        copy_id = client.post(f"{BASE}/{test_agent.id}/duplicate").json()["id"]

        jira = db.query(AgentJiraConfig).filter(AgentJiraConfig.agent_id == copy_id).one()
        assert (jira.enabled, jira.project_key) == (True, "SUP")
        shopify = db.query(AgentShopifyConfig).filter(AgentShopifyConfig.agent_id == copy_id).one()
        assert shopify.enabled is True
        assert db.query(AgentShopifyConfig).count() == 2

    def test_a_second_copy_gets_the_next_free_name(self, client, test_agent):
        assert client.post(f"{BASE}/{test_agent.id}/duplicate").json()["name"] == "Test Agent (copy)"
        assert client.post(f"{BASE}/{test_agent.id}/duplicate").json()["name"] == "Test Agent (copy 2)"

    def test_a_long_name_is_trimmed_to_fit(self, db, test_agent):
        test_agent.name = "x" * 100
        db.commit()
        name = copy_name(db, test_agent.name, test_agent.organization_id)
        assert len(name) == 100
        assert name.endswith(" (copy)")

    def test_is_refused_past_the_plan_agent_limit(self, client, db, test_agent):
        plan = type("Plan", (), {"max_agents": 1})()
        subscription = type("Sub", (), {"plan": plan})()
        with patch.object(agent_quota, "HAS_ENTERPRISE", True), \
             patch.object(agent_quota, "require_accessible_subscription", create=True, return_value=subscription):
            r = client.post(f"{BASE}/{test_agent.id}/duplicate")

        assert r.status_code == 403
        assert "Maximum number of agents (1)" in r.json()["detail"]
        assert db.query(Agent).filter(Agent.organization_id == test_agent.organization_id).count() == 1

    def test_another_orgs_agent_is_not_found(self, client, db):
        other = Agent(id=uuid4(), name="Theirs", agent_type=AgentType.GENERAL, instructions=["x"],
                      organization_id=uuid4())
        db.add(other)
        db.commit()
        assert client.post(f"{BASE}/{other.id}/duplicate").status_code == 404

    def test_a_new_photo_on_the_copy_leaves_the_shared_one(self, client, db, test_agent, test_customization):
        test_customization.photo_url = "/uploads/agents/shared.webp"
        db.commit()
        copy_id = client.post(f"{BASE}/{test_agent.id}/duplicate").json()["id"]

        from app.api import agent as agent_api
        with patch.object(agent_api, "save_file", AsyncMock(return_value="/uploads/agents/new.webp")), \
             patch.object(agent_api, "delete_replaced_avatar", AsyncMock()) as delete:
            r = client.post(f"{BASE}/{copy_id}/customization/photo",
                            files={"photo": ("p.png", b"x", "image/png")})

        assert r.status_code == 200, r.text
        delete.assert_not_awaited()
        db.refresh(test_customization)
        assert test_customization.photo_url == "/uploads/agents/shared.webp"


class TestDelete:
    def test_removes_the_agent_its_widgets_and_workflows_but_keeps_its_chats(
            self, client, db, test_agent, second_agent):
        org = test_agent.organization_id
        db.add(Widget(name="Site", organization_id=org, agent_id=test_agent.id))
        workflow = Workflow(name="Flow", agent_id=test_agent.id, organization_id=org,
                            status=WorkflowStatus.PUBLISHED)
        db.add(workflow)
        db.commit()
        test_agent.active_workflow_id = workflow.id
        db.add(ChatHistory(organization_id=org, agent_id=test_agent.id, message="hi", message_type="user"))
        db.add(AgentJiraConfig(agent_id=str(test_agent.id), enabled=True))
        db.add(AgentShopifyConfig(id=str(uuid4()), agent_id=str(test_agent.id), enabled=True))
        db.commit()
        agent_id = test_agent.id

        impact = client.get(f"{BASE}/{agent_id}/removal-impact").json()
        assert impact == {"widgets": 1, "channels": 0, "workflows": 1}

        r = client.delete(f"{BASE}/{agent_id}")

        assert r.status_code == 204, r.text
        db.expire_all()
        assert db.get(Agent, agent_id) is None
        assert db.query(Widget).filter(Widget.agent_id == agent_id).count() == 0
        assert db.query(Workflow).filter(Workflow.agent_id == agent_id).count() == 0
        assert db.query(ChatHistory).filter(ChatHistory.organization_id == org).count() == 1
        assert db.query(AgentJiraConfig).filter(AgentJiraConfig.agent_id == str(agent_id)).count() == 0
        assert db.query(AgentShopifyConfig).filter(AgentShopifyConfig.agent_id == str(agent_id)).count() == 0
        assert db.get(Agent, second_agent.id) is not None

    def test_the_only_agent_is_kept(self, client, db, test_agent):
        r = client.delete(f"{BASE}/{test_agent.id}")

        assert r.status_code == 409
        assert r.json()["detail"] == "This is your only agent. Create another one before deleting it."
        assert db.get(Agent, test_agent.id) is not None

    def test_another_orgs_agent_is_not_found(self, client, db, second_agent):
        other = Agent(id=uuid4(), name="Theirs", agent_type=AgentType.GENERAL, instructions=["x"],
                      organization_id=uuid4())
        db.add(other)
        db.commit()
        assert client.delete(f"{BASE}/{other.id}").status_code == 404
        assert client.get(f"{BASE}/{other.id}/removal-impact").status_code == 404
        assert db.get(Agent, other.id) is not None

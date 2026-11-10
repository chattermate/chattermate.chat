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

What a plan switches on and off while the agent runs: workflows, MCP tools,
lead capture and the ChatterMate branding.
"""

from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock, patch
from uuid import uuid4

import pytest

from app.services import ai_access, feature_gate, lead_capture, widget_bootstrap
from app.services.ai_access import workflow_may_run
from app.services.feature_gate import (
    LEAD_CAPTURE_FEATURE,
    MCP_TOOLS_FEATURE,
    WORKFLOW_FEATURE,
    plan_feature_on,
    plan_hides_branding,
)
from app.services.lead_capture import record_lead_from_response
from app.tools import mcp_manager
from app.tools.mcp_manager import MCPToolsManager


def enterprise_says(monkeypatch, answer):
    """`answer` is the plan's reply, or an exception the lookup raises."""
    rule = MagicMock(side_effect=answer) if isinstance(answer, Exception) else MagicMock(return_value=answer)
    monkeypatch.setattr(feature_gate, "HAS_ENTERPRISE", True)
    monkeypatch.setattr(feature_gate, "feature_on", rule, raising=False)
    return rule


def community_install(monkeypatch):
    monkeypatch.setattr(feature_gate, "HAS_ENTERPRISE", False)
    monkeypatch.setattr(feature_gate, "feature_on", None, raising=False)


class TestPlanFeatureOn:
    def test_community_installs_have_every_feature(self, monkeypatch):
        community_install(monkeypatch)
        assert plan_feature_on(MagicMock(), "org", WORKFLOW_FEATURE) is True

    @pytest.mark.parametrize("answer", [True, False])
    def test_it_asks_the_plan(self, monkeypatch, answer):
        rule = enterprise_says(monkeypatch, answer)
        db = MagicMock()

        assert plan_feature_on(db, "org", WORKFLOW_FEATURE) is answer
        rule.assert_called_once_with(db, "org", WORKFLOW_FEATURE)

    def test_a_failed_lookup_leaves_the_feature_running(self, monkeypatch):
        enterprise_says(monkeypatch, RuntimeError("redis down"))
        assert plan_feature_on(MagicMock(), "org", WORKFLOW_FEATURE) is True


    def test_an_enterprise_module_without_entitlements_still_gates_the_rest(self, monkeypatch):
        """feature_on is imported on its own: missing, it must not switch the
        older gates to community mode."""
        monkeypatch.setattr(feature_gate, "HAS_ENTERPRISE", True)
        monkeypatch.setattr(feature_gate, "feature_on", None, raising=False)
        assert plan_feature_on(MagicMock(), "org", WORKFLOW_FEATURE) is True
        assert feature_gate.HAS_ENTERPRISE is True


class TestPlanHidesBranding:
    def test_community_installs_keep_it(self, monkeypatch):
        community_install(monkeypatch)
        assert plan_hides_branding(MagicMock(), "org") is False

    @pytest.mark.parametrize("answer", [True, False])
    def test_the_plan_decides(self, monkeypatch, answer):
        enterprise_says(monkeypatch, answer)
        assert plan_hides_branding(MagicMock(), "org") is answer

    def test_a_failed_lookup_keeps_it(self, monkeypatch):
        enterprise_says(monkeypatch, RuntimeError("redis down"))
        assert plan_hides_branding(MagicMock(), "org") is False


class TestWorkflowMayRun:
    @pytest.mark.parametrize("ai, feature, expected", [
        (True, True, True),
        (True, False, False),
        (False, True, False),
        (False, False, False),
    ])
    def test_it_needs_the_ai_and_the_feature(self, monkeypatch, ai, feature, expected):
        monkeypatch.setattr(ai_access, "plan_allows_ai", lambda *a, **k: ai)
        monkeypatch.setattr(ai_access, "plan_feature_on", lambda *a, **k: feature)

        assert workflow_may_run(MagicMock(), "org", "CHATTERMATE") is expected


class TestAgentRunsWorkflow:
    @pytest.fixture
    def agent(self):
        return SimpleNamespace(use_workflow=True, active_workflow_id=uuid4(), organization_id=uuid4())

    def test_a_published_workflow_on_a_plan_with_workflows(self, agent, monkeypatch):
        monkeypatch.setattr(widget_bootstrap, "plan_feature_on", lambda *a, **k: True)
        assert widget_bootstrap.agent_runs_workflow(MagicMock(), agent) is True

    def test_the_plan_can_take_it_away(self, agent, monkeypatch):
        monkeypatch.setattr(widget_bootstrap, "plan_feature_on", lambda *a, **k: False)
        assert widget_bootstrap.agent_runs_workflow(MagicMock(), agent) is False

    @pytest.mark.parametrize("use_workflow, workflow_id", [(False, uuid4()), (True, None)])
    def test_no_workflow_never_asks_the_plan(self, monkeypatch, use_workflow, workflow_id):
        asked = MagicMock()
        monkeypatch.setattr(widget_bootstrap, "plan_feature_on", asked)
        agent = SimpleNamespace(use_workflow=use_workflow, active_workflow_id=workflow_id, organization_id=uuid4())

        assert widget_bootstrap.agent_runs_workflow(MagicMock(), agent) is False
        asked.assert_not_called()


class TestLeadCapture:
    @pytest.fixture
    def stored_agent(self, monkeypatch):
        config = SimpleNamespace(enabled=True)
        repo = MagicMock()
        repo.return_value.get_agent.return_value = SimpleNamespace(lead_capture_config=config)
        monkeypatch.setattr("app.repositories.agent.AgentRepository", repo)
        monkeypatch.setattr(lead_capture, "has_captured_lead", lambda *a: False)
        return config

    def record(self, monkeypatch, plan_allows):
        monkeypatch.setattr(lead_capture, "plan_feature_on", MagicMock(return_value=plan_allows))
        recorded = MagicMock()
        monkeypatch.setattr(lead_capture, "record_lead_capture", recorded)
        response = SimpleNamespace(request_lead_capture=True, lead_email="a@b.co", lead_consent=True)
        record_lead_from_response(MagicMock(), response, "org", "agent", "customer", "session", scope=None)
        return recorded

    def test_a_plan_without_it_stores_no_lead(self, stored_agent, monkeypatch):
        self.record(monkeypatch, False).assert_not_called()
        lead_capture.plan_feature_on.assert_called_once()
        assert lead_capture.plan_feature_on.call_args.args[2] == LEAD_CAPTURE_FEATURE

    def test_a_plan_with_it_stores_the_lead(self, stored_agent, monkeypatch):
        self.record(monkeypatch, True).assert_called_once()


@pytest.mark.asyncio
class TestMcpTools:
    async def run(self, monkeypatch, allowed):
        monkeypatch.setattr("app.tools.mcp_manager.plan_feature_on", MagicMock(return_value=allowed))
        manager = MCPToolsManager()
        connect = AsyncMock(return_value=["tool"])
        monkeypatch.setattr(manager, "_initialize_from_configs", connect)
        with patch("app.tools.mcp_manager.SessionLocal"), \
             patch("app.tools.mcp_manager.MCPToolRepository") as repo:
            tools = await manager.initialize_mcp_tools("agent", "org")
        return tools, connect, repo

    async def test_a_plan_without_them_connects_nothing(self, monkeypatch):
        tools, connect, repo = await self.run(monkeypatch, False)

        assert tools == []
        connect.assert_not_awaited()
        repo.assert_not_called()

    async def test_a_plan_with_them_connects(self, monkeypatch):
        tools, connect, _ = await self.run(monkeypatch, True)

        assert tools == ["tool"]
        connect.assert_awaited_once()

    async def test_the_ticket_investigator_is_held_to_the_plan_too(self, monkeypatch):
        monkeypatch.setattr("app.tools.mcp_manager.plan_feature_on", MagicMock(return_value=False))
        with patch("app.tools.mcp_manager.SessionLocal"), \
             patch("app.tools.mcp_manager.MCPToolRepository") as repo:
            tools = await MCPToolsManager().initialize_mcp_tools_by_ids("org", [1])

        assert tools == []
        repo.assert_not_called()

    async def test_it_asks_about_this_org_and_this_feature(self, monkeypatch):
        await self.run(monkeypatch, True)

        assert mcp_manager.plan_feature_on.call_args.args[1:] == ("org", MCP_TOOLS_FEATURE)

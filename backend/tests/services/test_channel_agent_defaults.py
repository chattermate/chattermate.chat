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

from unittest.mock import patch

import pytest

from app.models.agent import AgentType
from app.repositories.agent import AgentRepository
from app.repositories.channels import AgentChannelConfigRepository, ChannelAccountRepository
from app.services.channel_agent_defaults import assign_sole_agent


@pytest.fixture
def account(db, test_organization):
    return ChannelAccountRepository(db).create_account(
        organization_id=test_organization.id,
        channel_type="messenger",
        external_account_id="page-1",
        credentials={"page_access_token": "tok"},
        display_name="Shop Page",
    )


def _add_agent(db, organization, name):
    agent = AgentRepository(db).create_agent(
        name=name,
        agent_type=AgentType.CUSTOMER_SUPPORT,
        instructions=["Help"],
        org_id=organization.id,
    )
    return agent


class TestAssignSoleAgent:
    def test_routes_to_the_only_agent(self, db, account, test_agent):
        config = assign_sole_agent(db, account)

        assert config is not None
        assert AgentChannelConfigRepository(db).get_active_agent_id(account.id) == test_agent.id

    def test_several_agents_leave_the_choice_to_the_customer(self, db, account, test_agent, test_organization):
        _add_agent(db, test_organization, "Sales")

        assert assign_sole_agent(db, account) is None
        assert AgentChannelConfigRepository(db).get_by_account(account.id) is None

    def test_no_agents_assigns_nothing(self, db, account):
        assert assign_sole_agent(db, account) is None
        assert AgentChannelConfigRepository(db).get_by_account(account.id) is None

    def test_existing_routing_is_kept_even_when_paused(self, db, account, test_agent, test_organization):
        other = _add_agent(db, test_organization, "Sales")
        AgentChannelConfigRepository(db).set_agent(account.id, other.id, is_active=False)

        assert assign_sole_agent(db, account) is None
        config = AgentChannelConfigRepository(db).get_by_account(account.id)
        assert config.agent_id == other.id and config.is_active is False

    def test_a_failed_save_does_not_fail_the_connect(self, db, account, test_agent):
        with patch.object(AgentChannelConfigRepository, "set_agent", side_effect=RuntimeError("db down")):
            assert assign_sole_agent(db, account) is None

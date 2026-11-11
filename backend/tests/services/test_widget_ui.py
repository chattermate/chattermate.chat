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

from types import SimpleNamespace
from unittest.mock import MagicMock, patch
from uuid import uuid4

import pytest
from pydantic import ValidationError

from app.api.widget import _visitor_customization
from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.agent import Agent, AgentCustomization, AgentType, ChatStyle, WidgetPosition
from app.repositories.agent import AgentRepository
from app.models.schemas.agent_customization import CustomizationCreate
from app.services import widget_bootstrap, widget_ui


def _create(metadata):
    return CustomizationCreate(customization_metadata=metadata)


class TestWidgetUiValidation:
    @pytest.mark.parametrize("version", [1, 2])
    def test_both_designs_are_accepted(self, version):
        assert _create({"widget_ui": {"version": version}}).customization_metadata["widget_ui"] == {"version": version}

    @pytest.mark.parametrize("version", [0, 3, "2", None, True, 2.0, 1.5])
    def test_other_versions_are_refused(self, version):
        if version is None:
            # An explicit null on the key clears it, like the other structured keys.
            assert _create({"widget_ui": None}).customization_metadata == {"widget_ui": None}
            return
        with pytest.raises(ValidationError):
            _create({"widget_ui": {"version": version}})

    def test_unknown_keys_are_dropped(self):
        result = _create({"widget_ui": {"version": 2, "theme": "x"}})
        assert result.customization_metadata["widget_ui"] == {"version": 2}

    def test_empty_object_means_classic(self):
        assert _create({"widget_ui": {}}).customization_metadata["widget_ui"] == {"version": 1}


class TestServedDesign:
    def test_the_agents_choice_is_served_while_the_redesign_is_on(self):
        with patch.object(widget_ui.settings, "WIDGET_UI_V2_ENABLED", True):
            assert widget_ui.served_metadata({"widget_ui": {"version": 2}}) == {"widget_ui": {"version": 2}}

    def test_the_kill_switch_serves_the_classic_widget(self):
        stored = {"widget_ui": {"version": 2}, "avatar_style": "orb"}
        with patch.object(widget_ui.settings, "WIDGET_UI_V2_ENABLED", False):
            served = widget_ui.served_metadata(stored)
        assert served == {"widget_ui": {"version": 1}, "avatar_style": "orb"}
        # The agent's stored choice is untouched, for when the switch goes back on.
        assert stored["widget_ui"] == {"version": 2}

    def test_metadata_without_a_choice_is_left_alone(self):
        with patch.object(widget_ui.settings, "WIDGET_UI_V2_ENABLED", False):
            assert widget_ui.served_metadata({"avatar_style": "orb"}) == {"avatar_style": "orb"}

    def test_visitors_get_the_launcher_check_then_the_design_switch(self):
        with patch("app.services.widget_ui.launcher.for_visitors",
                   return_value=({"widget_ui": {"version": 2}}, "https://logo")) as launcher_check, \
                patch.object(widget_ui.settings, "WIDGET_UI_V2_ENABLED", False):
            metadata, logo = widget_ui.for_visitors(MagicMock(), MagicMock())
        launcher_check.assert_called_once()
        assert metadata == {"widget_ui": {"version": 1}}
        assert logo == "https://logo"


class TestStoredChoiceOnSave:
    def test_a_save_without_the_key_keeps_the_stored_choice(self):
        stored = {"widget_ui": {"version": 2}, "launcher": {"size": "md"}}
        incoming = {"widget_display": {"mode": "launcher"}}
        assert widget_ui.keep_stored_choice(stored, incoming) == {
            "widget_display": {"mode": "launcher"}, "widget_ui": {"version": 2}}

    def test_an_explicit_choice_replaces_the_stored_one(self):
        stored = {"widget_ui": {"version": 2}}
        assert widget_ui.keep_stored_choice(stored, {"widget_ui": {"version": 1}}) == {"widget_ui": {"version": 1}}

    @pytest.mark.parametrize("stored", [None, {}, {"launcher": {"size": "md"}}])
    def test_nothing_to_keep(self, stored):
        assert widget_ui.keep_stored_choice(stored, {"avatar_style": "orb"}) == {"avatar_style": "orb"}

    def test_a_null_metadata_still_clears_a_legacy_agents_choice(self):
        # Old behaviour, kept for agents made before the redesign: null replaces the
        # whole dict. ({} keeps the choice, like any save that leaves the key out.)
        assert widget_ui.keep_stored_choice({"widget_ui": {"version": 2}}, None) is None
        assert widget_ui.keep_stored_choice({"widget_ui": {"version": 2}}, {}) == {"widget_ui": {"version": 2}}


class TestAgentsCreatedOnTheRedesign:
    """created_on_ui is the server's: no client sets it, and an agent that has it
    never goes back to the classic widget."""

    STORED = {"widget_ui": {"version": 2, "created_on_ui": 2}, "launcher": {"size": "md"}}

    def test_a_client_cannot_send_the_mark(self):
        metadata = CustomizationCreate(customization_metadata={"widget_ui": {"version": 2, "created_on_ui": 2}})
        assert metadata.customization_metadata["widget_ui"] == {"version": 2}

    @pytest.mark.parametrize("incoming,kept", [
        ({"avatar_style": "orb"}, {"avatar_style": "orb", "widget_ui": {"version": 2, "created_on_ui": 2}}),
        ({"widget_ui": {"version": 2}}, {"widget_ui": {"version": 2, "created_on_ui": 2}}),
        ({}, {"widget_ui": {"version": 2, "created_on_ui": 2}}),
        (None, {"widget_ui": {"version": 2, "created_on_ui": 2}}),
    ])
    def test_every_save_keeps_the_mark(self, incoming, kept):
        assert widget_ui.keep_stored_choice(self.STORED, incoming) == kept

    @pytest.mark.parametrize("choice", [{"version": 1}, {}, None])
    def test_going_back_to_classic_is_refused(self, choice):
        with pytest.raises(HTTPException) as refused:
            widget_ui.keep_stored_choice(self.STORED, {"widget_ui": choice})
        assert refused.value.status_code == 400
        assert refused.value.detail == widget_ui.STAYS_ON_REDESIGN

    def test_the_kill_switch_still_serves_them_the_classic_widget(self):
        with patch.object(widget_ui.settings, "WIDGET_UI_V2_ENABLED", False):
            assert widget_ui.served_metadata(self.STORED)["widget_ui"] == {"version": 1}
        assert self.STORED["widget_ui"] == {"version": 2, "created_on_ui": 2}


class TestNewAgentRows:
    """Every creation path goes through AgentRepository.create_agent; the first
    customization row its caller inserts in that session is stamped."""

    def _agent(self, db):
        return AgentRepository(db).create_agent(
            name="New", display_name="New", description="d", agent_type=AgentType.CUSTOMER_SUPPORT,
            instructions=["i"], is_active=True, organization_id=uuid4())

    def test_a_caller_that_makes_its_own_row_gets_one_row_on_the_redesign(self, db):
        agent = self._agent(db)
        db.add(AgentCustomization(agent_id=agent.id, accent_color="#f34611", chat_style=ChatStyle.CHATBOT))
        db.flush()
        rows = db.query(AgentCustomization).filter(AgentCustomization.agent_id == agent.id).all()
        assert len(rows) == 1
        assert rows[0].customization_metadata == {"widget_ui": {"version": 2, "created_on_ui": 2}}
        assert rows[0].accent_color == "#f34611"

    def test_only_the_new_agents_first_row_in_that_session(self, db):
        agent = self._agent(db)
        other = AgentCustomization(agent_id=uuid4(), customization_metadata={"launcher": {"size": "lg"}})
        db.add(other)
        db.flush()
        assert other.customization_metadata == {"launcher": {"size": "lg"}}
        first = AgentCustomization(agent_id=agent.id, customization_metadata={"launcher": {"size": "lg"}})
        db.add(first)
        db.flush()
        assert first.customization_metadata == {"launcher": {"size": "lg"}, "widget_ui": {"version": 2, "created_on_ui": 2}}

    def test_two_agents_created_in_one_session_are_both_stamped(self, db):
        agents = [self._agent(db), AgentRepository(db).create_agent(
            name="Second", display_name="Second", description="d", agent_type=AgentType.CUSTOMER_SUPPORT,
            instructions=["i"], is_active=True, organization_id=uuid4())]
        rows = [AgentCustomization(agent_id=agent.id, customization_metadata={}) for agent in agents]
        db.add_all(rows)
        db.flush()
        assert [row.customization_metadata for row in rows] == [{"widget_ui": {"version": 2, "created_on_ui": 2}}] * 2

    def test_a_second_row_for_the_same_agent_is_not_stamped(self, db):
        agent = self._agent(db)
        db.add(AgentCustomization(agent_id=agent.id, customization_metadata={}))
        db.flush()
        second = AgentCustomization(agent_id=agent.id, customization_metadata={})
        db.add(second)
        db.flush()
        assert second.customization_metadata == {}

    def test_a_failed_insert_retried_in_the_session_is_still_stamped(self, db):
        taken = AgentCustomization(agent_id=uuid4(), customization_metadata={})
        db.add(taken)
        db.commit()
        agent = self._agent(db)
        # Its id is taken, so the insert fails.
        db.add(AgentCustomization(id=taken.id, agent_id=agent.id, customization_metadata={}))
        with pytest.raises(IntegrityError):
            db.flush()
        db.rollback()
        retried = AgentCustomization(agent_id=agent.id, customization_metadata={})
        db.add(retried)
        db.flush()
        assert retried.customization_metadata == {"widget_ui": {"version": 2, "created_on_ui": 2}}

    def test_a_fresh_session_does_not_stamp_an_agents_first_row(self, db):
        agent = self._agent(db)
        db.commit()
        fresh = Session(bind=db.get_bind())
        try:
            row = AgentCustomization(agent_id=agent.id, customization_metadata={})
            fresh.add(row)
            fresh.flush()
            assert row.customization_metadata == {}
        finally:
            fresh.rollback()
            fresh.close()

    def test_an_agent_made_some_other_way_is_not_stamped(self, db):
        agent = Agent(id=uuid4(), name="Old", display_name="Old", description="d",
                      agent_type=AgentType.CUSTOMER_SUPPORT, instructions=["i"], organization_id=uuid4())
        db.add(agent)
        db.commit()
        row = AgentCustomization(agent_id=agent.id, customization_metadata={})
        db.add(row)
        db.flush()
        assert row.customization_metadata == {}


class TestBothVisitorRoutesServeTheSwitch:
    """The widget boots from one route and re-applies the other's answer, so both
    must serve the same design."""

    def _agent(self):
        customization = AgentCustomization(
            chat_style=ChatStyle.CHATBOT,
            widget_position=WidgetPosition.FLOATING,
            customization_metadata={"widget_ui": {"version": 2}},
        )
        return SimpleNamespace(customization=customization, organization_id=uuid4(), ai_replies_enabled=True)

    @pytest.mark.parametrize("enabled,version", [(True, 2), (False, 1)])
    def test_get_route(self, enabled, version):
        with patch.object(widget_ui.settings, "WIDGET_UI_V2_ENABLED", enabled), \
                patch("app.services.launcher.settings.S3_FILE_STORAGE", False):
            served = _visitor_customization(MagicMock(), self._agent()).model_dump()
        assert served["customization_metadata"]["widget_ui"] == {"version": version}

    @pytest.mark.asyncio
    @pytest.mark.parametrize("enabled,version", [(True, 2), (False, 1)])
    async def test_bootstrap(self, enabled, version):
        with patch.object(widget_ui.settings, "WIDGET_UI_V2_ENABLED", enabled), \
                patch("app.services.launcher.settings.S3_FILE_STORAGE", False):
            served = await widget_bootstrap._customization(MagicMock(), self._agent())
        assert served["customization_metadata"]["widget_ui"] == {"version": version}


class TestServesRedesign:
    @pytest.mark.parametrize("customization,expected", [
        ({"customization_metadata": {"widget_ui": {"version": 2}}}, True),
        ({"customization_metadata": {"widget_ui": {"version": 1}}}, False),
        ({"customization_metadata": {}}, False),
        ({"customization_metadata": None}, False),
        ({}, False),
        (None, False),
    ])
    def test_only_version_two(self, customization, expected):
        assert widget_ui.serves_redesign(customization) is expected

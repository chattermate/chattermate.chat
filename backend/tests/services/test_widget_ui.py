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
from app.models.agent import AgentCustomization, ChatStyle, WidgetPosition
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

    def test_a_save_without_metadata_is_left_alone(self):
        assert widget_ui.keep_stored_choice({"widget_ui": {"version": 2}}, None) is None


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

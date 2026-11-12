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

Every visitor gets the redesigned widget, whatever an agent stored.
"""

from types import SimpleNamespace
from unittest.mock import MagicMock, patch
from uuid import uuid4

import pytest

from app.api.widget import _visitor_customization
from app.models.agent import AgentCustomization, ChatStyle, WidgetPosition
from app.services import widget_bootstrap, widget_ui

REDESIGN = {"version": 2}


class TestServedDesign:
    @pytest.mark.parametrize("stored", [
        {}, {"widget_ui": {"version": 1}}, {"widget_ui": {"version": 2, "created_on_ui": 2}}, {"widget_ui": None},
    ])
    def test_always_the_redesign(self, stored):
        assert widget_ui.served_metadata({**stored, "avatar_style": "orb"}) == {
            "avatar_style": "orb", "widget_ui": REDESIGN}

    def test_no_metadata(self):
        assert widget_ui.served_metadata(None) == {"widget_ui": REDESIGN}

    def test_the_stored_dict_is_not_changed(self):
        stored = {"widget_ui": {"version": 1}}
        widget_ui.served_metadata(stored)
        assert stored == {"widget_ui": {"version": 1}}

    def test_visitors_get_the_launcher_check_then_the_design(self):
        with patch("app.services.widget_ui.launcher.for_visitors",
                   return_value=({"widget_ui": {"version": 1}}, "https://logo")) as launcher_check:
            metadata, logo = widget_ui.for_visitors(MagicMock(), MagicMock())
        launcher_check.assert_called_once()
        assert metadata == {"widget_ui": REDESIGN}
        assert logo == "https://logo"


class TestBothVisitorRoutesServeTheRedesign:
    """The widget boots from one route and re-applies the other's answer, so both
    must serve the same design."""

    def _agent(self, metadata):
        customization = AgentCustomization(
            chat_style=ChatStyle.CHATBOT,
            widget_position=WidgetPosition.FLOATING,
            customization_metadata=metadata,
        )
        return SimpleNamespace(customization=customization, organization_id=uuid4(), ai_replies_enabled=True)

    @pytest.mark.parametrize("metadata", [{"widget_ui": {"version": 1}}, {}])
    def test_get_route(self, metadata):
        with patch("app.services.launcher.settings.S3_FILE_STORAGE", False):
            served = _visitor_customization(MagicMock(), self._agent(metadata)).model_dump()
        assert served["customization_metadata"]["widget_ui"] == REDESIGN

    @pytest.mark.asyncio
    @pytest.mark.parametrize("metadata", [{"widget_ui": {"version": 1}}, {}])
    async def test_bootstrap(self, metadata):
        with patch("app.services.launcher.settings.S3_FILE_STORAGE", False):
            served = await widget_bootstrap._customization(MagicMock(), self._agent(metadata))
        assert served["customization_metadata"]["widget_ui"] == REDESIGN

    @pytest.mark.asyncio
    async def test_an_agent_with_no_customization_row(self):
        served = await widget_bootstrap._customization(MagicMock(), SimpleNamespace(customization=None))
        assert served["customization_metadata"]["widget_ui"] == REDESIGN

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
from fastapi import HTTPException
from pydantic import ValidationError

from app.api.widget import _visitor_customization
from app.api.widget_frame import launcher_logo
from app.core.brand import BRAND_COLORS
from app.models.agent import AgentCustomization
from app.models.schemas.agent_customization import (
    ChatStyle,
    CustomizationCreate,
    CustomizationResponse,
    WidgetPosition,
)
from app.services import launcher, widget_bootstrap


@pytest.fixture(autouse=True)
def _empty_caches():
    launcher._signed_url_cache.clear()


def _agent(metadata, icon_url=None):
    customization = SimpleNamespace(customization_metadata=metadata, icon_url=icon_url)
    return SimpleNamespace(customization=customization, organization_id=uuid4())


class TestLauncherSchema:
    def _launcher(self, value):
        return CustomizationCreate(customization_metadata={"launcher": value}).customization_metadata["launcher"]

    def test_valid_values_are_kept_as_plain_strings(self):
        value = {"icon": "chat", "size": "sm", "shape": "circle", "animation": "bounce", "background": "white"}
        assert self._launcher(value) == value

    @pytest.mark.parametrize("key,value", [
        ("icon", "wave"), ("size", "xl"), ("shape", "rounded"), ("animation", "orbit"), ("background", "red"),
        ("icon", "x;}body{display:none"),
    ])
    def test_unknown_values_are_refused(self, key, value):
        with pytest.raises(ValidationError):
            self._launcher({key: value})

    def test_unknown_keys_are_dropped_and_unset_keys_not_stored(self):
        assert self._launcher({"size": "md", "evil": "x"}) == {"size": "md"}

    def test_null_clears(self):
        assert CustomizationCreate(customization_metadata={"launcher": None}).customization_metadata == {"launcher": None}

    def test_validated_without_widget_display_and_alongside_it(self):
        with pytest.raises(ValidationError):
            CustomizationCreate(customization_metadata={"launcher": {"size": "xl"}})
        with pytest.raises(ValidationError):
            CustomizationCreate(customization_metadata={"widget_display": {"mode": "floating"}, "launcher": {"size": "xl"}})
        with pytest.raises(ValidationError):
            CustomizationCreate(customization_metadata={"widget_display": {"width": 1}, "launcher": {"size": "md"}})

    def test_free_form_keys_untouched(self):
        assert CustomizationCreate(customization_metadata={"avatar_style": "orb"}).customization_metadata == {"avatar_style": "orb"}

    def test_a_posted_logo_url_is_ignored(self):
        posted = CustomizationCreate(icon_url="https://evil.example/x.png")
        assert "icon_url" not in posted.model_dump()
        assert not hasattr(posted, "icon_url")

    def test_response_still_carries_the_logo(self):
        response = CustomizationResponse(id=1, agent_id=uuid4(), icon_url="/api/v1/uploads/agents/x/a.webp")
        assert response.model_dump()["icon_url"] == "/api/v1/uploads/agents/x/a.webp"


class TestAddsPaidOptions:
    @pytest.mark.parametrize("stored,incoming,expected", [
        ({}, {"size": "sm", "icon": "chat", "animation": "bounce"}, False),
        ({}, {"icon": "logo"}, True),
        ({}, {"animation": "swoosh"}, True),
        ({"animation": "glow"}, {"animation": "swoosh"}, True),
        ({"icon": "logo", "animation": "glow"}, {"icon": "logo", "animation": "glow", "size": "sm"}, False),
        ({"icon": "logo"}, {"icon": "chat"}, False),
        (None, None, False),
    ])
    def test_cases(self, stored, incoming, expected):
        assert launcher.adds_paid_options(stored, incoming) is expected


class TestCheckMetadataWrite:
    def test_new_paid_option_needs_the_plan(self):
        refused = HTTPException(status_code=403, detail=launcher.UPGRADE_MESSAGE)
        with patch("app.services.launcher.check_feature_access", side_effect=refused) as gate:
            with pytest.raises(HTTPException) as raised:
                launcher.check_metadata_write(MagicMock(), uuid4(), {}, {"launcher": {"animation": "glow"}})
        assert raised.value.status_code == 403
        assert gate.call_args.args[2] == "custom_branding"

    def test_downgraded_org_can_save_with_unchanged_paid_values(self):
        stored = {"launcher": {"icon": "logo", "animation": "swoosh"}}
        incoming = {"launcher": {"icon": "logo", "animation": "swoosh", "size": "sm"}, "avatar_style": "orb"}
        with patch("app.services.launcher.check_feature_access") as gate:
            result = launcher.check_metadata_write(MagicMock(), uuid4(), stored, incoming)
        gate.assert_not_called()
        assert result["launcher"]["size"] == "sm"
        assert result["avatar_style"] == "orb"

    def test_saves_without_a_launcher_skip_the_check(self):
        with patch("app.services.launcher.check_feature_access") as gate:
            assert launcher.check_metadata_write(MagicMock(), uuid4(), {}, {"avatar_style": "orb"}) == {"avatar_style": "orb"}
            assert launcher.check_metadata_write(MagicMock(), uuid4(), {}, None) is None
        gate.assert_not_called()

    @pytest.mark.parametrize("incoming", [{"avatar_style": "orb"}, {}])
    def test_a_save_that_leaves_the_launcher_out_keeps_the_stored_one(self, incoming):
        stored = {"launcher": {"size": "md", "logo_transparent": True}}
        with patch("app.services.launcher.check_feature_access") as gate:
            result = launcher.check_metadata_write(MagicMock(), uuid4(), stored, incoming)
        gate.assert_not_called()
        assert result == {**incoming, "launcher": {"size": "md", "logo_transparent": True}}

    def test_an_explicit_null_still_clears_the_launcher(self):
        stored = {"launcher": {"size": "md"}}
        assert launcher.check_metadata_write(MagicMock(), uuid4(), stored, {"launcher": None}) == {"launcher": None}
        assert launcher.check_metadata_write(MagicMock(), uuid4(), stored, None) is None

    def test_logo_transparent_comes_from_the_store_not_the_form(self):
        stored = {"launcher": {"logo_transparent": False}}
        result = launcher.check_metadata_write(MagicMock(), uuid4(), stored, {"launcher": {"logo_transparent": True}})
        assert result["launcher"]["logo_transparent"] is False
        result = launcher.check_metadata_write(MagicMock(), uuid4(), {}, {"launcher": {"logo_transparent": True, "size": "sm"}})
        assert "logo_transparent" not in result["launcher"]


class TestForVisitors:
    def test_free_options_skip_the_plan_lookup(self):
        agent = _agent({"launcher": {"icon": "chat", "size": "sm"}}, icon_url="https://b.s3.amazonaws.com/a.webp")
        with patch("app.services.launcher.plan_feature_on") as allowed:
            metadata, logo = launcher.for_visitors(MagicMock(), agent)
        allowed.assert_not_called()
        assert metadata["launcher"] == {"icon": "chat", "size": "sm"}
        assert logo is None

    def test_no_launcher_saved(self):
        metadata, logo = launcher.for_visitors(MagicMock(), _agent(None))
        assert metadata == {} and logo is None

    def test_lapsed_plan_falls_back_without_touching_the_stored_choice(self):
        stored = {"launcher": {"icon": "logo", "animation": "swoosh", "background": "none", "size": "sm"}, "widget_display": {"side": "left"}}
        agent = _agent(stored, icon_url="/api/v1/uploads/agents/x/a.webp")
        with patch("app.services.launcher.plan_feature_on", return_value=False):
            metadata, logo = launcher.for_visitors(MagicMock(), agent)
        assert logo is None
        assert metadata["launcher"]["icon"] == "dots"
        assert metadata["launcher"]["animation"] == "classic"
        assert metadata["launcher"]["size"] == "sm"
        assert metadata["widget_display"] == {"side": "left"}
        assert agent.customization.customization_metadata["launcher"]["icon"] == "logo"
        assert agent.customization.customization_metadata["launcher"]["animation"] == "swoosh"

    def test_paid_org_gets_an_absolute_url_on_local_storage(self):
        agent = _agent({"launcher": {"icon": "logo"}}, icon_url="/api/v1/uploads/agents/x/a.webp")
        with patch("app.services.launcher.plan_feature_on", return_value=True), \
                patch("app.services.launcher.settings.S3_FILE_STORAGE", False), \
                patch("app.services.help_center_images.settings.BACKEND_URL", "http://localhost:8000/"):
            _, logo = launcher.for_visitors(MagicMock(), agent)
        assert logo == "http://localhost:8000/api/v1/uploads/agents/x/a.webp"

    def test_signed_url_is_reused_so_browsers_can_cache_the_image(self):
        agent = _agent({"launcher": {"icon": "logo"}}, icon_url="https://b.s3.amazonaws.com/a.webp")
        with patch("app.services.launcher.plan_feature_on", return_value=True), \
                patch("app.services.launcher.settings.S3_FILE_STORAGE", True), \
                patch("app.services.launcher.sign_s3_url", side_effect=["signed-1", "signed-2"]) as sign:
            first = launcher.for_visitors(MagicMock(), agent)[1]
            second = launcher.for_visitors(MagicMock(), agent)[1]
        assert first == second == "signed-1"
        assert sign.call_count == 1

    def test_logo_chosen_but_file_gone_shows_dots(self):
        agent = _agent({"launcher": {"icon": "logo", "animation": "glow"}})
        with patch("app.services.launcher.plan_feature_on", return_value=True):
            metadata, logo = launcher.for_visitors(MagicMock(), agent)
        assert logo is None
        assert metadata["launcher"] == {"icon": "dots", "animation": "glow"}

    def test_paid_animation_alone_serves_no_logo(self):
        agent = _agent({"launcher": {"icon": "chat", "animation": "swoosh"}}, icon_url="https://b.s3.amazonaws.com/a.webp")
        with patch("app.services.launcher.plan_feature_on", return_value=True):
            metadata, logo = launcher.for_visitors(MagicMock(), agent)
        assert metadata["launcher"]["animation"] == "swoosh"
        assert logo is None

    def test_asks_the_plan_about_custom_branding(self):
        agent = _agent({"launcher": {"animation": "glow"}})
        with patch("app.services.launcher.plan_feature_on", return_value=True) as plan:
            launcher.for_visitors(MagicMock(), agent)
        assert plan.call_args.args[1:] == (agent.organization_id, "custom_branding")

    def test_uncustomized_agents_start_medium(self):
        assert launcher.uncustomized_defaults() == {"customization_metadata": {"launcher": {"size": "md"}}}


class TestBothVisitorRoutesAreGated:
    """The widget boots from one route and re-applies the other's answer, so a
    logo that slips through either one reaches the page."""

    def _agent(self):
        customization = AgentCustomization(
            icon_url="/api/v1/uploads/agents/x/a.webp",
            chat_style=ChatStyle.CHATBOT,
            widget_position=WidgetPosition.FLOATING,
            customization_metadata={"launcher": {"icon": "logo", "animation": "glow"}},
        )
        return SimpleNamespace(customization=customization, organization_id=uuid4(), ai_replies_enabled=True)

    @pytest.mark.parametrize("allowed,icon,animation", [(True, "logo", "glow"), (False, "dots", "classic")])
    def test_get_route(self, allowed, icon, animation):
        with patch("app.services.launcher.plan_feature_on", return_value=allowed), \
                patch("app.services.launcher.settings.S3_FILE_STORAGE", False):
            served = _visitor_customization(MagicMock(), self._agent())
        body = served.model_dump()
        assert body["customization_metadata"]["launcher"]["icon"] == icon
        assert body["customization_metadata"]["launcher"]["animation"] == animation
        assert bool(body["launcher_logo_url"]) is allowed
        assert "icon_url" not in body

    @pytest.mark.asyncio
    @pytest.mark.parametrize("allowed,icon,animation", [(True, "logo", "glow"), (False, "dots", "classic")])
    async def test_bootstrap(self, allowed, icon, animation):
        with patch("app.services.launcher.plan_feature_on", return_value=allowed), \
                patch("app.services.launcher.settings.S3_FILE_STORAGE", False):
            served = await widget_bootstrap._customization(MagicMock(), self._agent())
        assert served["customization_metadata"]["launcher"]["icon"] == icon
        assert served["customization_metadata"]["launcher"]["animation"] == animation
        assert bool(served["launcher_logo_url"]) is allowed
        assert "icon_url" not in served

    @pytest.mark.asyncio
    async def test_an_agent_with_no_customization(self):
        agent = SimpleNamespace(customization=None)
        defaults = launcher.uncustomized_defaults()
        # Plus the design every visitor gets (services/widget_ui.py)
        defaults['customization_metadata'] = {**defaults['customization_metadata'], 'widget_ui': {'version': 2}}
        assert await widget_bootstrap._customization(MagicMock(), agent) == defaults
        assert _visitor_customization(MagicMock(), agent) is None


class TestLogoRedirect:
    """The embed loader's image loads this route, never an address sent to the page."""

    def _serve(self, agent, allowed=True, widget=True):
        repo = MagicMock()
        repo.get_widget.return_value = SimpleNamespace(id="w") if widget else None
        repo.get_widget_agent.return_value = agent
        with patch("app.api.widget_frame.WidgetRepository", return_value=repo), \
                patch("app.services.launcher.plan_feature_on", return_value=allowed), \
                patch("app.services.launcher.settings.S3_FILE_STORAGE", False):
            return launcher_logo("w", MagicMock())

    def test_redirects_to_the_current_logo_with_a_short_cache(self):
        response = self._serve(TestBothVisitorRoutesAreGated()._agent())
        assert response.status_code == 302
        assert response.headers["location"].endswith("/api/v1/uploads/agents/x/a.webp")
        assert response.headers["cache-control"] == f"public, max-age={launcher.LOGO_REDIRECT_MAX_AGE}"
        assert launcher.LOGO_REDIRECT_MAX_AGE < launcher.SIGNED_URL_CACHE_SECONDS

    @pytest.mark.parametrize("case", ["no plan", "no widget", "no agent", "no customization"])
    def test_nothing_to_serve_is_a_404(self, case):
        agent = TestBothVisitorRoutesAreGated()._agent()
        kwargs = {
            "no plan": dict(agent=agent, allowed=False),
            "no widget": dict(agent=agent, widget=False),
            "no agent": dict(agent=None),
            "no customization": dict(agent=SimpleNamespace(customization=None)),
        }[case]
        with pytest.raises(HTTPException) as refused:
            self._serve(**kwargs)
        assert refused.value.status_code == 404


class TestDefaultLauncherColour:
    def test_new_customizations_take_the_logo_ink(self):
        assert CustomizationCreate().chat_bubble_color == BRAND_COLORS["ink"]
        assert AgentCustomization.__table__.c.chat_bubble_color.default.arg == BRAND_COLORS["ink"]

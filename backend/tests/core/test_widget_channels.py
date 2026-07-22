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

import pytest

from app.channels.constants import WIDGET_CHANNELS, is_widget_channel


class TestIsWidgetChannel:
    @pytest.mark.parametrize("channel", ["web", "shopify"])
    def test_our_own_widget_surfaces(self, channel):
        assert is_widget_channel(channel) is True

    @pytest.mark.parametrize("channel", [None, ""])
    def test_absent_channel_means_the_widget(self, channel):
        """Sessions predating the column, and anything that omits it."""
        assert is_widget_channel(channel) is True

    @pytest.mark.parametrize(
        "channel",
        ["telegram", "whatsapp", "messenger", "instagram", "slack", "email", "sms", "line"],
    )
    def test_external_platforms_are_not_the_widget(self, channel):
        assert is_widget_channel(channel) is False

    def test_shopify_is_a_widget_channel(self):
        """The whole point: labelling Shopify separately must not cost it the
        widget features that 'web' gets — the rating prompt above all."""
        assert "shopify" in WIDGET_CHANNELS
        assert is_widget_channel("shopify") is True

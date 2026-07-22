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

import pytest

from app.api.widget_chat import restamp_widget_channel


def session(channel):
    return SimpleNamespace(channel=channel)


class TestRestampWidgetChannel:
    def test_relabels_a_session_that_predates_the_store_connection(self):
        """The reported bug: widget sessions are reused across visits, so a
        conversation opened before the store was connected kept 'web' forever."""
        s = session("web")
        assert restamp_widget_channel(s, "shopify") is True
        assert s.channel == "shopify"

    def test_relabels_back_when_the_store_is_disconnected(self):
        s = session("shopify")
        assert restamp_widget_channel(s, "web") is True
        assert s.channel == "web"

    @pytest.mark.parametrize("channel", ["web", "shopify"])
    def test_no_write_when_already_correct(self, channel):
        s = session(channel)
        assert restamp_widget_channel(s, channel) is False
        assert s.channel == channel

    @pytest.mark.parametrize("channel", ["whatsapp", "telegram", "messenger", "email"])
    def test_never_touches_an_external_channel(self, channel):
        """`channel` is the outbound routing key. Relabelling a WhatsApp session
        from the widget's connect handler would misroute its replies."""
        s = session(channel)
        assert restamp_widget_channel(s, "shopify") is False
        assert s.channel == channel

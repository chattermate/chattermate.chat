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

"""The page the visitor is on reaches the agent's instructions with their message."""

from unittest.mock import AsyncMock, patch

import pytest

from app.api import widget_chat
from tests.api.test_widget_ai_off import chat, plan_says, sio  # noqa: F401 (fixtures)


async def send(data):
    with patch("app.services.widget_reply.ChatAgent.create_async", AsyncMock()) as create_async:
        await widget_chat.handle_widget_chat("sid", data)
    return create_async


@pytest.mark.asyncio
class TestPageContext:
    @pytest.fixture(autouse=True)
    def ai_on(self, chat, monkeypatch):  # noqa: F811
        plan_says(monkeypatch, True)

    async def test_the_agent_is_told_the_page(self, sio):  # noqa: F811
        create_async = await send({"message": "Is this in stock?", "page": {
            "url": "https://shop.example.com/products/blue-hoodie", "title": "Blue Hoodie"}})

        context = create_async.await_args.kwargs["extra_context"]
        assert "Title: Blue Hoodie\nURL: https://shop.example.com/products/blue-hoodie" in context
        assert "Product handle: blue-hoodie" in context

    async def test_a_bad_page_is_left_out(self, sio):  # noqa: F811
        create_async = await send({"message": "hi", "page": {"url": "javascript:alert(1)", "title": "x"}})

        assert "CURRENT PAGE" not in (create_async.await_args.kwargs["extra_context"] or "")

    async def test_a_page_from_an_earlier_message_does_not_linger(self, sio):  # noqa: F811
        session = sio.get_session.return_value
        await send({"message": "hi", "page": {"url": "https://a.com/products/x"}})
        create_async = await send({"message": "and now?"})

        assert "CURRENT PAGE" not in (create_async.await_args.kwargs["extra_context"] or "")
        assert "page" not in session

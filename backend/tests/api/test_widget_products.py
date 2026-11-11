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


The product sheet's socket event: the agent's own shop is asked, off the loop.
"""

from unittest.mock import AsyncMock, patch

import pytest

from app.api import widget_products

SESSION = {"agent_id": "a-1", "org_id": "o-1", "session_id": "s-1"}
CHOICES = {"options": [{"name": "Size", "values": ["S"]}], "variants": [], "complete": True}


@pytest.mark.asyncio
async def test_answers_with_the_products_choices():
    with patch.object(widget_products, "authenticated_session", AsyncMock(return_value=SESSION)), \
         patch.object(widget_products, "_read_options", return_value=CHOICES) as read, \
         patch.object(widget_products, "sio") as sio:
        sio.emit = AsyncMock()
        await widget_products.handle_product_options("sid", {"product_id": "42"})
    read.assert_called_once_with("a-1", "o-1", "42")
    sio.emit.assert_awaited_once_with("product_options_result", {"product_id": "42", **CHOICES},
                                      to="sid", namespace="/widget")


@pytest.mark.asyncio
@pytest.mark.parametrize("data", [{"product_id": "x"}, {}, None, "42"])
async def test_a_bad_request_asks_the_shop_nothing(data):
    with patch.object(widget_products, "authenticated_session", AsyncMock(return_value=SESSION)), \
         patch.object(widget_products, "_read_options") as read, \
         patch.object(widget_products, "sio") as sio:
        sio.emit = AsyncMock()
        await widget_products.handle_product_options("sid", data)
    read.assert_not_called()
    assert sio.emit.await_args.args[1]["complete"] is False


@pytest.mark.asyncio
async def test_an_agent_without_a_shop_offers_no_choices():
    with patch.object(widget_products, "shop_for_agent", return_value=None):
        assert widget_products._read_options("a", "o", "42")["complete"] is False

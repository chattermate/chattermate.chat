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
from unittest.mock import MagicMock

from app.channels import get_adapter
from app.channels.telegram import TelegramAdapter, MAX_MESSAGE_LENGTH


USER_MESSAGE_UPDATE = {
    "update_id": 1,
    "message": {
        "message_id": 42,
        "from": {"id": 111, "is_bot": False, "first_name": "Ada", "last_name": "Lovelace", "username": "ada"},
        "chat": {"id": 222, "type": "private"},
        "date": 1720000000,
        "text": "hello there",
    },
}

BOT_MESSAGE_UPDATE = {
    "update_id": 2,
    "message": {
        "message_id": 43,
        "from": {"id": 999, "is_bot": True, "first_name": "Bot"},
        "chat": {"id": 222, "type": "private"},
        "date": 1720000001,
        "text": "echo",
    },
}

MEDIA_ONLY_UPDATE = {
    "update_id": 3,
    "message": {
        "message_id": 44,
        "from": {"id": 111, "is_bot": False, "first_name": "Ada"},
        "chat": {"id": 222, "type": "private"},
        "date": 1720000002,
        "photo": [{"file_id": "abc"}],
    },
}


@pytest.fixture
def adapter():
    return TelegramAdapter()


def test_registry_resolves_telegram():
    assert isinstance(get_adapter("telegram"), TelegramAdapter)
    assert get_adapter("web") is None


def test_parse_user_message(adapter):
    messages = adapter.parse_inbound(USER_MESSAGE_UPDATE)
    assert len(messages) == 1
    msg = messages[0]
    assert msg.external_conversation_id == "222"
    assert msg.external_user_id == "111"
    assert msg.external_message_id == "42"
    assert msg.text == "hello there"
    assert msg.profile["name"] == "Ada Lovelace"


def test_parse_ignores_bot_messages(adapter):
    assert adapter.parse_inbound(BOT_MESSAGE_UPDATE) == []


def test_parse_ignores_media_only_messages(adapter):
    assert adapter.parse_inbound(MEDIA_ONLY_UPDATE) == []


def test_parse_ignores_non_message_updates(adapter):
    assert adapter.parse_inbound({"update_id": 4, "edited_message": {}}) == []


@pytest.mark.asyncio
async def test_verify_webhook_accepts_matching_secret(adapter):
    account = MagicMock(webhook_secret="s3cret")
    assert await adapter.verify_webhook(
        {"x-telegram-bot-api-secret-token": "s3cret"}, b"{}", account) is True


@pytest.mark.asyncio
async def test_verify_webhook_rejects_bad_or_missing_secret(adapter):
    account = MagicMock(webhook_secret="s3cret")
    assert await adapter.verify_webhook(
        {"x-telegram-bot-api-secret-token": "wrong"}, b"{}", account) is False
    assert await adapter.verify_webhook({}, b"{}", account) is False
    assert await adapter.verify_webhook(
        {"x-telegram-bot-api-secret-token": "s3cret"}, b"{}", None) is False


def test_format_outbound_enforces_length_cap(adapter):
    assert adapter.format_outbound("x" * (MAX_MESSAGE_LENGTH + 100)) == "x" * MAX_MESSAGE_LENGTH
    assert adapter.format_outbound("short **markdown**") == "short **markdown**"

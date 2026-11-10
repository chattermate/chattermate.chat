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
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from app.channels.constants import MessageSource
from app.models.channels import ChannelConversation
from app.models.chat_history import ChatHistory
from app.models.session_to_agent import SessionStatus, SessionToAgent
from app.repositories.chat import ChatRepository
from app.services import ai_access, channel_chat
from app.services.ai_access import AI_OFF_AWAY_NOTICE, AI_OFF_NOTICE, plan_allows_ai
from app.services.channel_chat import process_channel_message
from app.services.message_delivery import DeliveryResult
from tests.services.test_channel_chat import (  # noqa: F401
    account, make_inbound, mock_sio, routed_account, use_test_db,
)


class TestPlanAllowsAi:
    def test_community_installs_have_no_plan_to_ask(self, monkeypatch):
        monkeypatch.setattr(ai_access, "ai_replies_allowed", None)
        assert plan_allows_ai(MagicMock(), "org", "CHATTERMATE") is True

    def test_it_asks_the_plan(self, monkeypatch):
        rule = MagicMock(return_value=False)
        monkeypatch.setattr(ai_access, "ai_replies_allowed", rule)
        db = MagicMock()

        assert plan_allows_ai(db, "org", "CHATTERMATE", on_channel=True) is False
        rule.assert_called_once_with(db, "org", "CHATTERMATE", on_channel=True)

    def test_a_failed_lookup_leaves_the_ai_on(self, monkeypatch):
        monkeypatch.setattr(ai_access, "ai_replies_allowed", MagicMock(side_effect=RuntimeError("redis down")))
        assert plan_allows_ai(MagicMock(), "org", "CHATTERMATE") is True


def agent_reply(text="hi there"):
    response = SimpleNamespace(message=text, transfer_to_human=False, end_chat=False, request_lead_capture=False)
    agent = MagicMock()
    agent.get_response = AsyncMock(return_value=response)
    agent.safe_cleanup_mcp_tools = AsyncMock()
    return agent


def only_session(db):
    conversation = db.query(ChannelConversation).one()
    return db.query(SessionToAgent).filter_by(session_id=conversation.session_id).one()


@pytest.fixture
def delivered():
    with patch("app.services.human_routing.deliver_to_customer",
               AsyncMock(return_value=DeliveryResult(ok=True))) as send:
        yield send


@pytest.fixture
def ai_off(monkeypatch):
    monkeypatch.setattr(channel_chat, "plan_allows_ai", lambda *a, **k: False)


@pytest.fixture
def open_hours(monkeypatch):
    monkeypatch.setattr(ai_access, "is_within_business_hours", lambda org: True)


@pytest.mark.asyncio
class TestChannelWithAiOff:
    async def test_the_message_reaches_the_inbox_and_no_model_runs(
            self, db, routed_account, use_test_db, test_ai_config, mock_sio, ai_off, open_hours, delivered):
        with patch.object(channel_chat.ChatAgent, "create_async", AsyncMock()) as create_async:
            await process_channel_message(routed_account.id, make_inbound("hello"))

        create_async.assert_not_awaited()
        session = only_session(db)
        history = await ChatRepository(db).get_session_history(str(session.session_id))
        assert [m.message_type for m in history] == ["user", "bot"]
        assert history[1].message == AI_OFF_NOTICE

    async def test_the_conversation_is_never_transferred(
            self, db, routed_account, use_test_db, test_ai_config, mock_sio, ai_off, open_hours, delivered):
        await process_channel_message(routed_account.id, make_inbound("hello"))

        session = only_session(db)
        assert session.status == SessionStatus.OPEN
        assert session.user_id is None

    async def test_the_customer_is_told_once(
            self, db, routed_account, use_test_db, test_ai_config, mock_sio, ai_off, open_hours, delivered):
        await process_channel_message(routed_account.id, make_inbound("hello"))
        await process_channel_message(routed_account.id, make_inbound("still there?"))

        assert delivered.await_count == 1

    async def test_after_hours_it_says_so(
            self, db, routed_account, use_test_db, test_ai_config, mock_sio, ai_off, delivered, monkeypatch):
        monkeypatch.setattr(ai_access, "is_within_business_hours", lambda org: False)

        await process_channel_message(routed_account.id, make_inbound("hello"))

        assert delivered.await_args.args[2]["message"] == AI_OFF_AWAY_NOTICE

    async def test_the_notice_never_counts_against_the_quota(
            self, db, test_organization, routed_account, use_test_db, test_ai_config, mock_sio, ai_off,
            open_hours, delivered):
        await process_channel_message(routed_account.id, make_inbound("hello"))

        notice = db.query(ChatHistory).filter_by(message_type="bot").one()
        assert notice.attributes["source"] == MessageSource.SYSTEM.value
        assert ChatRepository(db).get_message_count_for_period(str(test_organization.id), None, None) == 0

    async def test_the_ai_comes_back_on_the_same_thread(
            self, db, routed_account, use_test_db, test_ai_config, mock_sio, open_hours, delivered, monkeypatch):
        allowed = {"now": False}
        monkeypatch.setattr(channel_chat, "plan_allows_ai", lambda *a, **k: allowed["now"])
        await process_channel_message(routed_account.id, make_inbound("hello"))
        first_session = only_session(db).session_id

        allowed["now"] = True
        fake_agent = agent_reply()
        with patch.object(channel_chat.ChatAgent, "create_async", AsyncMock(return_value=fake_agent)), \
             patch.object(channel_chat, "deliver_to_customer", AsyncMock(return_value=DeliveryResult(ok=True))):
            await process_channel_message(routed_account.id, make_inbound("are you back?"))

        fake_agent.get_response.assert_awaited_once()
        assert only_session(db).session_id == first_session

    async def test_a_chat_a_person_holds_gets_no_notice(
            self, db, routed_account, use_test_db, test_ai_config, test_user, mock_sio, ai_off, open_hours, delivered):
        await process_channel_message(routed_account.id, make_inbound("hello"))
        delivered.reset_mock()
        session = only_session(db)
        db.query(ChatHistory).filter_by(message_type="bot").delete()
        session.user_id = test_user.id
        db.commit()

        await process_channel_message(routed_account.id, make_inbound("thanks"))

        assert delivered.await_count == 0

    async def test_a_human_only_agent_keeps_its_own_acknowledgement(
            self, db, routed_account, use_test_db, test_ai_config, test_agent, mock_sio, ai_off, open_hours, delivered):
        test_agent.ai_replies_enabled = False
        db.commit()

        await process_channel_message(routed_account.id, make_inbound("hello"))

        assert delivered.await_args.args[2]["message"] != AI_OFF_NOTICE

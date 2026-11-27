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

import asyncio
from datetime import datetime, timezone
from unittest.mock import AsyncMock, MagicMock
from uuid import uuid4

import pytest

from app.channels.app_hooks import EventKind, register_event_listener
from app.channels.base import DeliveryState, StatusEvent
from sqlalchemy.orm import Session

from app.models.chat_history import ChatHistory
from app.models.organization import Organization
from app.repositories.channels import ChannelAccountRepository
from app.repositories.chat import ChatRepository
from app.repositories.session_to_agent import SessionToAgentRepository
from app.services import agent_rooms, channel_status
from app.services.channel_status import process_status_event, record_sent, replaceable_by
from app import database
from tests.session_db import serve_session_off_loop, session_slots_taken


class _FakePipeline:
    def __init__(self, store):
        self._store = store
        self._ops = []

    def rpush(self, key, value):
        self._ops.append(lambda: self._store.setdefault(key, []).append(value))

    def expire(self, key, seconds):
        self._ops.append(lambda: None)

    def lrange(self, key, start, end):
        self._ops.append(lambda: list(self._store.get(key, [])))

    def delete(self, key):
        self._ops.append(lambda: self._store.pop(key, None))

    def execute(self):
        return [op() for op in self._ops]


class _FakeRedis:
    def __init__(self):
        self.store = {}

    def pipeline(self):
        return _FakePipeline(self.store)


@pytest.fixture
def redis(monkeypatch):
    fake = _FakeRedis()
    monkeypatch.setattr(channel_status, "get_redis", lambda: fake)
    return fake


@pytest.fixture
def mock_sio(monkeypatch):
    sio = MagicMock()
    sio.emit = AsyncMock()
    monkeypatch.setattr(agent_rooms, "sio", sio)
    return sio


@pytest.fixture
def use_test_db(db, monkeypatch):
    serve_session_off_loop(monkeypatch, channel_status, db)
    return db


@pytest.fixture
def account(db, test_organization):
    return ChannelAccountRepository(db).create_account(
        organization_id=test_organization.id,
        channel_type="whatsapp",
        external_account_id="PN123",
        credentials={"access_token": "tok"},
        display_name="+1 555",
    )


def _message(db, organization_id, external_message_id=None, message_type="bot"):
    message = ChatRepository(db).create_message({
        "message": "hello",
        "message_type": message_type,
        "session_id": str(uuid4()),
        "organization_id": str(organization_id),
        "external_message_id": external_message_id,
    })
    return message


def _event(status: DeliveryState, message_id="wamid.1", error=None) -> StatusEvent:
    return StatusEvent(external_account_id="PN123", external_message_id=message_id,
                       recipient_id="447", status=status, error=error,
                       timestamp=datetime(2026, 10, 11, tzinfo=timezone.utc))


@pytest.mark.parametrize("new,expected", [
    (DeliveryState.SENT, set()),
    (DeliveryState.DELIVERED, {"sent"}),
    (DeliveryState.READ, {"sent", "delivered"}),
    # failed replaces anything but read: a read message was delivered
    (DeliveryState.FAILED, {"sent", "delivered"}),
])
def test_replaceable_by(new, expected):
    assert replaceable_by(new) == expected


def test_a_stale_receipt_on_another_worker_cannot_overwrite_a_newer_one(db, test_organization):
    """The rank check is part of the UPDATE, not a read-then-write in Python."""
    message = _message(db, test_organization.id, "wamid.1")
    other_worker = Session(bind=db.get_bind())
    try:
        stale_view = other_worker.get(ChatHistory, message.id)  # read while still unset
        assert stale_view.channel_status is None

        at = datetime(2026, 10, 11, tzinfo=timezone.utc)
        assert ChatRepository(db).advance_channel_status(message.id, "read", at, replaceable_by(DeliveryState.READ))
        assert not ChatRepository(other_worker).advance_channel_status(
            message.id, "delivered", at, replaceable_by(DeliveryState.DELIVERED))
    finally:
        other_worker.close()
    db.refresh(message)
    assert message.channel_status == "read"


@pytest.mark.asyncio
async def test_receipts_update_the_message_and_never_regress(db, account, test_organization,
                                                             use_test_db, mock_sio, redis):
    message = _message(db, test_organization.id, "wamid.1")

    await process_status_event(account.id, _event(DeliveryState.READ))
    await process_status_event(account.id, _event(DeliveryState.DELIVERED))

    db.refresh(message)
    assert message.channel_status == "read"
    assert message.channel_status_at is not None
    mock_sio.emit.assert_awaited_once()
    event_name, payload = mock_sio.emit.await_args.args
    assert event_name == "message_status"
    assert payload["message_id"] == message.id and payload["channel_status"] == "read"


@pytest.mark.asyncio
async def test_failed_receipt_marks_the_message_undelivered(db, account, test_organization,
                                                           use_test_db, mock_sio, redis):
    message = _message(db, test_organization.id, "wamid.1")

    await process_status_event(account.id, _event(DeliveryState.FAILED, error="Re-engagement required"))

    db.refresh(message)
    assert message.channel_status == "failed"
    assert message.attributes["delivery_status"] == "Re-engagement required"


@pytest.mark.asyncio
async def test_receipts_keep_the_account_send_problem_current(db, account, test_organization,
                                                              use_test_db, mock_sio, redis):
    """A failure Meta blames on the account flags it; a later delivery clears it."""
    from app.repositories.channels.accounts import send_problem
    _message(db, test_organization.id, "wamid.1")
    _message(db, test_organization.id, "wamid.2")

    locked = _event(DeliveryState.FAILED, error="Business account has been locked.")
    locked.account_blocked = True
    await process_status_event(account.id, locked)
    db.expire_all()
    assert send_problem(ChannelAccountRepository(db).get_by_id(account.id)) == \
        "Business account has been locked."

    await process_status_event(account.id, _event(DeliveryState.DELIVERED, message_id="wamid.2"))
    db.expire_all()
    assert send_problem(ChannelAccountRepository(db).get_by_id(account.id)) is None


@pytest.mark.asyncio
async def test_receipt_never_touches_another_organizations_message(db, account, use_test_db,
                                                                  mock_sio, redis):
    other_org = Organization(name="Other", domain="other.example")
    db.add(other_org)
    db.commit()
    foreign = _message(db, other_org.id, "wamid.1")

    await process_status_event(account.id, _event(DeliveryState.READ))

    db.refresh(foreign)
    assert foreign.channel_status is None


@pytest.mark.asyncio
async def test_early_receipt_waits_for_the_send_to_record_its_id(db, account, test_organization,
                                                                 use_test_db, mock_sio, redis):
    message = _message(db, test_organization.id)  # id not stored yet

    await process_status_event(account.id, _event(DeliveryState.SENT))
    await process_status_event(account.id, _event(DeliveryState.DELIVERED))
    db.refresh(message)
    assert message.channel_status is None

    await record_sent(db, message.id, account.id, "wamid.1")

    db.refresh(message)
    assert message.external_message_id == "wamid.1"
    assert message.channel_status == "delivered"
    assert redis.store == {}


@pytest.mark.asyncio
async def test_record_sent_without_redis_still_stores_the_id(db, account, test_organization,
                                                             monkeypatch, mock_sio):
    monkeypatch.setattr(channel_status, "get_redis", lambda: None)
    message = _message(db, test_organization.id)

    await record_sent(db, message.id, account.id, "wamid.9")

    db.refresh(message)
    assert message.external_message_id == "wamid.9"


@pytest.mark.asyncio
async def test_receipt_parked_after_the_queue_was_drained_is_still_applied(
        db, account, test_organization, use_test_db, mock_sio, redis, monkeypatch):
    """The send stores its id between the receipt's lookup and its park."""
    message = _message(db, test_organization.id)
    original_park = channel_status._park

    def park_after_send(account_id, event):
        ChatRepository(db).set_external_message_id(message.id, "wamid.1")  # send lands now
        original_park(account_id, event)
    monkeypatch.setattr(channel_status, "_park", park_after_send)

    await process_status_event(account.id, _event(DeliveryState.DELIVERED))

    db.refresh(message)
    assert message.channel_status == "delivered"
    assert redis.store == {}


@pytest.mark.asyncio
async def test_receipt_reaches_the_handling_agents_inbox(db, account, test_organization, test_user,
                                                         test_agent, test_customer,
                                                         use_test_db, mock_sio, redis):
    """Every inbox open on the org hears it (AI-owned chats have no agent),
    and so does the agent handling the chat."""
    session = SessionToAgentRepository(db).create_session(
        session_id=uuid4(), agent_id=test_agent.id, customer_id=test_customer.id,
        organization_id=test_organization.id, channel="whatsapp")
    session.user_id = test_user.id
    db.commit()
    message = ChatRepository(db).create_message({
        "message": "Your session is at 5pm", "message_type": "agent",
        "session_id": str(session.session_id), "organization_id": str(test_organization.id),
        "external_message_id": "wamid.1",
    })

    await process_status_event(account.id, _event(DeliveryState.DELIVERED))

    rooms = [call.kwargs["room"] for call in mock_sio.emit.await_args_list]
    assert rooms == [f"org_inbox_{test_organization.id}", f"user_{test_user.id}"]


@pytest.mark.asyncio
async def test_parked_receipts_hold_no_customer_details(db, account, test_organization,
                                                        use_test_db, mock_sio, redis):
    event = _event(DeliveryState.DELIVERED, message_id="wamid.LATE")
    event.recipient_id = "447700900123"
    event.pricing_category = "utility"

    await process_status_event(account.id, event)

    (parked,) = redis.store.values()
    assert "447700900123" not in parked[0] and "utility" not in parked[0]


@pytest.mark.asyncio
async def test_redis_failure_is_not_fatal(db, account, test_organization, use_test_db, mock_sio, monkeypatch):
    class _Broken:
        def pipeline(self):
            raise ConnectionError("redis down")
    monkeypatch.setattr(channel_status, "get_redis", lambda: _Broken())
    message = _message(db, test_organization.id)

    await process_status_event(account.id, _event(DeliveryState.SENT, message_id="wamid.NOPE"))
    await record_sent(db, message.id, account.id, "wamid.NOPE")

    db.refresh(message)
    assert message.external_message_id == "wamid.NOPE"


@pytest.mark.asyncio
async def test_failed_after_read_changes_nothing(db, account, test_organization,
                                                 use_test_db, mock_sio, redis):
    message = _message(db, test_organization.id, "wamid.1")
    await process_status_event(account.id, _event(DeliveryState.READ))
    await process_status_event(account.id, _event(DeliveryState.FAILED, error="late failure"))

    db.refresh(message)
    assert message.channel_status == "read"
    assert "delivery_status" not in (message.attributes or {})
    mock_sio.emit.assert_awaited_once()  # for the read; the late failure is dropped


@pytest.mark.asyncio
async def test_every_receipt_is_announced_even_for_unknown_messages(
        db, account, use_test_db, mock_sio, redis):
    """Usage counting needs receipts for messages ChatterMate never stored."""
    seen = []

    async def listen(event):
        seen.append(event)
    register_event_listener(listen)

    await process_status_event(account.id, _event(DeliveryState.DELIVERED, message_id="wamid.ELSEWHERE"))

    (event,) = seen
    assert event.kind == EventKind.STATUS
    assert event.status.external_message_id == "wamid.ELSEWHERE"
    assert event.event_id == f"{account.id}:wamid.ELSEWHERE:delivered"


@pytest.mark.asyncio
async def test_a_receipt_waits_for_a_free_session_slot_rather_than_failing(
        db, account, test_organization, mock_sio, redis):
    message = _message(db, test_organization.id, "wamid.1")

    async with session_slots_taken(database.OFF_LOOP_SESSIONS) as slots:
        receipt = asyncio.create_task(process_status_event(account.id, _event(DeliveryState.READ)))
        await asyncio.sleep(0.05)
        assert not receipt.done()  # queued behind the requests, not refused

        slots.release()  # a request finishes
        await asyncio.wait_for(receipt, 5)
        await slots.acquire()  # rebalance for the context manager

    db.refresh(message)
    assert message.channel_status == "read"


@pytest.mark.asyncio
async def test_extensions_hear_a_receipt_without_it_holding_a_session_slot(
        db, account, test_organization, mock_sio, redis):
    _message(db, test_organization.id, "wamid.1")
    slot_free_while_listening = []

    async with session_slots_taken(database.OFF_LOOP_SESSIONS - 1) as slots:
        async def listen(event):
            slot_free_while_listening.append(not slots.locked())
        register_event_listener(listen)

        await process_status_event(account.id, _event(DeliveryState.READ))

    assert slot_free_while_listening == [True]

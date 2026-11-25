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
from unittest.mock import AsyncMock
from uuid import uuid4

import pytest

from app.channels import app_hooks
from app.channels.app_hooks import (
    ChannelEvent, EventKind, MessageSource, OutboundRecord, emit_channel_event,
    inbound_event_id, outbound_event, register_event_listener, register_inbound_handler,
)


def _event() -> ChannelEvent:
    return ChannelEvent(kind=EventKind.INBOUND, event_id="a:1", organization_id=uuid4(),
                        channel_account_id=uuid4(), occurred_at=datetime.now(timezone.utc))


@pytest.mark.asyncio
async def test_no_extension_means_every_hook_is_a_no_op():
    assert app_hooks.inbound_handler() is None
    await emit_channel_event(_event())  # nothing listening, nothing raised


@pytest.mark.asyncio
async def test_a_failing_listener_never_stops_the_others():
    calls = []

    async def broken(event):
        raise RuntimeError("extension bug")

    async def working(event):
        calls.append(event.event_id)

    register_event_listener(broken)
    register_event_listener(working)
    register_event_listener(working)  # registering twice is a no-op

    await emit_channel_event(_event())

    assert calls == ["a:1"]


def test_load_extensions_without_one_installed_is_harmless(monkeypatch):
    monkeypatch.setattr(app_hooks, "EXTENSION_HOOKS_MODULE", "app.no_such_extension_module")
    app_hooks.load_extensions()
    app_hooks.load_extensions()  # idempotent
    assert app_hooks.inbound_handler() is None


def test_load_extensions_imports_the_extension_once(monkeypatch):
    imported = []
    monkeypatch.setattr(app_hooks.importlib, "import_module", lambda name: imported.append(name))
    app_hooks.load_extensions()
    app_hooks.load_extensions()
    assert imported == [app_hooks.EXTENSION_HOOKS_MODULE]


def test_reset_forgets_registrations():
    register_inbound_handler(AsyncMock(return_value=True))
    register_event_listener(AsyncMock())
    app_hooks.reset()
    assert app_hooks.inbound_handler() is None


def test_event_ids_are_stable_for_the_same_message():
    account = uuid4()
    assert inbound_event_id(account, "wamid.1") == inbound_event_id(account, "wamid.1")
    record = OutboundRecord(message_id=7, external_message_id="wamid.OUT",
                            source=MessageSource.AI, text="hi")
    first = outbound_event(organization_id=uuid4(), channel_account_id=account,
                           session_id="s", customer_id=None, record=record)
    second = outbound_event(organization_id=uuid4(), channel_account_id=account,
                            session_id="s", customer_id=None, record=record)
    assert first.event_id == second.event_id == f"{account}:out:wamid.OUT"


def test_outbound_without_a_platform_id_is_keyed_by_its_row():
    account = uuid4()
    record = OutboundRecord(message_id=7, external_message_id=None,
                            source=MessageSource.SYSTEM, text="hi")
    event = outbound_event(organization_id=uuid4(), channel_account_id=account,
                           session_id=None, customer_id=None, record=record)
    assert event.event_id == f"{account}:out:row7"


def test_a_broken_extension_is_reported_not_silently_skipped(monkeypatch, caplog):
    def import_module(name):
        raise ModuleNotFoundError("No module named 'some_dependency'", name="some_dependency")
    monkeypatch.setattr(app_hooks.importlib, "import_module", import_module)

    with caplog.at_level("ERROR"):
        app_hooks.load_extensions()

    assert "Channel extension failed to load" in caplog.text


@pytest.mark.asyncio
async def test_a_slow_listener_is_cut_off(monkeypatch):
    monkeypatch.setattr(app_hooks, "LISTENER_TIMEOUT_SECONDS", 0.01)
    calls = []

    async def slow(event):
        await asyncio.sleep(5)

    async def fast(event):
        calls.append(event.event_id)

    register_event_listener(slow)
    register_event_listener(fast)

    await emit_channel_event(_event())

    assert calls == ["a:1"]


def test_a_text_handler_registered_twice_runs_once():
    """Extensions can load more than once (tests, reloads): a handler is kept once."""
    app_hooks.reset()
    handler = AsyncMock(return_value=None)
    app_hooks.register_text_handler(handler)
    app_hooks.register_text_handler(handler)
    assert app_hooks.text_handlers() == [handler]
    app_hooks.reset()

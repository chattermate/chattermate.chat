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


The email check's socket events.
"""

from unittest.mock import AsyncMock, patch

import pytest

from app.api import widget_email_check as handlers
from app.services.email_check import CheckResult

PLAN = {"conversation_history": True, "follow_ups": True, "shop_in_chat": True, "known_customers": True}
SESSION = {"agent_id": "a-1", "org_id": "o-1", "session_id": "s-1", "plan_features": PLAN}


def _patched(**extra):
    return [patch.object(handlers, "authenticated_session", AsyncMock(return_value=SESSION)),
            patch.object(handlers, "sio")] + [patch.object(handlers, k, v) for k, v in extra.items()]


@pytest.mark.asyncio
async def test_start_sends_the_code_and_answers_masked():
    send = AsyncMock()
    with patch.object(handlers, "authenticated_session", AsyncMock(return_value=SESSION)), \
         patch.object(handlers, "sio") as sio, \
         patch.object(handlers.email_check, "start", return_value=(CheckResult(True, "sent"), "123456")), \
         patch.object(handlers, "_send_code") as send_code:
        sio.emit = AsyncMock()
        await handlers.handle_email_check_start("sid", {"email": " Jane@Acme.com "})
    send_code.assert_called_once_with("o-1", "jane@acme.com", "123456")
    sio.emit.assert_awaited_once_with("email_check_sent", {"email_masked": "j•••@acme.com"}, to="sid", namespace="/widget")


@pytest.mark.asyncio
async def test_a_failed_send_is_an_error_not_a_sent_code():
    with patch.object(handlers, "authenticated_session", AsyncMock(return_value=SESSION)), \
         patch.object(handlers, "sio") as sio, \
         patch.object(handlers.email_check, "start", return_value=(CheckResult(True, "sent"), "123456")), \
         patch.object(handlers, "_send_code", side_effect=OSError("smtp down")):
        sio.emit = AsyncMock()
        await handlers.handle_email_check_start("sid", {"email": "jane@acme.com"})
    event, payload = sio.emit.await_args.args[:2]
    assert event == "email_check_error" and payload["reason"] == "send_failed"


@pytest.mark.asyncio
async def test_verify_answers_with_the_result():
    with patch.object(handlers, "authenticated_session", AsyncMock(return_value=SESSION)), \
         patch.object(handlers, "sio") as sio, \
         patch.object(handlers.email_check, "verify", return_value=(CheckResult(False, "wrong_code", attempts_left=3), None)):
        sio.emit = AsyncMock()
        await handlers.handle_email_check_verify("sid", {"code": "000000"})
    assert sio.emit.await_args.args[:2] == ("email_check_error", {"reason": "wrong_code", "retry_in": 0, "attempts_left": 3})


@pytest.mark.asyncio
@pytest.mark.parametrize("purpose,offered", [("history", True), (None, False), ("orders", False)])
async def test_only_the_history_screen_offers_the_check_itself(purpose, offered):
    data = {"email": "jane@acme.com", **({"purpose": purpose} if purpose else {})}
    panel = {**SESSION, "panel": True}
    with patch.object(handlers, "authenticated_session", AsyncMock(return_value=panel)), \
         patch.object(handlers, "sio") as sio, \
         patch.object(handlers.email_check, "offer") as offer, \
         patch.object(handlers.email_check, "start", return_value=(CheckResult(False, "not_offered"), None)) as start:
        sio.emit = AsyncMock()
        await handlers.handle_email_check_start("sid", data)
    assert offer.called is offered
    if offered:
        offer.assert_called_once_with("s-1")
        assert start.call_args.args[3] == "history"


@pytest.mark.asyncio
async def test_a_socket_without_the_panel_cannot_ask_for_a_history_check():
    with patch.object(handlers, "authenticated_session", AsyncMock(return_value=SESSION)), \
         patch.object(handlers, "sio") as sio, \
         patch.object(handlers.email_check, "offer") as offer, \
         patch.object(handlers.email_check, "start") as start:
        sio.emit = AsyncMock()
        await handlers.handle_email_check_start("sid", {"email": "jane@acme.com", "purpose": "history"})
    offer.assert_not_called()
    start.assert_not_called()
    assert sio.emit.await_args.args[:2][0] == "email_check_error"


@pytest.mark.asyncio
async def test_below_pro_the_history_screen_cannot_ask_for_a_check():
    growth = {**SESSION, "panel": True, "plan_features": {**PLAN, "known_customers": False}}
    with patch.object(handlers, "authenticated_session", AsyncMock(return_value=growth)), \
         patch.object(handlers, "sio") as sio, \
         patch.object(handlers.email_check, "offer") as offer, \
         patch.object(handlers.email_check, "start") as start:
        sio.emit = AsyncMock()
        await handlers.handle_email_check_start("sid", {"email": "jane@acme.com", "purpose": "history"})
    offer.assert_not_called()
    start.assert_not_called()
    assert sio.emit.await_args.args[1]["reason"] == "not_offered"


@pytest.mark.asyncio
async def test_a_proven_email_links_this_browsers_conversations():
    with patch.object(handlers, "authenticated_session", AsyncMock(return_value=SESSION)), \
         patch.object(handlers, "sio") as sio, \
         patch.object(handlers.email_check, "verify", return_value=(CheckResult(True, "verified"), "jane@acme.com")), \
         patch.object(handlers, "_link_history") as link:
        sio.emit = AsyncMock()
        await handlers.handle_email_check_verify("sid", {"code": "123456"})
    link.assert_called_once_with(SESSION, "jane@acme.com")
    assert sio.emit.await_args.args[0] == "email_check_verified"


@pytest.mark.asyncio
async def test_a_failed_link_still_confirms_the_email():
    with patch.object(handlers, "authenticated_session", AsyncMock(return_value=SESSION)), \
         patch.object(handlers, "sio") as sio, \
         patch.object(handlers.email_check, "verify", return_value=(CheckResult(True, "verified"), "jane@acme.com")), \
         patch.object(handlers, "_link_history", side_effect=RuntimeError("db down")):
        sio.emit = AsyncMock()
        await handlers.handle_email_check_verify("sid", {"code": "123456"})
    assert sio.emit.await_args.args[0] == "email_check_verified"


@pytest.mark.asyncio
async def test_a_wrong_code_links_nothing():
    with patch.object(handlers, "authenticated_session", AsyncMock(return_value=SESSION)), \
         patch.object(handlers, "sio") as sio, \
         patch.object(handlers.email_check, "verify", return_value=(CheckResult(False, "wrong_code", attempts_left=2), None)), \
         patch.object(handlers, "_link_history") as link:
        sio.emit = AsyncMock()
        await handlers.handle_email_check_verify("sid", {"code": "000000"})
    link.assert_not_called()


def test_the_email_says_what_the_code_is_for():
    message = handlers._message({"from_email": "help@shop.example"}, "jane@acme.com", "123456")
    assert message["To"] == "jane@acme.com" and "123456" in message.get_content()



def test_the_code_goes_to_that_one_address_and_a_refused_mailbox_reads_as_sent():
    import smtplib
    sent = {}

    def fake_send(cfg, message, to_addrs=None):
        sent["to"] = to_addrs
        raise smtplib.SMTPRecipientsRefused({"jane@acme.com": (550, b"no such user")})

    with patch.object(handlers, "SessionLocal"), \
         patch.object(handlers, "resolve_org_smtp", return_value={"from_email": "help@shop.example"}), \
         patch.object(handlers, "send_smtp", side_effect=fake_send):
        handlers._send_code("o-1", "jane@acme.com", "123456")
    assert sent["to"] == ["jane@acme.com"]


STORE_TOKEN = {"source": "shopify_storefront", "customer_email": "jane@acme.com"}
STORE_SESSION = {**SESSION, "customer_id": "c-1"}


def test_a_store_signed_in_customer_needs_no_code():
    with patch.object(handlers.email_check, "prove", return_value=True) as prove, \
         patch.object(handlers, "_link_history") as link:
        assert handlers.accept_store_sign_in(STORE_SESSION, STORE_TOKEN)
    prove.assert_called_once_with("s-1", "c-1", "jane@acme.com")
    link.assert_called_once_with(STORE_SESSION, "jane@acme.com")


@pytest.mark.parametrize("session,token", [
    # Below Pro the store customer is not a known customer
    ({**STORE_SESSION, "plan_features": {**PLAN, "known_customers": False}}, STORE_TOKEN),
    # A site's own identify() token, even one copying the marker into custom_data
    (STORE_SESSION, {"customer_email": "jane@acme.com", "custom_data": {"source": "shopify_storefront"}}),
    # The widget's anonymous token
    (STORE_SESSION, {"ckey": "k-1"}),
])
def test_nothing_else_skips_the_code(session, token):
    with patch.object(handlers.email_check, "prove") as prove:
        assert not handlers.accept_store_sign_in(session, token)
    prove.assert_not_called()


def test_the_proof_stands_when_linking_history_fails():
    with patch.object(handlers.email_check, "prove", return_value=True), \
         patch.object(handlers, "_link_history", side_effect=RuntimeError("db down")):
        assert handlers.accept_store_sign_in(STORE_SESSION, STORE_TOKEN)


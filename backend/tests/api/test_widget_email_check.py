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

SESSION = {"agent_id": "a-1", "org_id": "o-1", "session_id": "s-1"}


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

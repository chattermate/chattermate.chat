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

Inbound-parse webhook routing: a reply to a ticket notification lands on the
ticket, everything else still goes to the chat pipeline.
"""

from unittest.mock import AsyncMock, patch

import pytest
from fastapi.testclient import TestClient

import app.main  # noqa: F401 — ensures routers are registered on the FastAPI app
from app.core.application import app
from app.core.auth import get_current_user, get_current_organization
from app.database import get_db
from app.models.ticket import TicketPriority, TicketSource, TicketStatus
from app.models.ticket_activity import TicketActivityType
from app.repositories.channels import ChannelAccountRepository
from app.services.ticket import TicketService
from app.services.ticket_email import new_ticket_message_id, ticket_root_message_id
from tests.session_db import serve_session_off_loop

WEBHOOK_BASE = "/api/v1/webhooks/email"


@pytest.fixture(autouse=True)
def no_embeddings():
    with patch("app.services.ticket.embed_ticket_text", return_value=None):
        yield


@pytest.fixture
def client(db, test_user, test_organization):
    async def override_user():
        return test_user

    async def override_org():
        return test_organization

    def override_db():
        yield db

    app.dependency_overrides[get_current_user] = override_user
    app.dependency_overrides[get_current_organization] = override_org
    app.dependency_overrides[get_db] = override_db
    yield TestClient(app)
    app.dependency_overrides.clear()


@pytest.fixture
def email_account(db, test_organization):
    return ChannelAccountRepository(db).create_account(
        organization_id=test_organization.id,
        channel_type="email",
        external_account_id="support@acme.com",
        credentials={},
        display_name="Support inbox",
    )


@pytest.fixture
def service(db):
    return TicketService(db)


@pytest.fixture
def ticket(service, db, test_organization):
    created, _dupes = service.create_ticket(
        organization_id=test_organization.id,
        title="Card declined at checkout",
        description="Every attempt fails.",
        priority=TicketPriority.HIGH,
        source=TicketSource.MANUAL,
        customer_email="ada@example.com",
        customer_name="Ada Lovelace",
    )
    db.commit()
    db.refresh(created)
    return created


def payload(subject="Re: Card declined", references="", sender="Ada <ada@example.com>",
            message_id="<reply-1@mail.example.com>"):
    return {
        "from": sender,
        "to": "support@acme.com",
        "subject": subject,
        "text": "It is still broken.\n\nOn Mon, Jul 7 2026 support wrote:\n> earlier",
        "headers": f"Message-ID: {message_id}\nReferences: {references}",
    }


def post(client, account, body):
    return client.post(f"{WEBHOOK_BASE}/{account.id}?token={account.webhook_secret}",
                       json=body)


class TestTicketReplyRouting:
    def test_reply_routes_to_the_ticket_not_the_chat_agent(
        self, client, email_account, ticket, test_organization
    ):
        with patch("app.api.webhooks.email.record_ticket_email_reply",
                   AsyncMock()) as record, \
             patch("app.api.webhooks.email.process_channel_message",
                   AsyncMock()) as chat:
            response = post(client, email_account,
                            payload(references=ticket_root_message_id(ticket.id)))

        assert response.status_code == 200
        chat.assert_not_awaited()
        record.assert_awaited_once()
        organization_id, ticket_id, inbound = record.await_args.args
        assert organization_id == test_organization.id
        assert ticket_id == ticket.id
        assert inbound.text == "It is still broken."

    def test_reply_matched_by_subject_token(self, client, email_account, ticket):
        with patch("app.api.webhooks.email.record_ticket_email_reply",
                   AsyncMock()) as record, \
             patch("app.api.webhooks.email.process_channel_message", AsyncMock()):
            post(client, email_account,
                 payload(subject=f"Re: [{ticket.display_number}] Card declined"))
        assert record.await_args.args[1] == ticket.id

    def test_subject_token_from_a_stranger_goes_to_the_chat_agent(
        self, client, email_account, ticket
    ):
        with patch("app.api.webhooks.email.record_ticket_email_reply",
                   AsyncMock()) as record, \
             patch("app.api.webhooks.email.process_channel_message",
                   AsyncMock()) as chat:
            post(client, email_account,
                 payload(subject=f"Re: [{ticket.display_number}] Card declined",
                         sender="stranger@elsewhere.test"))
        record.assert_not_awaited()
        chat.assert_awaited_once()

    def test_ordinary_mail_still_reaches_the_chat_agent(
        self, client, email_account, ticket
    ):
        with patch("app.api.webhooks.email.record_ticket_email_reply",
                   AsyncMock()) as record, \
             patch("app.api.webhooks.email.process_channel_message",
                   AsyncMock()) as chat:
            post(client, email_account, payload(subject="A brand new question"))
        record.assert_not_awaited()
        chat.assert_awaited_once()

    def test_bad_token_is_rejected_before_any_matching(
        self, client, email_account, ticket
    ):
        with patch("app.api.webhooks.email.record_ticket_email_reply",
                   AsyncMock()) as record:
            response = client.post(f"{WEBHOOK_BASE}/{email_account.id}?token=wrong",
                                   json=payload())
        assert response.status_code == 403
        record.assert_not_awaited()

    def test_autoresponder_reply_is_dropped(self, client, email_account, ticket):
        body = payload(references=ticket_root_message_id(ticket.id))
        body["headers"] = f"{body['headers']}\nAuto-Submitted: auto-replied"
        with patch("app.api.webhooks.email.record_ticket_email_reply",
                   AsyncMock()) as record, \
             patch("app.api.webhooks.email.process_channel_message",
                   AsyncMock()) as chat:
            response = post(client, email_account, body)
        assert response.status_code == 200
        record.assert_not_awaited()
        chat.assert_not_awaited()


class TestReplyEndToEnd:
    def test_reply_appends_a_comment_and_reopens_the_ticket(
        self, client, db, email_account, ticket, service, monkeypatch
    ):
        service.transition_status(ticket, TicketStatus.RESOLVED_PENDING_CONFIRMATION)
        db.commit()

        from app.services import ticket_email_reply
        serve_session_off_loop(monkeypatch, ticket_email_reply, db)

        with patch("app.services.ticket_events.emit_ticket_update", AsyncMock()):
            response = post(client, email_account,
                            payload(references=new_ticket_message_id(ticket.id)))

        assert response.status_code == 200
        db.refresh(ticket)
        assert ticket.status == TicketStatus.REOPENED
        activities = service.activity_repo.list_for_ticket(ticket.id)
        replies = [a for a in activities
                   if a.activity_type == TicketActivityType.CUSTOMER_REPLIED.value]
        assert len(replies) == 1
        assert replies[0].body == "It is still broken."
        assert replies[0].activity_metadata["from"] == "ada@example.com"

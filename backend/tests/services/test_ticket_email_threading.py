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

from unittest.mock import AsyncMock, patch
from uuid import uuid4

import pytest

from app.channels import get_adapter
from app.channels.base import InboundMessage
from app.models.ticket import TicketPriority, TicketSource, TicketStatus
from app.models.ticket_activity import TicketActivityType, TicketActorType
from app.services import ticket_email, ticket_email_reply
from app.services.ticket import TicketService
from app.services.ticket_email import (
    build_thread_headers,
    new_ticket_message_id,
    send_ticket_email,
    ticket_ids_from_references,
    ticket_number_from_subject,
    ticket_root_message_id,
)
from app.services.ticket_email_reply import find_ticket_for_reply, record_ticket_email_reply


@pytest.fixture(autouse=True)
def no_embeddings():
    with patch("app.services.ticket.embed_ticket_text", return_value=None):
        yield


@pytest.fixture
def service(db):
    return TicketService(db)


def make_ticket(service, db, org, **overrides):
    kwargs = dict(
        organization_id=org.id,
        title="Card declined at checkout",
        description="Every attempt fails.",
        priority=TicketPriority.HIGH,
        source=TicketSource.MANUAL,
        customer_email="ada@example.com",
        customer_name="Ada Lovelace",
    )
    kwargs.update(overrides)
    ticket, _dupes = service.create_ticket(**kwargs)
    db.commit()
    db.refresh(ticket)
    return ticket


def inbound_reply(ticket_id=None, subject="Re: [TKT-1] Card declined",
                  sender="ada@example.com", message_id="<reply-1@mail.example.com>",
                  references=None):
    if references is None:
        references = ticket_root_message_id(ticket_id) if ticket_id else ""
    return InboundMessage(
        external_account_id="",
        external_conversation_id=sender,
        external_user_id=sender,
        external_message_id=message_id,
        text="It is still broken.",
        profile={
            "name": "Ada", "email": sender, "subject": subject,
            "inbound_message_id": message_id,
            "in_reply_to": "", "references": references,
        },
    )


class TestMessageIdScheme:
    def test_root_is_stable_and_per_message_ids_are_not(self):
        ticket_id = uuid4()
        assert ticket_root_message_id(ticket_id) == ticket_root_message_id(ticket_id)
        assert new_ticket_message_id(ticket_id) != new_ticket_message_id(ticket_id)

    def test_every_generated_id_resolves_back_to_its_ticket(self):
        ticket_id = uuid4()
        for value in (ticket_root_message_id(ticket_id), new_ticket_message_id(ticket_id)):
            assert ticket_ids_from_references(value) == [ticket_id]

    def test_domain_does_not_affect_matching(self):
        ticket_id = uuid4()
        value = new_ticket_message_id(ticket_id, from_email="help@customer-domain.test")
        assert value.endswith("@customer-domain.test>")
        assert ticket_ids_from_references(value) == [ticket_id]

    def test_nearest_ancestor_wins_in_references(self):
        older, newer = uuid4(), uuid4()
        header = f"{ticket_root_message_id(older)} {ticket_root_message_id(newer)}"
        assert ticket_ids_from_references(header) == [newer, older]

    def test_foreign_message_ids_are_ignored(self):
        assert ticket_ids_from_references("<CAF=abc@mail.gmail.com>", None, "") == []

    def test_thread_headers_reference_the_root(self):
        ticket_id = uuid4()
        headers = build_thread_headers(ticket_id)
        root = ticket_root_message_id(ticket_id)
        assert headers["In-Reply-To"] == root
        assert headers["References"] == root
        assert headers["Message-ID"] != root

    def test_thread_headers_chain_onto_the_last_reply(self):
        ticket_id = uuid4()
        headers = build_thread_headers(ticket_id, in_reply_to="<reply-9@mail.example.com>")
        assert headers["In-Reply-To"] == "<reply-9@mail.example.com>"
        assert headers["References"] == (
            f"{ticket_root_message_id(ticket_id)} <reply-9@mail.example.com>"
        )

    @pytest.mark.parametrize("subject,expected", [
        ("Re: [TKT-42] Card declined", 42),
        ("[tkt-7] lowercase still counts", 7),
        ("Fwd: Re: [TKT-1024] deep thread", 1024),
        ("No token here", None),
        ("TKT-5 without brackets", None),
        (None, None),
    ])
    def test_subject_token(self, subject, expected):
        assert ticket_number_from_subject(subject) == expected


class TestOutboundThreading:
    @pytest.fixture
    def sent(self, monkeypatch):
        captured = {}

        def fake_send(cfg, message):
            captured["message"] = message

        monkeypatch.setattr(ticket_email, "send_smtp", fake_send)
        monkeypatch.setattr(ticket_email, "resolve_org_smtp", lambda db, org: {
            "host": "smtp.test", "port": 587, "username": None, "password": None,
            "from_email": "support@acme.com", "use_ssl": False,
        })
        return captured

    @pytest.mark.asyncio
    async def test_ticket_mail_carries_threading_headers(self, sent, db):
        ticket_id = uuid4()
        ok = await send_ticket_email(
            db, uuid4(), "ada@example.com", "[TKT-1] Card declined", "We are on it",
            ticket_id=ticket_id,
        )
        assert ok is True
        message = sent["message"]
        assert ticket_ids_from_references(message["Message-ID"]) == [ticket_id]
        assert message["References"] == ticket_root_message_id(ticket_id, "support@acme.com")
        assert message["In-Reply-To"] == message["References"]

    @pytest.mark.asyncio
    async def test_mail_without_a_ticket_keeps_a_plain_message_id(self, sent, db):
        await send_ticket_email(db, uuid4(), "a@b.co", "Subject", "Body")
        assert ticket_ids_from_references(sent["message"]["Message-ID"]) == []
        assert sent["message"]["In-Reply-To"] is None

    @pytest.mark.asyncio
    async def test_service_threads_onto_the_customers_last_reply(
        self, service, db, test_organization
    ):
        ticket = make_ticket(service, db, test_organization)
        service.record_customer_email_reply(
            ticket, "Still broken", "ada@example.com", "<reply-1@mail.example.com>")
        db.commit()

        with patch("app.services.ticket_email.send_ticket_email",
                   AsyncMock(return_value=True)) as send:
            await service.send_customer_message(ticket, "Looking into it")

        assert send.await_args.kwargs["ticket_id"] == ticket.id
        assert send.await_args.kwargs["in_reply_to"] == "<reply-1@mail.example.com>"

    @pytest.mark.asyncio
    async def test_first_mail_has_no_reply_to_thread_onto(
        self, service, db, test_organization
    ):
        ticket = make_ticket(service, db, test_organization)
        with patch("app.services.ticket_email.send_ticket_email",
                   AsyncMock(return_value=True)) as send:
            await service.send_customer_message(ticket, "Looking into it")
        assert send.await_args.kwargs["in_reply_to"] is None


class TestReplyMatching:
    def test_matches_on_references(self, service, db, test_organization):
        ticket = make_ticket(service, db, test_organization)
        inbound = inbound_reply(ticket.id, subject="Re: no token here")
        found = find_ticket_for_reply(db, test_organization.id, inbound.profile)
        assert found is not None and found.id == ticket.id

    def test_matches_on_in_reply_to(self, service, db, test_organization):
        ticket = make_ticket(service, db, test_organization)
        profile = inbound_reply(subject="Re: no token").profile
        profile["in_reply_to"] = new_ticket_message_id(ticket.id)
        found = find_ticket_for_reply(db, test_organization.id, profile)
        assert found is not None and found.id == ticket.id

    def test_falls_back_to_the_subject_token(self, service, db, test_organization):
        ticket = make_ticket(service, db, test_organization)
        profile = inbound_reply(
            subject=f"Re: [{ticket.display_number}] Card declined").profile
        found = find_ticket_for_reply(db, test_organization.id, profile)
        assert found is not None and found.id == ticket.id

    def test_subject_token_from_a_stranger_is_not_a_match(
        self, service, db, test_organization
    ):
        ticket = make_ticket(service, db, test_organization)
        profile = inbound_reply(
            subject=f"Re: [{ticket.display_number}] Card declined",
            sender="stranger@elsewhere.test").profile
        assert find_ticket_for_reply(db, test_organization.id, profile) is None

    def test_headers_beat_a_mismatched_subject_token(
        self, service, db, test_organization
    ):
        real = make_ticket(service, db, test_organization)
        other = make_ticket(service, db, test_organization, title="Unrelated")
        profile = inbound_reply(
            real.id, subject=f"Re: [{other.display_number}] Unrelated").profile
        found = find_ticket_for_reply(db, test_organization.id, profile)
        assert found.id == real.id

    def test_tickets_of_another_org_are_invisible(self, service, db, test_organization):
        ticket = make_ticket(service, db, test_organization)
        profile = inbound_reply(ticket.id).profile
        assert find_ticket_for_reply(db, uuid4(), profile) is None

    def test_ordinary_mail_is_not_a_ticket_reply(self, db, test_organization):
        profile = get_adapter("email").parse_inbound({
            "from": "ada@example.com", "text": "Hi, can you help?", "subject": "Help",
        })[0].profile
        assert find_ticket_for_reply(db, test_organization.id, profile) is None


class TestRecordingReplies:
    def test_reply_is_appended_as_a_customer_activity(
        self, service, db, test_organization
    ):
        ticket = make_ticket(service, db, test_organization)
        service.record_customer_email_reply(
            ticket, "It is still broken.", "ada@example.com", "<reply-1@mail>")
        db.commit()

        last = service.activity_repo.list_for_ticket(ticket.id)[-1]
        assert last.activity_type == TicketActivityType.CUSTOMER_REPLIED.value
        assert last.actor_type == TicketActorType.CUSTOMER.value
        assert last.body == "It is still broken."
        assert last.is_internal is False
        assert last.activity_metadata["channel"] == "email"
        assert last.activity_metadata["from"] == "ada@example.com"
        assert last.activity_metadata["email_message_id"] == "<reply-1@mail>"

    def test_reply_reopens_an_unconfirmed_resolution(
        self, service, db, test_organization
    ):
        ticket = make_ticket(service, db, test_organization)
        service.transition_status(ticket, TicketStatus.RESOLVED_PENDING_CONFIRMATION)
        db.commit()

        service.record_customer_email_reply(ticket, "Not fixed", "ada@example.com", "<r@m>")
        db.commit()
        db.refresh(ticket)

        assert ticket.status == TicketStatus.REOPENED
        assert ticket.reopened_count == 1
        assert ticket.confirmation_requested_at is None
        types = [a.activity_type for a in service.activity_repo.list_for_ticket(ticket.id)]
        assert TicketActivityType.REOPENED.value in types

    def test_reply_on_an_open_ticket_leaves_the_status_alone(
        self, service, db, test_organization
    ):
        ticket = make_ticket(service, db, test_organization)
        service.transition_status(ticket, TicketStatus.IN_PROGRESS)
        service.record_customer_email_reply(ticket, "Any news?", "ada@example.com", "<r@m>")
        db.commit()
        db.refresh(ticket)
        assert ticket.status == TicketStatus.IN_PROGRESS
        assert ticket.reopened_count == 0

    @pytest.mark.asyncio
    async def test_background_task_records_and_emits(
        self, service, db, test_organization, monkeypatch
    ):
        ticket = make_ticket(service, db, test_organization)

        class _NonClosing:
            def __init__(self, inner):
                self._inner = inner

            def __getattr__(self, name):
                return getattr(self._inner, name)

            def close(self):
                pass

        monkeypatch.setattr(ticket_email_reply, "SessionLocal", lambda: _NonClosing(db))
        with patch("app.services.ticket_events.emit_ticket_update", AsyncMock()) as emit:
            await record_ticket_email_reply(
                test_organization.id, ticket.id, inbound_reply(ticket.id))

        last = service.activity_repo.list_for_ticket(ticket.id)[-1]
        assert last.activity_type == TicketActivityType.CUSTOMER_REPLIED.value
        assert last.body == "It is still broken."
        emit.assert_awaited_once()
        assert emit.await_args.args[2] == "comment"

    @pytest.mark.asyncio
    async def test_background_task_survives_an_unknown_ticket(
        self, db, test_organization, monkeypatch
    ):
        monkeypatch.setattr(ticket_email_reply, "SessionLocal", lambda: db)
        await record_ticket_email_reply(test_organization.id, uuid4(), inbound_reply())

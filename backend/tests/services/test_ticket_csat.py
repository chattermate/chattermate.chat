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

from datetime import datetime, timedelta, timezone
from unittest.mock import AsyncMock, patch
from uuid import uuid4

import pytest

from app.models.rating import Rating
from app.models.session_to_agent import SessionStatus, SessionToAgent
from app.models.ticket import Ticket, TicketPriority, TicketSource, TicketStatus
from app.models.ticket_activity import TicketActivityType, TicketActorType
from app.services.ticket import TicketService
from app.services.ticket_csat import record_conversation_rating


@pytest.fixture(autouse=True)
def no_embeddings():
    with patch("app.services.ticket.embed_ticket_text", return_value=None):
        yield


@pytest.fixture(autouse=True)
def no_delivery():
    """CSAT asks go out over the widget socket — irrelevant here."""
    with patch("app.services.message_delivery.deliver_to_customer", new=AsyncMock()):
        yield


@pytest.fixture
def service(db):
    return TicketService(db)


@pytest.fixture
def test_session(db, test_organization, test_customer, test_agent) -> SessionToAgent:
    session = SessionToAgent(
        session_id=uuid4(),
        organization_id=test_organization.id,
        customer_id=test_customer.id,
        agent_id=test_agent.id,
        status=SessionStatus.OPEN,
        channel="web",
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return session


def make_ticket(service, db, org, **overrides) -> Ticket:
    kwargs = dict(
        organization_id=org.id,
        title="Refund never arrived",
        priority=TicketPriority.MEDIUM,
        source=TicketSource.MANUAL,
    )
    kwargs.update(overrides)
    ticket, _dupes = service.create_ticket(**kwargs)
    db.commit()
    db.refresh(ticket)
    return ticket


def make_rating(db, session, org, score=5, feedback=None) -> Rating:
    rating = Rating(
        session_id=session.session_id,
        customer_id=session.customer_id,
        agent_id=session.agent_id,
        organization_id=org.id,
        rating=score,
        feedback=feedback,
    )
    db.add(rating)
    db.commit()
    db.refresh(rating)
    return rating


class TestCsatRequest:
    @pytest.mark.asyncio
    async def test_close_stamps_requested_at(
        self, service, db, test_organization, test_session
    ):
        ticket = make_ticket(
            service, db, test_organization,
            session_id=test_session.session_id, source=TicketSource.CHAT_AI,
        )
        await service.close(ticket)
        db.commit()
        assert ticket.csat_requested_at is not None
        assert ticket.csat_score is None
        types = [a.activity_type for a in service.activity_repo.list_for_ticket(ticket.id)]
        assert TicketActivityType.CSAT_REQUESTED.value in types

    @pytest.mark.asyncio
    async def test_close_without_session_never_asks(
        self, service, db, test_organization
    ):
        """Conversation-only by design: a ticket with nothing to rate is never
        asked, so the UI can show "not requested" rather than a pending CSAT
        that will never arrive."""
        ticket = make_ticket(service, db, test_organization)
        await service.close(ticket)
        db.commit()
        assert ticket.csat_requested_at is None

    @pytest.mark.asyncio
    async def test_close_respects_csat_disabled(
        self, service, db, test_organization, test_session
    ):
        settings = service.settings_repo.get_or_create(test_organization.id)
        settings.csat_enabled = False
        db.commit()
        ticket = make_ticket(
            service, db, test_organization,
            session_id=test_session.session_id, source=TicketSource.CHAT_AI,
        )
        await service.close(ticket)
        db.commit()
        assert ticket.csat_requested_at is None


class TestCsatCapture:
    def test_rating_lands_on_the_linked_ticket(
        self, service, db, test_organization, test_session
    ):
        ticket = make_ticket(
            service, db, test_organization,
            session_id=test_session.session_id, source=TicketSource.CHAT_AI,
        )
        rating = make_rating(db, test_session, test_organization, score=4, feedback="Quick fix")

        assert record_conversation_rating(db, rating) == ticket.id
        db.refresh(ticket)
        assert ticket.csat_score == 4
        assert ticket.csat_rating_id == rating.id
        assert ticket.csat_responded_at is not None

        received = [
            a for a in service.activity_repo.list_for_ticket(ticket.id)
            if a.activity_type == TicketActivityType.CSAT_RECEIVED.value
        ]
        assert len(received) == 1
        assert received[0].actor_type == TicketActorType.CUSTOMER.value
        assert "4/5" in received[0].body
        assert "Quick fix" in received[0].body

    def test_rating_without_a_ticket_is_a_noop(self, db, test_organization, test_session):
        rating = make_rating(db, test_session, test_organization)
        assert record_conversation_rating(db, rating) is None

    def test_linkage_failure_does_not_raise(self, db, test_organization, test_session):
        """The rating is already stored by the time we get here — a broken
        linkage must never surface to the customer."""
        rating = make_rating(db, test_session, test_organization)
        with patch(
            "app.repositories.ticket.TicketRepository.get_by_session",
            side_effect=RuntimeError("boom"),
        ):
            assert record_conversation_rating(db, rating) is None

    def test_second_rating_overwrites(
        self, service, db, test_organization, test_session
    ):
        ticket = make_ticket(
            service, db, test_organization,
            session_id=test_session.session_id, source=TicketSource.CHAT_AI,
        )
        first = make_rating(db, test_session, test_organization, score=2)
        record_conversation_rating(db, first)
        second = make_rating(db, test_session, test_organization, score=5)
        record_conversation_rating(db, second)
        db.refresh(ticket)
        assert ticket.csat_score == 5
        assert ticket.csat_rating_id == second.id


class TestCsatStats:
    def _scored(self, service, db, org, score, resolver, days_ago=1):
        ticket = make_ticket(service, db, org)
        ticket.csat_score = score
        ticket.resolved_by_actor = resolver
        ticket.csat_responded_at = datetime.now(timezone.utc) - timedelta(days=days_ago)
        db.commit()
        return ticket

    def test_splits_ai_and_human(self, service, db, test_organization):
        self._scored(service, db, test_organization, 5, "ai")
        self._scored(service, db, test_organization, 4, "ai")
        self._scored(service, db, test_organization, 2, "user")
        stats = service.stats(test_organization.id)
        assert stats["csat_responses"] == 3
        assert stats["csat_ai_avg"] == 4.5
        assert stats["csat_human_avg"] == 2.0
        assert stats["csat_avg"] == pytest.approx(3.67, abs=0.01)

    def test_ignores_responses_outside_the_window(self, service, db, test_organization):
        self._scored(service, db, test_organization, 5, "ai", days_ago=90)
        stats = service.stats(test_organization.id)
        assert stats["csat_responses"] == 0
        assert stats["csat_avg"] is None
        assert stats["csat_window_days"] == 30

    def test_no_responses(self, service, db, test_organization):
        make_ticket(service, db, test_organization)
        stats = service.stats(test_organization.id)
        assert stats["csat_responses"] == 0
        assert stats["csat_ai_avg"] is None
        assert stats["csat_human_avg"] is None

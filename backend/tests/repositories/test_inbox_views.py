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

"""The inbox's views, its search and sort, and the handover/close times.

A view's count must be the number of rows the view lists, in every permission
scope: a badge that says 3 over a list of 2 is the bug this pins down.
"""

from datetime import datetime, timedelta, timezone
from uuid import uuid4

import pytest

from app.models.chat_history import ChatHistory
from app.models.customer import Customer
from app.models.session_to_agent import SessionStatus
from app.repositories.chat import ChatRepository
from app.repositories.inbox_views import InboxSort, InboxView
from app.repositories.session_to_agent import SessionToAgentRepository

# Each view's count, by the key /chats/counts returns it under
COUNT_KEY = {
    InboxView.MINE: "assigned_to_me",
    InboxView.WAITING: "waiting_for_human",
    InboxView.OPEN: "open",
    InboxView.AI: "ai_handling",
    InboxView.RESOLVED_BY_AI: "resolved_by_ai_today",
    InboxView.NEGATIVE: "negative",
}


def _ids(rows):
    return {str(r["session_id"]) for r in rows}


@pytest.fixture
def every_kind(db, sessions, make_session, agent_user):
    """Besides the four ownership kinds: a handed-over chat, a negative one,
    one the AI closed and one a person closed."""
    handed_over = make_session(channel="whatsapp")
    handed_over.status = SessionStatus.TRANSFERRED
    unhappy = make_session()
    unhappy.sentiment_label = "negative"
    ai_closed = make_session()
    ai_closed.status = SessionStatus.CLOSED
    person_closed = make_session(user_id=agent_user.id)
    person_closed.status = SessionStatus.CLOSED
    db.commit()
    return {**sessions, "handed_over": handed_over, "unhappy": unhappy,
            "ai_closed": ai_closed, "person_closed": person_closed}


@pytest.mark.parametrize("view", list(COUNT_KEY))
@pytest.mark.parametrize("scope", ["all", "assigned", "assigned+queue", "queue"])
def test_each_view_counts_exactly_what_it_lists(
    db, test_organization_id, agent_user, group, every_kind, view, scope
):
    resolved = {
        "all": {},
        "assigned": {"user_id": agent_user.id, "user_groups": [str(group.id)]},
        "assigned+queue": {"user_id": agent_user.id, "user_groups": [str(group.id)],
                           "include_unassigned": True},
        "queue": {"include_unassigned": True},
    }[scope]
    repo = ChatRepository(db)

    listed = repo.get_recent_chats(
        organization_id=test_organization_id, view=view,
        current_user_id=agent_user.id, limit=100, **resolved)
    counts = repo.get_inbox_counts(
        organization_id=test_organization_id, current_user_id=agent_user.id, **resolved)

    assert counts[COUNT_KEY[view]] == len(listed)


def test_views_sort_each_chat_where_it_belongs(db, test_organization_id, agent_user, every_kind):
    repo = ChatRepository(db)

    def listed(view):
        rows = repo.get_recent_chats(
            organization_id=test_organization_id, view=view, current_user_id=agent_user.id)
        return _ids(rows)

    def ids(*names):
        return {str(every_kind[name].session_id) for name in names}

    assert listed(InboxView.MINE) == ids("mine")
    assert listed(InboxView.WAITING) == ids("my_group", "handed_over")
    assert listed(InboxView.AI) == ids("unassigned", "unhappy")
    assert listed(InboxView.NEGATIVE) == ids("unhappy")
    assert listed(InboxView.RESOLVED_BY_AI) == ids("ai_closed")
    assert listed(InboxView.CLOSED) == ids("ai_closed", "person_closed")


def test_counts_split_open_chats_by_channel(db, test_organization_id, every_kind):
    counts = ChatRepository(db).get_inbox_counts(organization_id=test_organization_id)

    assert counts["channels"] == {"web": 5, "whatsapp": 1}


def test_a_channel_filter_lists_only_that_channel(db, test_organization_id, every_kind):
    rows = ChatRepository(db).get_recent_chats(
        organization_id=test_organization_id, view=InboxView.OPEN, channel="whatsapp")

    assert _ids(rows) == {str(every_kind["handed_over"].session_id)}


def test_resolved_today_starts_at_the_callers_midnight(db, test_organization_id, every_kind):
    """A close before the caller's day began is yesterday's."""
    repo = ChatRepository(db)
    every_kind["ai_closed"].closed_at = datetime.now(timezone.utc) - timedelta(hours=3)
    db.commit()

    two_hours_ago = datetime.now(timezone.utc) - timedelta(hours=2)
    four_hours_ago = datetime.now(timezone.utc) - timedelta(hours=4)

    assert repo.get_inbox_counts(
        organization_id=test_organization_id, today_start=two_hours_ago)["resolved_by_ai_today"] == 0
    assert repo.get_inbox_counts(
        organization_id=test_organization_id, today_start=four_hours_ago)["resolved_by_ai_today"] == 1


def test_a_chat_that_was_handed_over_was_not_resolved_by_the_ai(db, test_organization_id, make_session):
    chat = make_session()
    chat.status = SessionStatus.TRANSFERRED
    db.commit()
    chat.status = SessionStatus.CLOSED
    db.commit()

    counts = ChatRepository(db).get_inbox_counts(organization_id=test_organization_id)

    assert counts["resolved_by_ai_today"] == 0


class TestStatusTimes:
    def test_a_handover_records_when_it_happened(self, db, make_session):
        chat = make_session()
        before = datetime.now(timezone.utc)

        SessionToAgentRepository(db).update_session(chat.session_id, {"status": "TRANSFERRED"})

        assert chat.handed_over_at is not None
        assert chat.handed_over_at >= before.replace(tzinfo=chat.handed_over_at.tzinfo)

    def test_saving_a_waiting_chat_again_keeps_its_wait(self, db, make_session):
        chat = make_session()
        chat.status = SessionStatus.TRANSFERRED
        db.commit()
        first = chat.handed_over_at

        chat.status = SessionStatus.TRANSFERRED
        chat.transfer_reason = "FRUSTRATED"
        db.commit()

        assert chat.handed_over_at == first

    def test_a_second_handover_restarts_the_wait(self, db, make_session):
        chat = make_session()
        chat.status = SessionStatus.TRANSFERRED
        db.commit()
        chat.handed_over_at = datetime.now(timezone.utc) - timedelta(hours=1)
        db.commit()
        first = chat.handed_over_at

        SessionToAgentRepository(db).release_to_ai(chat.session_id)
        SessionToAgentRepository(db).update_session_status(chat.session_id, "TRANSFERRED")

        assert chat.handed_over_at > first

    def test_closing_records_when(self, db, make_session):
        chat = make_session()

        SessionToAgentRepository(db).close_session(chat.session_id)

        assert chat.closed_at is not None
        assert chat.handed_over_at is None


class TestReleaseToAi:
    def test_nobody_holds_it_and_no_queue_has_it(self, db, make_session, agent_user, group):
        chat = make_session(user_id=agent_user.id, group_id=group.id)

        assert SessionToAgentRepository(db).release_to_ai(chat.session_id) is True

        assert chat.user_id is None
        assert chat.group_id is None
        assert chat.status == SessionStatus.OPEN


class TestWaitingLongestSort:
    def test_the_longest_wait_comes_first(self, db, test_organization_id, make_session):
        now = datetime.now(timezone.utc)
        recent, oldest, middle = make_session(), make_session(), make_session()
        for chat, waited in ((recent, 5), (oldest, 50), (middle, 20)):
            chat.status = SessionStatus.TRANSFERRED
            db.commit()
            chat.handed_over_at = now - timedelta(minutes=waited)
        db.commit()

        rows = ChatRepository(db).get_recent_chats(
            organization_id=test_organization_id, view=InboxView.WAITING, sort=InboxSort.WAITING_LONGEST)

        assert [str(r["session_id"]) for r in rows] == [
            str(oldest.session_id), str(middle.session_id), str(recent.session_id)]
        assert rows[0]["handed_over_at"] is not None


class TestSearch:
    @pytest.fixture
    def people(self, db, test_organization_id, make_session):
        def person(**fields):
            customer = Customer(id=uuid4(), organization_id=test_organization_id, **fields)
            db.add(customer)
            db.commit()
            chat = make_session()
            chat.customer_id = customer.id
            db.query(ChatHistory).filter(ChatHistory.session_id == chat.session_id).update(
                {ChatHistory.customer_id: customer.id})
            db.commit()
            return chat

        return {
            "priya": person(email="priya@shop.example", full_name="Priya Raman", phone="+44 7700 900123",
                            meta_data={"order_id": "10432"}),
            "sam": person(email="sam_100%@example.com", full_name="Sam Lee"),
        }

    @pytest.mark.parametrize("term, who", [
        ("raman", "priya"),
        ("PRIYA@SHOP", "priya"),
        ("900123", "priya"),
        ("sam_100%", "sam"),
        ("10432", "priya"),
    ])
    def test_finds_a_customer_by_name_email_phone_or_order(self, db, test_organization_id, people, term, who):
        rows = ChatRepository(db).get_recent_chats(organization_id=test_organization_id, search=term)

        assert _ids(rows) == {str(people[who].session_id)}

    def test_like_wildcards_in_the_term_are_literal(self, db, test_organization_id, people):
        """'%' and '_' match only themselves, not any text."""
        rows = ChatRepository(db).get_recent_chats(organization_id=test_organization_id, search="%")

        assert _ids(rows) == {str(people["sam"].session_id)}

    def test_returns_the_phone_for_the_row(self, db, test_organization_id, people):
        rows = ChatRepository(db).get_recent_chats(organization_id=test_organization_id, search="priya")

        assert rows[0]["customer"]["phone"] == "+44 7700 900123"

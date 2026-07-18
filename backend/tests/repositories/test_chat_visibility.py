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

"""Who can see which chats.

The inbox filter and the single-session access check must agree: a session that
appears in the list and 404s when opened is the bug this pins down.
"""

import pytest
from uuid import UUID, uuid4

from sqlalchemy.orm import Session

from app.models.chat_history import ChatHistory
from app.models.customer import Customer
from app.models.session_to_agent import SessionToAgent
from app.models.user import User, UserGroup
from app.repositories.chat import ChatRepository


@pytest.fixture
def customer(db: Session, test_organization_id: UUID) -> Customer:
    customer = Customer(
        id=uuid4(),
        email="visibility@example.com",
        full_name="Visibility Customer",
        organization_id=test_organization_id,
    )
    db.add(customer)
    db.commit()
    return customer


@pytest.fixture
def group(db: Session, test_organization_id: UUID) -> UserGroup:
    group = UserGroup(id=uuid4(), name="Support", organization_id=test_organization_id)
    db.add(group)
    db.commit()
    return group


@pytest.fixture
def agent_user(db: Session, test_organization_id: UUID, group: UserGroup) -> User:
    user = User(
        id=uuid4(),
        email="agent@example.com",
        hashed_password="x",
        full_name="Agent",
        organization_id=test_organization_id,
        is_active=True,
    )
    user.groups.append(group)
    db.add(user)
    db.commit()
    return user


def _session(db, org_id, agent_id, customer_id, *, user_id=None, group_id=None):
    """A session plus one message, so it shows up in the grouped overview."""
    session = SessionToAgent(
        session_id=uuid4(),
        organization_id=org_id,
        agent_id=agent_id,
        customer_id=customer_id,
        user_id=user_id,
        group_id=group_id,
    )
    db.add(session)
    db.commit()
    db.add(ChatHistory(
        message="hello",
        message_type="user",
        session_id=session.session_id,
        organization_id=org_id,
        agent_id=agent_id,
        customer_id=customer_id,
    ))
    db.commit()
    return session


@pytest.fixture
def sessions(db, test_organization_id, test_agent, customer, agent_user, group):
    """One session of each ownership kind."""
    other_user = User(
        id=uuid4(), email="other@example.com", hashed_password="x",
        full_name="Other", organization_id=test_organization_id, is_active=True,
    )
    db.add(other_user)
    db.commit()

    return {
        "mine": _session(db, test_organization_id, test_agent.id, customer.id, user_id=agent_user.id),
        "my_group": _session(db, test_organization_id, test_agent.id, customer.id, group_id=group.id),
        "unassigned": _session(db, test_organization_id, test_agent.id, customer.id),
        "other_agents": _session(db, test_organization_id, test_agent.id, customer.id, user_id=other_user.id),
    }


def _ids(rows):
    return {str(r["session_id"]) for r in rows}


def test_assigned_only_excludes_the_ai_queue(db, test_organization_id, agent_user, group, sessions):
    """Without view_unassigned_chats an agent sees only their own and their group's."""
    rows = ChatRepository(db).get_recent_chats(
        organization_id=test_organization_id,
        user_id=agent_user.id,
        user_groups=[str(group.id)],
        include_unassigned=False,
    )

    assert str(sessions["mine"].session_id) in _ids(rows)
    assert str(sessions["my_group"].session_id) in _ids(rows)
    assert str(sessions["unassigned"].session_id) not in _ids(rows)
    assert str(sessions["other_agents"].session_id) not in _ids(rows)


def test_unassigned_grant_adds_the_ai_queue_but_not_other_agents(
    db, test_organization_id, agent_user, group, sessions
):
    """The queue becomes visible; another agent's conversation stays private."""
    rows = ChatRepository(db).get_recent_chats(
        organization_id=test_organization_id,
        user_id=agent_user.id,
        user_groups=[str(group.id)],
        include_unassigned=True,
    )

    assert str(sessions["unassigned"].session_id) in _ids(rows)
    assert str(sessions["mine"].session_id) in _ids(rows)
    assert str(sessions["my_group"].session_id) in _ids(rows)
    assert str(sessions["other_agents"].session_id) not in _ids(rows)


def test_queue_only_role_sees_every_unclaimed_chat_and_nothing_owned(
    db, test_organization_id, sessions
):
    """view_unassigned_chats alone: everything nobody holds, nothing owned.

    A chat transferred to a group is still unclaimed, so it belongs to the
    queue — that is the point of the grant, not an accident of the filter.
    """
    rows = ChatRepository(db).get_recent_chats(
        organization_id=test_organization_id,
        user_id=None,
        user_groups=None,
        include_unassigned=True,
    )

    assert _ids(rows) == {
        str(sessions["unassigned"].session_id),
        str(sessions["my_group"].session_id),
    }


@pytest.mark.asyncio
async def test_session_access_matches_the_list_filter(
    db, agent_user, group, sessions
):
    """check_session_access must mirror get_recent_chats, or a listed chat 404s."""
    repo = ChatRepository(db)
    groups = [str(group.id)]

    # Without the queue grant
    assert await repo.check_session_access(sessions["mine"].session_id, agent_user.id, groups) is True
    assert await repo.check_session_access(sessions["my_group"].session_id, agent_user.id, groups) is True
    assert await repo.check_session_access(sessions["unassigned"].session_id, agent_user.id, groups) is False
    assert await repo.check_session_access(sessions["other_agents"].session_id, agent_user.id, groups) is False

    # With it, only the unclaimed one opens up
    assert await repo.check_session_access(
        sessions["unassigned"].session_id, agent_user.id, groups, include_unassigned=True) is True
    assert await repo.check_session_access(
        sessions["other_agents"].session_id, agent_user.id, groups, include_unassigned=True) is False


@pytest.mark.asyncio
async def test_no_user_id_never_matches_an_unassigned_session(db, sessions):
    """A caller with no assigned-chat grant passes user_id=None; NULL == NULL
    must not hand them every unclaimed session by accident."""
    repo = ChatRepository(db)

    assert await repo.check_session_access(
        sessions["unassigned"].session_id, None, [], include_unassigned=False) is False
    assert await repo.check_session_access(
        sessions["unassigned"].session_id, None, [], include_unassigned=True) is True

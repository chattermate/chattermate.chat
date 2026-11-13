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

"""Inbox fixtures shared by the visibility and view tests: a customer, a
support group with one agent in it, and one listed session of each kind of
ownership."""

import pytest
from uuid import UUID, uuid4

from sqlalchemy.orm import Session

from app.models.chat_history import ChatHistory
from app.models.customer import Customer
from app.models.session_to_agent import SessionToAgent
from app.models.user import User, UserGroup


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


def _session(db, org_id, agent_id, customer_id, *, user_id=None, group_id=None, channel="web"):
    """A session plus one message, so it shows up in the grouped overview."""
    session = SessionToAgent(
        session_id=uuid4(),
        organization_id=org_id,
        agent_id=agent_id,
        customer_id=customer_id,
        user_id=user_id,
        group_id=group_id,
        channel=channel,
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
def make_session(db, test_organization_id, test_agent, customer):
    """Another listed session in the test organization, owned as asked."""
    def make(**kwargs):
        return _session(db, test_organization_id, test_agent.id, customer.id, **kwargs)
    return make


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

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

from uuid import uuid4

import pytest

from app.models.chat_history import ChatHistory
from app.models.customer import Customer
from app.models.session_to_agent import SessionToAgent
from app.repositories.chat import ChatRepository


@pytest.fixture
def customer(db, test_organization_id):
    row = Customer(id=uuid4(), email="messages@example.com", organization_id=test_organization_id)
    db.add(row)
    db.commit()
    return row


def conversation(db, org_id, agent_id, customer_id, *messages):
    session = SessionToAgent(session_id=uuid4(), organization_id=org_id, agent_id=agent_id,
                             customer_id=customer_id)
    db.add(session)
    db.commit()
    for message_type, text in messages:
        db.add(ChatHistory(session_id=session.session_id, organization_id=org_id, agent_id=agent_id,
                           customer_id=customer_id, message=text, message_type=message_type))
    db.commit()
    return session.session_id


@pytest.mark.parametrize("as_text", [False, True])
def test_only_what_the_customer_wrote_in_this_conversation(db, test_organization_id, test_agent, customer, as_text):
    ids = (test_organization_id, test_agent.id, customer.id)
    session_id = conversation(db, *ids, ("user", "order 1001"), ("bot", "Your email is a@b.co?"),
                              ("agent", "hi"), ("user", "a@b.co"))
    conversation(db, *ids, ("user", "someone else's chat"))

    messages = ChatRepository(db).get_customer_messages(str(session_id) if as_text else session_id)

    assert messages == ["order 1001", "a@b.co"]


def test_an_empty_conversation_has_no_messages(db):
    assert ChatRepository(db).get_customer_messages(uuid4()) == []

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
from uuid import uuid4

from app.channels.constants import MessageSource, UNMETERED_SOURCES
from app.models.chat_history import ChatHistory
from app.repositories.chat import ChatRepository
from app.services.host_prompt import (
    HOST_PROMPT_MAX_CHARS, clean_host_prompt, host_prompt_context, store_host_prompt,
)


def test_clean_rejects_non_text_and_caps_length():
    assert clean_host_prompt(None) is None
    assert clean_host_prompt(5) is None
    assert clean_host_prompt("   ") is None
    assert len(clean_host_prompt("x" * (HOST_PROMPT_MAX_CHARS + 50))) == HOST_PROMPT_MAX_CHARS


def test_clean_strips_markup_and_secrets():
    cleaned = clean_host_prompt("<script>alert(1)</script>Your password: hunter2")
    assert "<script>" not in cleaned
    assert "hunter2" not in cleaned


def test_context_fences_the_prompt():
    text = host_prompt_context("Need help with billing?")
    assert "UNTRUSTED APP MESSAGE" in text and "Need help with billing?" in text
    assert host_prompt_context(None) is None


def test_stored_prompt_is_unmetered(db, test_agent, test_customer):
    session = {
        "session_id": str(uuid4()), "org_id": str(test_agent.organization_id),
        "agent_id": str(test_agent.id), "customer_id": str(test_customer.id),
    }
    store_host_prompt(db, session, "Need help with billing?")
    row = db.query(ChatHistory).one()
    assert row.message_type == "bot"
    assert row.attributes == {"source": MessageSource.HOST.value}
    assert MessageSource.HOST.value in UNMETERED_SOURCES
    now = datetime.now(timezone.utc)
    repo = ChatRepository(db)
    window = (now - timedelta(days=1), now + timedelta(days=1))
    assert repo.get_message_count_for_period(test_agent.organization_id, *window) == 0
    # An AI reply in the same conversation still counts.
    repo.create_message({**{k: v for k, v in session.items() if k != "org_id"},
                         "organization_id": session["org_id"], "message": "Sure", "message_type": "bot"})
    assert repo.get_message_count_for_period(test_agent.organization_id, *window) == 1

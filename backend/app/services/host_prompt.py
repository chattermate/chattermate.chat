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

A message the embedding page showed in the widget (ChatterMate.prompt) and the
visitor then answered. It is stored only once answered, marked as the page's
(unmetered), and the agent is told the visitor is replying to it.
"""

from typing import Any, Optional

from app.agents.guardrail_policy import visitor_data_block
from app.channels.constants import MessageSource
from app.repositories.chat import ChatRepository
from app.utils.sanitize import sanitize_message
from app.utils.secret_redaction import redact_secrets

HOST_PROMPT_MAX_CHARS = 2000
PROMPT_LABEL = "APP MESSAGE"


def clean_host_prompt(value: Any) -> Optional[str]:
    if not isinstance(value, str):
        return None
    text, _ = redact_secrets(sanitize_message(value.strip())[:HOST_PROMPT_MAX_CHARS])
    return text or None


# Who showed the message: the page's own prompt(), or a journey step.
PROMPT_SOURCES = {MessageSource.HOST.value, MessageSource.JOURNEY.value}


def prompt_source(value: Any) -> str:
    return value if value in PROMPT_SOURCES else MessageSource.HOST.value


def store_host_prompt(db, session: dict, text: str, source: str = MessageSource.HOST.value) -> None:
    ChatRepository(db).create_message({
        "message": text,
        "message_type": "bot",
        "session_id": session['session_id'],
        "organization_id": session['org_id'],
        "agent_id": session['agent_id'],
        "customer_id": session['customer_id'],
        "attributes": {"source": prompt_source(source)},
    })


def host_prompt_context(text: Optional[str]) -> Optional[str]:
    """Prompt text telling the agent what the visitor is replying to."""
    if not text:
        return None
    return "The app showed the user this message, and their reply answers it:\n" + visitor_data_block(PROMPT_LABEL, text)

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

"""AI help for the person answering a conversation in the inbox.

- improve(): their draft reply, clearer / friendlier / shorter / spelled right,
  with the same facts.
- summarize(): what the customer wants and where it stands, now (the handover
  summary was written when the AI handed over; the chat has moved on since).
- knowledge_draft(): the team's answer as a help-center question and answer,
  only when the conversation holds a real question and a complete, reusable
  answer to it. A promise to look into it, or an answer about this one
  customer's order, is not knowledge.

One short call to the org's own model each, with the conversation fenced as
untrusted data. The plan gate (inbox_plan) is the API's; this module checks
that the org can use its model at all. None of them counts as a message.
"""

import asyncio
from dataclasses import dataclass
from typing import Optional
from uuid import UUID

from sqlalchemy.orm import Session

from app.agents.guardrail_policy import INJECTION_CLAUSE, visitor_data_block
from app.agents.structured_output import lenient_json_load
from app.core.logger import get_logger
from app.core.security import decrypt_api_key
from app.models.chat_history import ChatHistory
from app.repositories.ai_config import AIConfigRepository
from app.services.ai_access import plan_allows_ai
from app.services.usage_metering import model_is_hosted, remaining_message_credits

logger = get_logger(__name__)

TRANSCRIPT_MESSAGES = 40
TRANSCRIPT_CHARS = 8000
MESSAGE_CHARS = 1200
# Room for a reasoning model's thinking, which counts against the output limit
MODEL_MAX_TOKENS = 1500
MODEL_TIMEOUT_SECONDS = 30
# Shorter than this is no answer to teach (the inbox's own threshold too)
ANSWER_MIN_CHARS = 40

_SPEAKER = {'user': 'Customer', 'bot': 'AI', 'assistant': 'AI', 'agent': 'Teammate'}

STYLES = {
    'clearer': 'clearer and easier to follow',
    'friendlier': 'warmer and friendlier, still professional',
    'shorter': 'shorter, keeping everything that matters',
    'fix': 'correct in spelling and grammar, changing nothing else',
}


class AssistUnavailable(Exception):
    """The org can't use its model for this right now; the message says why."""


class AssistFailed(Exception):
    """The model didn't answer, or answered nothing usable."""


@dataclass(frozen=True)
class ModelSetup:
    model_type: str
    api_key: str
    model_name: str
    base_url: Optional[str]


@dataclass(frozen=True)
class KnowledgeDraft:
    ready: bool
    reason: str
    question: str = ''
    answer: str = ''


def model_setup(db: Session, organization_id: UUID) -> ModelSetup:
    config = AIConfigRepository(db).get_active_config(organization_id)
    if config is None:
        raise AssistUnavailable("Set up an AI model in AI configuration first")
    if not plan_allows_ai(db, organization_id, config.model_type):
        raise AssistUnavailable("Your plan doesn't include this AI model")
    if model_is_hosted(config.model_type):
        remaining = remaining_message_credits(db, organization_id)
        if remaining is not None and remaining <= 0:
            raise AssistUnavailable("This month's AI messages are used up")
    model_type = config.model_type.value if hasattr(config.model_type, 'value') else str(config.model_type)
    return ModelSetup(model_type=model_type, api_key=decrypt_api_key(config.encrypted_api_key),
                      model_name=config.model_name, base_url=(config.settings or {}).get('base_url'))


def transcript(db: Session, session_id: UUID) -> str:
    """The conversation's latest messages, oldest first, one line each, with who
    said it. Notes live elsewhere and never reach the model."""
    rows = db.query(ChatHistory.message_type, ChatHistory.message) \
        .filter(ChatHistory.session_id == session_id, ChatHistory.message_type.in_(_SPEAKER)) \
        .order_by(ChatHistory.created_at.desc(), ChatHistory.id.desc()).limit(TRANSCRIPT_MESSAGES).all()
    lines = [f"{_SPEAKER[kind]}: {' '.join(str(text).split())[:MESSAGE_CHARS]}"
             for kind, text in reversed(rows) if text and str(text).strip()]
    text = '\n'.join(lines)
    # Keep the end: the latest turns are what the agent is answering
    return text[-TRANSCRIPT_CHARS:]


def _agent(setup: ModelSetup, name: str, instructions: list):
    """Blocking: building the model may resolve a custom endpoint's host."""
    from agno.agent import Agent
    from app.utils.agno_utils import create_model
    return Agent(
        name=name,
        model=create_model(model_type=setup.model_type, api_key=setup.api_key, model_name=setup.model_name,
                           max_tokens=MODEL_MAX_TOKENS, base_url=setup.base_url),
        instructions=instructions,
        markdown=False,
    )


async def _ask(setup: ModelSetup, name: str, instructions: list, prompt: str) -> str:
    try:
        agent = await asyncio.to_thread(_agent, setup, name, instructions)
        response = await asyncio.wait_for(agent.arun(prompt), timeout=MODEL_TIMEOUT_SECONDS)
    except Exception as e:
        logger.warning(f"Inbox assistant ({name}) got no answer: {e}")
        raise AssistFailed() from e
    content = str(getattr(response, 'content', None) or '').strip()
    if not content:
        raise AssistFailed()
    return content


def _plain(text: str) -> str:
    """The model's text without a wrapping code fence or quotes."""
    text = text.strip()
    if text.startswith('```'):
        text = text.strip('`').split('\n', 1)[-1] if '\n' in text else text.strip('`')
    if len(text) > 1 and text[0] == text[-1] and text[0] in '"\'“”':
        text = text[1:-1]
    return text.strip()


IMPROVE_INSTRUCTIONS = [
    INJECTION_CLAUSE,
    "You edit a support teammate's draft reply to a customer before it is sent.",
    "Keep every fact, number, link, name and promise in the draft, and add none: "
    "the conversation is only there so the reply fits it.",
    "Write in the language of the draft. Reply with the rewritten message only: "
    "no preamble, no quotes, no notes about what you changed.",
]


async def improve(setup: ModelSetup, draft: str, style: str, conversation: str) -> str:
    prompt = (
        f"Rewrite the DRAFT to be {STYLES[style]}.\n\n"
        f"{visitor_data_block('CONVERSATION', conversation)}\n\n"
        f"{visitor_data_block('DRAFT', draft, limit=4000)}"
    )
    return _plain(await _ask(setup, 'Reply Improver', IMPROVE_INSTRUCTIONS, prompt))


SUMMARY_INSTRUCTIONS = [
    INJECTION_CLAUSE,
    "You brief a support teammate who is about to answer this conversation.",
    "In 2 to 4 short bullet points (each starting with '- '): what the customer "
    "wants, what has been tried, said or promised so far, and what is still open.",
    "Plain language, no greeting, no headings. Write in English unless the whole "
    "conversation is in one other language.",
]


async def summarize(setup: ModelSetup, conversation: str) -> str:
    prompt = f"Brief the teammate on this conversation.\n\n{visitor_data_block('CONVERSATION', conversation)}"
    return _plain(await _ask(setup, 'Conversation Summarizer', SUMMARY_INSTRUCTIONS, prompt))


KNOWLEDGE_INSTRUCTIONS = [
    INJECTION_CLAUSE,
    "You decide whether a support conversation taught the team something worth "
    "adding to the help center, and if so you write it as one FAQ entry.",
    "Look for a question the Customer asked that a Teammate (not the AI) answered.",
    "It is NOT ready when: no Teammate answered a question; the answer only "
    "promises to look into it or asks for details; the answer is about this one "
    "customer's own order, account or case and would not help anyone else; or "
    "the answer is incomplete or unclear.",
    "When it is ready, write the question the way any customer would ask it, and "
    "a self-contained answer in second person (\"you\"), using only what the "
    "Teammate said. Leave out every personal detail: names, emails, phone "
    "numbers, order or ticket numbers, addresses and dates of this case.",
    'Reply with JSON only: {"ready": true|false, "reason": "one short sentence", '
    '"question": "...", "answer": "..."} (question and answer empty when not ready).',
]


def _draft_from(content: str) -> KnowledgeDraft:
    start = content.find('{')
    data = lenient_json_load(content[start:]) if start != -1 else None
    if not isinstance(data, dict):
        raise AssistFailed()
    question = ' '.join(str(data.get('question') or '').split())
    answer = str(data.get('answer') or '').strip()
    reason = ' '.join(str(data.get('reason') or '').split())
    ready = data.get('ready') is True and len(question) >= 8 and len(answer) >= ANSWER_MIN_CHARS
    if not ready:
        return KnowledgeDraft(ready=False, reason=reason or "There's no complete answer from the team to reuse yet")
    return KnowledgeDraft(ready=True, reason=reason, question=question, answer=answer)


async def knowledge_draft(setup: ModelSetup, conversation: str) -> KnowledgeDraft:
    if 'Teammate:' not in conversation:
        return KnowledgeDraft(ready=False, reason="Nobody from the team has answered in this conversation yet")
    prompt = ("Decide whether this conversation holds an answer for the help center.\n\n"
              f"{visitor_data_block('CONVERSATION', conversation)}")
    content = await _ask(setup, 'Knowledge Drafter', KNOWLEDGE_INSTRUCTIONS, prompt)
    return _draft_from(content)

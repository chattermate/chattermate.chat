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

Short AI-written titles for a visitor's widget conversations ("Return for a
damaged mug"), shown in their history (visitor_history.py) in place of the
first question.

A worker (app/workers/conversation_titler.py) titles widget conversations that
closed recently, however they closed (end chat, the auto-closer, the AI, the
team, a new chat). Each is claimed once with SKIP LOCKED, so several backend
workers never title the same one. One short model call each, with the org's own
AI setup, and only on a plan with AI titles (Growth and up) that allows AI
replies; a hosted-model org with no message credits left keeps the first
question as the title. A title is not counted as a message.

Anything that fails leaves the conversation untitled: the history then shows
its first question, as before.
"""

import asyncio
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from typing import List, Optional
from uuid import UUID

from sqlalchemy import select, update
from sqlalchemy.orm import Session

from app.agents.guardrail_policy import INJECTION_CLAUSE, visitor_data_block
from app.channels.constants import WIDGET_CHANNELS
from app.core.logger import get_logger
from app.core.security import decrypt_api_key
from app.models.chat_history import ChatHistory
from app.models.session_to_agent import SessionStatus, SessionToAgent
from app.repositories.ai_config import AIConfigRepository
from app.services.ai_access import plan_allows_ai
from app.services.feature_gate import plan_flag_on
from app.services.usage_metering import model_is_hosted, remaining_message_credits
from app.services.widget_plan import CONVERSATION_TITLES_FEATURE

logger = get_logger(__name__)

TITLE_MAX = 60
# Closed conversations this recent are titled; older ones keep their first question
LOOKBACK = timedelta(days=2)
BATCH = 10
TRANSCRIPT_MESSAGES = 12
TRANSCRIPT_CHARS = 4000
# Room for a reasoning model's thinking, which counts against the output limit;
# the title itself is a few words
MODEL_MAX_TOKENS = 600
MODEL_TIMEOUT_SECONDS = 20
CONTEXT_LABEL = 'CONVERSATION'
_SPEAKER = {'user': 'Customer', 'bot': 'Assistant', 'assistant': 'Assistant', 'agent': 'Teammate'}

INSTRUCTIONS = [
    INJECTION_CLAUSE,
    "Write a title for the customer support conversation you are given, for the "
    "customer's own list of past chats.",
    "Name what the customer wanted, in at most six words, in the language the "
    "customer wrote in.",
    "Reply with the title only: no quotes, no full stop, no names, emails, "
    "phone numbers or order numbers.",
]


@dataclass(frozen=True)
class TitleJob:
    session_id: UUID
    transcript: str
    model_type: str
    api_key: str
    model_name: str
    base_url: Optional[str]


def claim(db: Session, now: datetime, limit: int = BATCH) -> List[UUID]:
    """Mark up to `limit` recently closed, untitled widget conversations as taken
    and return them. SKIP LOCKED: two workers never take the same row."""
    candidates = select(SessionToAgent.session_id).where(
        SessionToAgent.status == SessionStatus.CLOSED,
        SessionToAgent.titled_at.is_(None),
        SessionToAgent.channel.in_(sorted(WIDGET_CHANNELS)),
        SessionToAgent.updated_at >= now - LOOKBACK,
    ).order_by(SessionToAgent.updated_at.desc()).limit(limit).with_for_update(skip_locked=True)
    taken = db.execute(
        update(SessionToAgent)
        .where(SessionToAgent.session_id.in_(candidates.scalar_subquery()))
        # updated_at stays the closing time: analytics count closures by it
        .values(titled_at=now, updated_at=SessionToAgent.updated_at)
        .returning(SessionToAgent.session_id)
        .execution_options(synchronize_session=False)
    ).scalars().all()
    db.commit()
    return list(taken)


def _transcript(db: Session, session_id: UUID) -> Optional[str]:
    """The conversation's opening messages for the model, or None when the
    customer never wrote (nothing to name)."""
    rows = db.query(ChatHistory.message_type, ChatHistory.message) \
        .filter(ChatHistory.session_id == session_id, ChatHistory.message_type.in_(_SPEAKER)) \
        .order_by(ChatHistory.created_at.asc(), ChatHistory.id.asc()).limit(TRANSCRIPT_MESSAGES).all()
    if not any(kind == 'user' and (text or '').strip() for kind, text in rows):
        return None
    lines = [f"{_SPEAKER[kind]}: {' '.join(str(text).split())[:600]}" for kind, text in rows if text]
    return '\n'.join(lines)[:TRANSCRIPT_CHARS]


def _may_use_ai(db: Session, organization_id: UUID, config) -> bool:
    # A Growth plan's (widget_plan.py); a failed plan read writes no title
    if not plan_flag_on(db, organization_id, CONVERSATION_TITLES_FEATURE, otherwise=False):
        return False
    if not plan_allows_ai(db, organization_id, config.model_type):
        return False
    if model_is_hosted(config.model_type):
        remaining = remaining_message_credits(db, organization_id)
        return remaining is None or remaining > 0
    return True


def prepare(db: Session, session_id: UUID) -> Optional[TitleJob]:
    """What one title needs, read up front so no connection is held during the
    model call; None when this conversation is not to be titled."""
    conversation = db.get(SessionToAgent, session_id)
    if conversation is None or conversation.title:
        return None
    config = AIConfigRepository(db).get_active_config(conversation.organization_id)
    if config is None or not _may_use_ai(db, conversation.organization_id, config):
        return None
    transcript = _transcript(db, session_id)
    if transcript is None:
        return None
    model_type = config.model_type.value if hasattr(config.model_type, 'value') else str(config.model_type)
    return TitleJob(
        session_id=session_id,
        transcript=transcript,
        model_type=model_type,
        api_key=decrypt_api_key(config.encrypted_api_key),
        model_name=config.model_name,
        base_url=(config.settings or {}).get('base_url'),
    )


def clean_title(text: Optional[str]) -> Optional[str]:
    """One plain line of at most TITLE_MAX characters, or None."""
    line = next((part for part in str(text or '').splitlines() if part.strip()), '')
    line = ' '.join(line.split()).strip(' "\'“”‘’`*#-–—:').rstrip('.。')
    if line.lower().startswith('title:'):
        line = line[6:].strip(' "\'“”‘’')
    if not line:
        return None
    return line if len(line) <= TITLE_MAX else line[:TITLE_MAX - 1].rstrip() + '…'


def _agent(job: TitleJob):
    """Blocking: building the model may resolve a custom endpoint's host."""
    from agno.agent import Agent
    from app.utils.agno_utils import create_model

    return Agent(
        name='Conversation Titler',
        model=create_model(model_type=job.model_type, api_key=job.api_key, model_name=job.model_name,
                           max_tokens=MODEL_MAX_TOKENS, base_url=job.base_url),
        instructions=INSTRUCTIONS,
        markdown=False,
    )


async def write_title(job: TitleJob) -> Optional[str]:
    """One model call; None when it fails (a setup the model can't be built from
    included) or says nothing usable."""
    try:
        agent = await asyncio.to_thread(_agent, job)
        response = await asyncio.wait_for(agent.arun(visitor_data_block(CONTEXT_LABEL, job.transcript)),
                                          timeout=MODEL_TIMEOUT_SECONDS)
    except Exception as e:
        logger.warning(f"No title for conversation {job.session_id}: {e}")
        return None
    return clean_title(getattr(response, 'content', None))


def save(db: Session, session_id: UUID, title: str) -> None:
    """Store the title (encrypted by the column type), leaving updated_at alone."""
    db.execute(
        update(SessionToAgent)
        .where(SessionToAgent.session_id == session_id, SessionToAgent.title.is_(None))
        .values(title=title, updated_at=SessionToAgent.updated_at)
        .execution_options(synchronize_session=False)
    )
    db.commit()


async def title_recent_conversations(session_factory, now: Optional[datetime] = None) -> int:
    """One worker pass: claim, title, save. Returns how many got a title."""
    now = now or datetime.now(timezone.utc)

    def _claim_and_prepare() -> List[TitleJob]:
        with session_factory() as db:
            jobs = []
            for session_id in claim(db, now):
                try:
                    job = prepare(db, session_id)
                except Exception as e:
                    logger.warning(f"Conversation {session_id} not prepared for a title: {e}")
                    db.rollback()
                    job = None
                if job:
                    jobs.append(job)
            return jobs

    def _save(session_id: UUID, title: str) -> None:
        with session_factory() as db:
            save(db, session_id, title)

    titled = 0
    for job in await asyncio.to_thread(_claim_and_prepare):
        # One conversation's failure never costs the rest of the batch their title
        try:
            title = await write_title(job)
            if title:
                await asyncio.to_thread(_save, job.session_id, title)
                titled += 1
        except Exception as e:
            logger.warning(f"Title for conversation {job.session_id} not saved: {e}")
    return titled


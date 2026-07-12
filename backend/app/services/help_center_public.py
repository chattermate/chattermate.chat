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

Public help-center domain logic: resolve the Host header to an org's
published help center, group its FAQs, and answer "Ask AI" questions grounded
in the mapped agent's knowledge. No admin auth here — everything must stay
read-only against published data.
"""

import asyncio
from typing import List, Optional, Tuple

from sqlalchemy.orm import Session

from app.core.help_center_host import normalize_host, slug_for_host  # noqa: F401 — canonical host helpers re-exported for the public app
from app.core.logger import get_logger
from app.database import SessionLocal
from app.models.faq import FAQ
from app.models.help_center import HelpCenterSettings
from app.repositories.faq import FAQRepository
from app.repositories.help_center import HelpCenterQueryRepository, HelpCenterRepository
from app.services.help_center_access import help_center_allowed

logger = get_logger(__name__)

MAX_QUESTION_CHARS = 500
ANSWER_MAX_TOKENS = 600
_ASK_FAQ_CONTEXT_LIMIT = 5
# Unauthenticated LLM calls are expensive: bound how many run at once per
# worker so /ask can't drain the DB pool or the provider budget.
_ask_concurrency = asyncio.Semaphore(4)

_ASK_INSTRUCTIONS = """You answer a customer's question on a public help center.

Use ONLY the CONTEXT below (knowledge excerpts and published FAQs). If the
context doesn't contain the answer, say you don't know and suggest contacting
support — never invent facts, prices or URLs. Answer in 1-4 short sentences of
plain text (no markdown), in a friendly second-person voice."""


def resolve_help_center(db: Session, host: str) -> Optional[HelpCenterSettings]:
    """Host header → enabled help center row, or None (renders as 404).
    Custom domains only match once verified; plan lapses hide the site."""
    repo = HelpCenterRepository(db)
    slug = slug_for_host(host)
    if slug:
        row = repo.get_by_slug(slug)
    else:
        row = repo.get_by_verified_domain(host)
    if not row or not row.enabled:
        return None
    if not help_center_allowed(db, row.organization_id):
        return None
    return row


def published_faq_groups(
    db: Session, row: HelpCenterSettings, search: Optional[str] = None
) -> List[Tuple[str, List[FAQ]]]:
    """Published FAQs grouped by category, in display order."""
    faqs = FAQRepository(db).get_published_for_org(row.organization_id, search=search)
    groups: dict = {}
    for faq in faqs:
        groups.setdefault(faq.category, []).append(faq)
    return list(groups.items())


def contrast_ink(hex_color: str) -> str:
    """Dark or light text over the brand color (WCAG relative luminance)."""
    try:
        value = hex_color.lstrip("#")
        if len(value) == 3:
            value = "".join(ch * 2 for ch in value)
        r, g, b = (int(value[i:i + 2], 16) / 255 for i in (0, 2, 4))

        def linear(c: float) -> float:
            return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4

        luminance = 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b)
        return "#12131A" if luminance > 0.45 else "#FFFFFF"
    except (ValueError, IndexError):
        return "#FFFFFF"


def widget_id_for(row: HelpCenterSettings) -> Optional[str]:
    """The chat widget embedded on the page: the mapped agent's widget."""
    if not (row.ai_search_enabled and row.agent and row.agent.widgets):
        return None
    return row.agent.widgets[0].id


def ask_available(row: HelpCenterSettings) -> bool:
    return bool(row.ai_search_enabled and row.agent_id)


def _rank_faqs_by_overlap(faqs: List[FAQ], question: str, limit: int) -> List[FAQ]:
    """Word-overlap ranking: a natural-language question almost never matches
    an FAQ as a whole-string ILIKE, so score by shared words instead."""
    words = {w for w in question.casefold().split() if len(w) > 3}
    if not words:
        return faqs[:limit]
    scored = sorted(
        faqs,
        key=lambda f: -len(words & set(f"{f.question} {f.answer}".casefold().split())),
    )
    return scored[:limit]


async def answer_question(organization_id, agent_id, question: str) -> Optional[str]:
    """One-shot grounded answer from the mapped agent's knowledge + published
    FAQs. Returns None when no confident answer could be produced. Writes the
    ask-log row (metering/analytics); never touches chat history or the KB.

    Uses its own short-lived DB sessions on either side of the slow LLM await —
    holding a pooled connection through a 5-30s model call would let this
    unauthenticated endpoint drain the pool for the whole backend.
    """
    from agno.agent import Agent

    from app.core.security import decrypt_api_key
    from app.repositories.ai_config import AIConfigRepository
    from app.utils.agno_utils import create_model

    question = question.strip()[:MAX_QUESTION_CHARS]

    async with _ask_concurrency:
        with SessionLocal() as db:
            config = AIConfigRepository(db).get_active_config(organization_id)
            if not config:
                return None
            model_type = config.model_type.value if hasattr(config.model_type, "value") else str(config.model_type)
            model_name = config.model_name
            api_key = decrypt_api_key(config.encrypted_api_key)
            published = FAQRepository(db).get_published_for_org(organization_id)
        faq_context = "\n\n".join(
            f"Q: {faq.question}\nA: {faq.answer}"
            for faq in _rank_faqs_by_overlap(published, question, _ASK_FAQ_CONTEXT_LIMIT)
        )

        # Vector retrieval scoped to the mapped agent's sources. Constructed
        # inside the thread: the tool's __init__ does sync DB work.
        def _search() -> str:
            from app.tools.knowledge_search_byagent import KnowledgeSearchByAgent
            tool = KnowledgeSearchByAgent(agent_id=str(agent_id), org_id=organization_id)
            return tool.search_knowledge_base(question)

        knowledge_context = await asyncio.to_thread(_search)

        model = create_model(
            model_type=model_type, api_key=api_key, model_name=model_name, max_tokens=ANSWER_MAX_TOKENS
        )
        agent = Agent(name="Help Center Answers", model=model, instructions=_ASK_INSTRUCTIONS, markdown=False)
        answered = False
        answer = None
        try:
            response = await agent.arun(
                message=f"CONTEXT:\n{knowledge_context}\n\nPUBLISHED FAQS:\n{faq_context}\n\nQUESTION: {question}",
                stream=False,
            )
            content = getattr(response, "content", None)
            if isinstance(content, str) and content.strip():
                answer = content.strip()
                answered = True
        except Exception as e:
            logger.error(f"Help center ask failed for org {organization_id}: {e}")
        finally:
            try:
                with SessionLocal() as log_db:
                    HelpCenterQueryRepository(log_db).log(organization_id, question, answered=answered)
            except Exception as log_err:
                logger.error(f"Help center ask log failed: {log_err}")
    return answer

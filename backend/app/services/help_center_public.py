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
# Unauthenticated LLM calls are expensive: bound how many run at once per
# worker so /ask can't drain the DB pool or the provider budget.
_ask_concurrency = asyncio.Semaphore(4)

_ASK_INSTRUCTIONS = """You are the support assistant on a company's public help center. A visitor has asked a question.

You have tools to look up the answer:
- search_faqs: search the published help-center FAQs.
- search_knowledge_base: search the company's wider knowledge base (only available when the help center is mapped to an agent).

ALWAYS use the tools before answering — start with search_faqs, and also try
search_knowledge_base for anything the FAQs don't cover. You may call a tool more
than once with different wording if the first result isn't relevant.

Answer ONLY from what the tools return. When they surface a relevant answer, reply
in 1-4 short sentences of plain text (no markdown), in a friendly second-person
voice. If, after genuinely searching, you find nothing relevant, briefly say you
couldn't find that in the help center and suggest starting a chat or contacting
support. Never invent facts, prices, policies, or URLs."""


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


# Topic accent colors, applied by category display order (matches the index and
# article templates). Kept here so list cards, sidebar topics, the article tag
# and related cards all resolve the SAME color for a given category.
CATEGORY_PALETTE = [
    "#6d5bd0", "#0e8c8c", "#cf5b38", "#2a6fdb", "#1f8a5b", "#b0468a", "#c98a1e", "#3a6f8f",
]


def published_faq_groups(
    db: Session, row: HelpCenterSettings, search: Optional[str] = None
) -> List[Tuple[str, List[FAQ]]]:
    """Published FAQs grouped by category, in display order."""
    faqs = FAQRepository(db).get_published_for_org(row.organization_id, search=search)
    groups: dict = {}
    for faq in faqs:
        groups.setdefault(faq.category, []).append(faq)
    return list(groups.items())


def category_colors(categories) -> dict:
    """category name -> accent hex, by display order."""
    return {c: CATEGORY_PALETTE[i % len(CATEGORY_PALETTE)] for i, c in enumerate(categories)}


def get_published_article(db: Session, row: HelpCenterSettings, slug: str) -> Optional[FAQ]:
    """A single published FAQ by slug for the /a/{slug} article page."""
    return FAQRepository(db).get_published_by_slug(row.organization_id, slug)


def related_articles(db: Session, row: HelpCenterSettings, faq: FAQ, limit: int = 4) -> List[FAQ]:
    """Other published FAQs in the same category — the article's related list."""
    return FAQRepository(db).get_published_related(
        row.organization_id, faq.category, faq.id, limit=limit
    )


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
    """The chat widget embedded on the page: the mapped agent's widget. Gated by
    its own toggle, independent of the AI quick-summary in search."""
    if not (row.chat_widget_enabled and row.agent and row.agent.widgets):
        return None
    return row.agent.widgets[0].id


def ask_available(row: HelpCenterSettings) -> bool:
    return bool(row.ai_search_enabled and row.agent_id)


async def answer_question(organization_id, agent_id, question: str) -> Optional[str]:
    """Grounded answer for a public help-center question. The agent is given
    FAQ + knowledge search tools and decides what to look up, so it can find and
    combine answers instead of relying on a single pre-stuffed context. Returns
    None when no confident answer could be produced. Writes the ask-log row
    (metering/analytics); never touches chat history or the KB.

    The whole tool-using run happens in a worker thread: the tools do synchronous
    DB work, and holding a pooled connection through a multi-second model call
    would let this unauthenticated endpoint drain the pool for the backend.
    """
    from app.core.security import decrypt_api_key
    from app.repositories.ai_config import AIConfigRepository

    question = question.strip()[:MAX_QUESTION_CHARS]

    async with _ask_concurrency:
        with SessionLocal() as db:
            config = AIConfigRepository(db).get_active_config(organization_id)
            if not config:
                return None
            model_type = config.model_type.value if hasattr(config.model_type, "value") else str(config.model_type)
            model_name = config.model_name
            api_key = decrypt_api_key(config.encrypted_api_key)

        def _run() -> Optional[str]:
            from agno.agent import Agent

            from app.tools.faq_search import FAQSearchTool
            from app.tools.knowledge_search_byagent import KnowledgeSearchByAgent
            from app.utils.agno_utils import create_model

            tools = [FAQSearchTool(organization_id=organization_id)]
            if agent_id:
                tools.append(KnowledgeSearchByAgent(agent_id=str(agent_id), org_id=organization_id))
            model = create_model(
                model_type=model_type, api_key=api_key, model_name=model_name, max_tokens=ANSWER_MAX_TOKENS
            )
            agent = Agent(
                name="Help Center Answers",
                model=model,
                tools=tools,
                instructions=_ASK_INSTRUCTIONS,
                markdown=False,
            )
            response = agent.run(message=f"Visitor's question: {question}", stream=False)
            content = getattr(response, "content", None)
            return content.strip() if isinstance(content, str) and content.strip() else None

        answer = None
        try:
            answer = await asyncio.to_thread(_run)
        except Exception as e:
            logger.error(f"Help center ask failed for org {organization_id}: {e}")
        finally:
            try:
                with SessionLocal() as log_db:
                    HelpCenterQueryRepository(log_db).log(organization_id, question, answered=bool(answer))
            except Exception as log_err:
                logger.error(f"Help center ask log failed: {log_err}")
    return answer

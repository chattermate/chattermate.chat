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

from typing import List
from uuid import UUID

from agno.tools import Toolkit
from agno.utils.log import logger

from app.database import SessionLocal
from app.models.faq import FAQ
from app.repositories.faq import FAQRepository

# Word-overlap ranking beats a whole-string ILIKE here: a visitor's
# natural-language question rarely appears verbatim in an FAQ, but shares
# meaningful words with the right one.
_MIN_WORD_LEN = 3
_MAX_RESULTS = 5


class FAQSearchTool(Toolkit):
    """Lets the help-center answer agent search the org's PUBLISHED FAQs.
    Read-only and org-scoped — never exposes drafts or other orgs' content."""

    def __init__(self, organization_id: UUID):
        super().__init__(name="faq_search")
        self.organization_id = organization_id
        self.register(self.search_faqs)

    def search_faqs(self, query: str) -> str:
        """Search this help center's published FAQs for a question.

        Args:
            query: What the visitor wants to know.
        """
        try:
            with SessionLocal() as db:
                faqs = FAQRepository(db).get_published_for_org(self.organization_id)
                ranked = _rank(faqs, query)
                if not ranked:
                    return "No published FAQs matched that question."
                return "\n\n".join(f"Q: {faq.question}\nA: {faq.answer}" for faq in ranked)
        except Exception as e:
            logger.error(f"FAQ search failed: {e}")
            return "Error searching the FAQs."


def _rank(faqs: List[FAQ], query: str) -> List[FAQ]:
    words = {w for w in query.casefold().split() if len(w) > _MIN_WORD_LEN}
    if not words:
        return faqs[:_MAX_RESULTS]
    scored = [
        (len(words & set(f"{faq.question} {faq.answer}".casefold().split())), faq)
        for faq in faqs
    ]
    scored = [(score, faq) for score, faq in scored if score > 0]
    scored.sort(key=lambda pair: pair[0], reverse=True)
    return [faq for _score, faq in scored[:_MAX_RESULTS]]

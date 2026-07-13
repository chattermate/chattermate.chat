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

import json
from typing import List, Optional

from pydantic import BaseModel, Field, ValidationError

from app.agents.structured_output import (
    build_groq_json_tool,
    salvage_groq_json_error,
)
from app.core.config import settings
from app.core.logger import get_logger
from app.models.schemas.faq import MAX_ANSWER_LENGTH, MAX_QUESTION_LENGTH
from app.utils.agno_utils import create_model

logger = get_logger(__name__)

# Groq reasoning models spend output tokens before emitting the tool call;
# match the chat agent's headroom.
FAQ_MAX_TOKENS = 4000
MAX_FAQS_PER_BATCH = 15


class GeneratedFAQ(BaseModel):
    question: str = Field(max_length=MAX_QUESTION_LENGTH)
    answer: str = Field(max_length=MAX_ANSWER_LENGTH)
    category: str = Field(max_length=100)


class FAQExtractionResult(BaseModel):
    # No max_length here: an over-eager model must not fail response-model
    # validation for the whole batch — _validate() trims to MAX_FAQS_PER_BATCH.
    faqs: List[GeneratedFAQ] = Field(default_factory=list)


_FAQ_JSON_TOOL_SCHEMA = {
    "type": "object",
    "properties": {
        "faqs": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "question": {"type": "string", "description": "The question, as a customer would ask it."},
                    "answer": {"type": "string", "description": "A clear, self-contained answer. Simple Markdown allowed (numbered steps, bullet lists, **bold**, links from the content); no headings or images."},
                    "category": {"type": "string", "description": "Short topic grouping, e.g. 'Getting started', 'Billing'."},
                },
                "required": ["question", "answer", "category"],
                "additionalProperties": False,
            },
        },
    },
    "required": ["faqs"],
    "additionalProperties": False,
}

_GROQ_FAQ_INSTRUCTION = (
    "\n\nCRITICAL OUTPUT RULE: You MUST end your turn by calling the `json` tool exactly once "
    "with the extracted FAQs. Never write the FAQs as plain text — always deliver them through "
    "the `json` tool call."
)

_GENERATE_INSTRUCTIONS = """You turn product documentation into a public help-center FAQ.

Read the CONTENT below and draft frequently-asked questions a customer would realistically ask, each with a clear answer.

Rules:
- Ground every answer strictly in the CONTENT. Never invent facts, prices, limits or URLs that are not present.
- Write questions the way a customer would phrase them, and answers in second person ("you"), plain language.
- Answers may use simple Markdown when it helps: numbered steps, bullet lists, **bold**, and links that appear in the CONTENT. No headings, no images, no invented URLs. Keep short answers to 1-4 sentences.
- Extract between 1 and {max_faqs} FAQs; prefer the most useful ones. If the content contains nothing FAQ-worthy, return an empty list.
- Assign each FAQ a short category. {category_rule}
- Do NOT produce any question that duplicates or trivially rephrases one of the EXISTING QUESTIONS listed below."""

_IMPORT_INSTRUCTIONS = """You are migrating an existing FAQ/help-center web page into a structured FAQ list.

Read the PAGE TEXT below and extract every question-and-answer pair that is actually present on the page.

Rules:
- Preserve the original wording as closely as possible; only trim navigation debris, repeated headings and boilerplate.
- Preserve the page's list/step structure in answers as Markdown (numbered steps, bullet lists, **bold**, links present in the PAGE TEXT).
- Only extract real Q&A pairs — skip marketing copy, navigation links and unrelated text.
- Use the page's own section headings as categories where they exist; otherwise use "General".
- Extract at most {max_faqs} pairs per call.
- Do NOT extract any question that duplicates one of the EXISTING QUESTIONS listed below."""


class FAQGeneratorAgent:
    """Stateless one-shot LLM extraction of FAQs from text, using the org's
    configured model. Groq gets the shared `json`-tool structured-output path;
    every other provider uses agno's native response_model."""

    def __init__(self, api_key: str, model_name: str, model_type: str):
        self.model_type = model_type
        self.model_name = model_name
        self.api_key = api_key
        self._use_groq_json_tool = model_type.upper() == "GROQ"

    async def generate_from_text(
        self,
        content: str,
        existing_questions: Optional[List[str]] = None,
        existing_categories: Optional[List[str]] = None,
    ) -> List[GeneratedFAQ]:
        """Draft grounded FAQs from knowledge-base content."""
        if existing_categories:
            category_rule = (
                "Prefer one of the existing categories when it fits: "
                + ", ".join(existing_categories[:20])
                + ". Introduce a new category only when none fit."
            )
        else:
            category_rule = 'Good examples: "Getting started", "Billing", "Account & security", "Integrations".'
        instructions = _GENERATE_INSTRUCTIONS.format(
            max_faqs=MAX_FAQS_PER_BATCH, category_rule=category_rule
        )
        message = self._build_message(instructions, "CONTENT", content, existing_questions)
        return await self._extract(instructions, message)

    async def extract_from_faq_page(
        self,
        content: str,
        existing_questions: Optional[List[str]] = None,
    ) -> List[GeneratedFAQ]:
        """Extract verbatim-ish Q&A pairs from an external FAQ page."""
        instructions = _IMPORT_INSTRUCTIONS.format(max_faqs=MAX_FAQS_PER_BATCH)
        message = self._build_message(instructions, "PAGE TEXT", content, existing_questions)
        return await self._extract(instructions, message)

    @staticmethod
    def _build_message(instructions: str, content_label: str, content: str, existing_questions: Optional[List[str]]) -> str:
        parts = []
        if existing_questions:
            parts.append("EXISTING QUESTIONS (do not repeat):\n" + "\n".join(f"- {q}" for q in existing_questions))
        parts.append(f"{content_label}:\n{content}")
        return "\n\n".join(parts)

    async def _extract(self, instructions: str, message: str) -> List[GeneratedFAQ]:
        from agno.agent import Agent

        model = create_model(
            model_type=self.model_type,
            api_key=self.api_key,
            model_name=self.model_name,
            max_tokens=FAQ_MAX_TOKENS,
        )

        capture: dict = {}
        tools = []
        response_model = FAQExtractionResult
        structured_outputs = True
        if self._use_groq_json_tool:
            tools.append(
                build_groq_json_tool(
                    capture,
                    _FAQ_JSON_TOOL_SCHEMA,
                    description="Return the final extracted FAQ list. Call exactly once.",
                )
            )
            instructions = instructions + _GROQ_FAQ_INSTRUCTION
            response_model = None
            structured_outputs = False

        agent = Agent(
            name="FAQ Generator",
            model=model,
            tools=tools,
            instructions=instructions,
            markdown=False,
            response_model=response_model,
            structured_outputs=structured_outputs,
            debug_mode=settings.ENVIRONMENT == "development",
        )

        try:
            response = await agent.arun(message=message, stream=False)
        except Exception as arun_exc:
            salvaged = salvage_groq_json_error(arun_exc) if self._use_groq_json_tool else None
            if not salvaged:
                raise
            logger.warning("Groq FAQ json tool call unparseable (likely truncated); salvaging fields")
            return self._validate(salvaged)

        if self._use_groq_json_tool:
            return self._validate(capture)
        return self._parse_native(response)

    def _parse_native(self, response) -> List[GeneratedFAQ]:
        content = getattr(response, "content", response)
        if isinstance(content, FAQExtractionResult):
            return self._validate(content.model_dump())
        if isinstance(content, str):
            try:
                return self._validate(json.loads(content))
            except (json.JSONDecodeError, TypeError):
                logger.error("FAQ generator: model returned unparseable text instead of structured output")
                return []
        logger.error(f"FAQ generator: unexpected response content type {type(content)}")
        return []

    @staticmethod
    def _validate(data: dict) -> List[GeneratedFAQ]:
        """Validate model output, dropping malformed entries rather than the
        whole batch. Truncates over-long fields instead of rejecting them."""
        raw_items = (data or {}).get("faqs") or []
        faqs: List[GeneratedFAQ] = []
        for item in raw_items[:MAX_FAQS_PER_BATCH]:
            if not isinstance(item, dict):
                continue
            question = str(item.get("question") or "").strip()[:MAX_QUESTION_LENGTH]
            answer = str(item.get("answer") or "").strip()[:MAX_ANSWER_LENGTH]
            category = str(item.get("category") or "").strip()[:100]
            if not question or not answer:
                continue
            try:
                faqs.append(GeneratedFAQ(question=question, answer=answer, category=category or "General"))
            except ValidationError:
                continue
        return faqs

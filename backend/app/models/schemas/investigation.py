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

from typing import List, Optional

from pydantic import BaseModel, Field


class TriageResult(BaseModel):
    """Structured output of the AI triage pass over a new ticket."""
    # Rewritten, clearer title. The original is preserved on the ticket.
    title: str = Field(max_length=500)
    priority: str = Field(description="urgent, high, medium or low")
    severity: Optional[int] = Field(default=None, ge=1, le=3)
    # Short intent classification, e.g. "billing_issue", "bug_report",
    # "feature_request", "account_access", "outage".
    intent: str = Field(max_length=100)
    # 1-3 sentence internal summary of the issue.
    summary: str = Field(max_length=2000)
    # ["payments", "ledger"] — up to two short lowercase topic tags.
    tags: List[str] = Field(default_factory=list, max_length=3)
    confidence: float = Field(ge=0.0, le=1.0)


class HypothesisSpec(BaseModel):
    """One proposed root-cause hypothesis, before testing."""
    title: str = Field(max_length=300)
    rationale: str = Field(max_length=2000)


class HypothesisPlan(BaseModel):
    """Output of the hypothesis-generation step (H1..Hn, most likely first)."""
    hypotheses: List[HypothesisSpec] = Field(min_length=1, max_length=5)


class HypothesisVerdict(BaseModel):
    """Outcome of testing a single hypothesis with bounded tool calls."""
    status: str = Field(description="validated, invalidated or inconclusive")
    confidence: float = Field(ge=0.0, le=1.0)
    # What the evidence showed, citing the queries/results that decided it.
    conclusion: str = Field(max_length=4000)


class RCATimelineEntry(BaseModel):
    time: str = Field(max_length=100)
    event: str = Field(max_length=500)


class RCAResult(BaseModel):
    """Structured root-cause analysis synthesized from the tested hypotheses
    and captured evidence."""
    summary: str = Field(max_length=4000)
    impact: Optional[str] = Field(default=None, max_length=4000)
    timeline: List[RCATimelineEntry] = Field(default_factory=list, max_length=20)
    investigation_log: Optional[str] = Field(default=None, max_length=6000)
    contributing_factors: List[str] = Field(default_factory=list, max_length=10)
    # Must cite hypotheses inline, e.g. "[H1 · 0.92]".
    conclusion: str = Field(max_length=6000)
    remediation: Optional[str] = Field(default=None, max_length=4000)
    prevention: Optional[str] = Field(default=None, max_length=4000)
    # Plain-language section a human reviews and sends to the customer.
    customer_summary: str = Field(max_length=4000)
    confidence: float = Field(ge=0.0, le=1.0)


TRIAGE_JSON_TOOL_SCHEMA = {
    "type": "object",
    "properties": {
        "title": {"type": "string", "description": "Clear, specific rewritten title."},
        "priority": {"type": "string", "enum": ["urgent", "high", "medium", "low"]},
        "severity": {"type": "integer", "minimum": 1, "maximum": 3},
        "intent": {"type": "string", "description": "Short intent slug, e.g. bug_report."},
        "summary": {"type": "string", "description": "1-3 sentence internal summary."},
        "tags": {"type": "array", "items": {"type": "string"}, "description": "Up to two short lowercase topic tags."},
        "confidence": {"type": "number", "minimum": 0, "maximum": 1},
    },
    "required": ["title", "priority", "intent", "summary", "confidence"],
    "additionalProperties": False,
}


HYPOTHESES_JSON_TOOL_SCHEMA = {
    "type": "object",
    "properties": {
        "hypotheses": {
            "type": "array",
            "minItems": 1,
            "maxItems": 5,
            "items": {
                "type": "object",
                "properties": {
                    "title": {"type": "string", "description": "Short testable hypothesis."},
                    "rationale": {"type": "string", "description": "Why this is suspected and what evidence would confirm it."},
                },
                "required": ["title", "rationale"],
                "additionalProperties": False,
            },
        },
    },
    "required": ["hypotheses"],
    "additionalProperties": False,
}


VERDICT_JSON_TOOL_SCHEMA = {
    "type": "object",
    "properties": {
        "status": {"type": "string", "enum": ["validated", "invalidated", "inconclusive"]},
        "confidence": {"type": "number", "minimum": 0, "maximum": 1},
        "conclusion": {"type": "string", "description": "What the evidence showed, citing queries/results."},
    },
    "required": ["status", "confidence", "conclusion"],
    "additionalProperties": False,
}


RCA_JSON_TOOL_SCHEMA = {
    "type": "object",
    "properties": {
        "summary": {"type": "string"},
        "impact": {"type": "string"},
        "timeline": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {"time": {"type": "string"}, "event": {"type": "string"}},
                "required": ["time", "event"],
                "additionalProperties": False,
            },
        },
        "investigation_log": {"type": "string"},
        "contributing_factors": {"type": "array", "items": {"type": "string"}},
        "conclusion": {"type": "string", "description": "Cites hypotheses inline, e.g. [H1 · 0.92]."},
        "remediation": {"type": "string"},
        "prevention": {"type": "string"},
        "customer_summary": {"type": "string", "description": "Plain language for the customer."},
        "confidence": {"type": "number", "minimum": 0, "maximum": 1},
    },
    "required": ["summary", "conclusion", "customer_summary", "confidence"],
    "additionalProperties": False,
}

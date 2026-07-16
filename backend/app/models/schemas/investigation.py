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

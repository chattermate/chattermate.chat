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

from datetime import datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator

# Reuse the ORM enums so the API contract can never drift from the DB.
from app.models.faq import DEFAULT_FAQ_CATEGORY, FAQStatus
from app.models.schemas.pagination import Pagination
from app.utils.urls import normalize_url

MAX_QUESTION_LENGTH = 300
MAX_ANSWER_LENGTH = 4000
MAX_BULK_IDS = 200


class FAQBase(BaseModel):
    question: str = Field(min_length=1, max_length=MAX_QUESTION_LENGTH)
    answer: str = Field(min_length=1, max_length=MAX_ANSWER_LENGTH)
    category: str = Field(default=DEFAULT_FAQ_CATEGORY, min_length=1, max_length=100)

    @field_validator("question", "answer", "category")
    @classmethod
    def _strip(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("must not be blank")
        return v


class FAQCreate(FAQBase):
    status: FAQStatus = FAQStatus.DRAFT


class FAQUpdate(BaseModel):
    """Partial update — omitted fields keep their current values (apply with
    model_dump(exclude_unset=True)), so e.g. a status-only PATCH can't silently
    reset the category to its default."""
    question: Optional[str] = Field(default=None, min_length=1, max_length=MAX_QUESTION_LENGTH)
    answer: Optional[str] = Field(default=None, min_length=1, max_length=MAX_ANSWER_LENGTH)
    category: Optional[str] = Field(default=None, min_length=1, max_length=100)
    status: Optional[FAQStatus] = None

    @field_validator("question", "answer", "category")
    @classmethod
    def _strip(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return None
        v = v.strip()
        if not v:
            raise ValueError("must not be blank")
        return v


class FAQResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    question: str
    answer: str
    category: str
    status: FAQStatus
    knowledge_id: Optional[int] = None
    source_label: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class FAQListResponse(BaseModel):
    faqs: List[FAQResponse]
    pagination: Pagination


class FAQBulkStatusRequest(BaseModel):
    faq_ids: List[UUID] = Field(min_length=1, max_length=MAX_BULK_IDS)
    status: FAQStatus


class GenerateRequest(BaseModel):
    """Optional narrowing to specific knowledge sources; empty = all."""
    knowledge_ids: Optional[List[int]] = None


class ImportRequest(BaseModel):
    url: str = Field(min_length=1, max_length=2048)

    @field_validator("url")
    @classmethod
    def _https_url(cls, v: str) -> str:
        # Scheme-level validation only; the import worker re-checks the URL
        # against the SSRF guards in app.knowledge.url_safety before fetching.
        return normalize_url(v, require_https=True)


class GenerationJobResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    job_type: str
    status: str
    stage: str
    progress_percentage: float
    faqs_created: int
    source_url: Optional[str] = None
    error: Optional[str] = None
    created_at: Optional[datetime] = None

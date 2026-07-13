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

import re
from datetime import datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.models.help_center import DomainStatus, SSLStatus
from app.utils.urls import normalize_url

MAX_HEADER_LINKS = 6
_HEX_COLOR_RE = re.compile(r"^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$")
# RFC 1035-ish hostname: labels of letters/digits/hyphens, at least one dot.
# The TLD alternation admits punycode labels (xn--...) that IDNA encoding of
# internationalized domains produces.
_HOSTNAME_RE = re.compile(
    r"^(?=.{4,253}$)([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+(?:[a-z]{2,}|xn--[a-z0-9-]{2,})$"
)


class HeaderLink(BaseModel):
    label: str = Field(min_length=1, max_length=40)
    url: str = Field(min_length=1, max_length=2048)

    @field_validator("url")
    @classmethod
    def _url(cls, v: str) -> str:
        # Raises on blank/whitespace input rather than returning None into a
        # non-optional str field.
        return normalize_url(v)


class HelpCenterSettingsUpdate(BaseModel):
    enabled: Optional[bool] = None
    title: Optional[str] = Field(default=None, max_length=120)
    description: Optional[str] = Field(default=None, max_length=300)
    brand_color: Optional[str] = None
    header_links: Optional[List[HeaderLink]] = Field(default=None, max_length=MAX_HEADER_LINKS)
    cta_text: Optional[str] = Field(default=None, max_length=40)
    cta_url: Optional[str] = Field(default=None, max_length=2048)
    auto_generate: Optional[bool] = None
    agent_id: Optional[UUID] = None
    ai_search_enabled: Optional[bool] = None
    chat_widget_enabled: Optional[bool] = None

    @field_validator("brand_color")
    @classmethod
    def _hex_color(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return None
        v = v.strip()
        if not _HEX_COLOR_RE.match(v):
            raise ValueError("brand_color must be a hex color like #4338CA")
        return v

    @field_validator("cta_url")
    @classmethod
    def _cta_url(cls, v: Optional[str]) -> Optional[str]:
        # Blank clears the CTA link; anything else is normalized.
        if v is None or not v.strip():
            return None
        return normalize_url(v)


class HelpCenterAgentOption(BaseModel):
    """Org agents offered in the AI-search agent selector."""
    id: UUID
    name: str
    has_widget: bool


class DnsRecord(BaseModel):
    """One row of the DNS-records table in the admin UI."""
    type: str  # CNAME | TXT
    host: str
    value: str
    verified: bool


class DomainStatusResponse(BaseModel):
    custom_domain: Optional[str] = None
    domain_status: DomainStatus
    ssl_status: SSLStatus
    records: List[DnsRecord] = []
    domain_verified_at: Optional[datetime] = None


class HelpCenterSettingsResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    enabled: bool
    slug: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    logo_url: Optional[str] = None
    brand_color: str
    header_links: List[HeaderLink] = []
    cta_text: Optional[str] = None
    cta_url: Optional[str] = None
    auto_generate: bool
    agent_id: Optional[UUID] = None
    ai_search_enabled: bool
    chat_widget_enabled: bool

    # Enriched by the API layer (not ORM columns):
    live_url: Optional[str] = None
    published_count: int = 0
    plan_allowed: bool = True
    agents: List[HelpCenterAgentOption] = []
    domain: Optional[DomainStatusResponse] = None

    @field_validator("header_links", mode="before")
    @classmethod
    def _coerce_null_json(cls, v):
        return v or []


class DomainRequest(BaseModel):
    domain: str = Field(min_length=4, max_length=255)

    @field_validator("domain")
    @classmethod
    def _hostname(cls, v: str) -> str:
        v = v.strip().lower().rstrip(".")
        v = re.sub(r"^https?://", "", v).split("/")[0]
        try:
            v = v.encode("idna").decode("ascii")
        except UnicodeError as exc:
            raise ValueError("domain is not a valid hostname") from exc
        if not _HOSTNAME_RE.match(v):
            raise ValueError("domain is not a valid hostname")
        return v

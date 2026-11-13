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
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field, field_validator

SHORTCUT_PATTERN = r'^[a-z0-9][a-z0-9-]{0,39}$'


class SavedReplyIn(BaseModel):
    title: str = Field(min_length=1, max_length=100)
    body: str = Field(min_length=1, max_length=4000)
    # Lowercase letters, digits and dashes ("refund-eu"); empty for none
    shortcut: Optional[str] = Field(default=None, max_length=40)

    @field_validator('title', 'body')
    @classmethod
    def not_blank(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError('must not be blank')
        return value

    @field_validator('shortcut')
    @classmethod
    def tidy_shortcut(cls, value: Optional[str]) -> Optional[str]:
        value = (value or '').strip().lower().lstrip('/')
        if not value:
            return None
        if not re.match(SHORTCUT_PATTERN, value):
            raise ValueError('use lowercase letters, digits and dashes')
        return value


class SavedReplyOut(BaseModel):
    id: int
    title: str
    body: str
    shortcut: Optional[str] = None
    created_by: Optional[UUID] = None
    updated_at: datetime

    class Config:
        from_attributes = True

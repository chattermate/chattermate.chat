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

from typing import Literal

from pydantic import BaseModel, Field

ImproveStyle = Literal['clearer', 'friendlier', 'shorter', 'fix']


class ImproveRequest(BaseModel):
    text: str = Field(min_length=1, max_length=4000)
    style: ImproveStyle


class ImproveResponse(BaseModel):
    text: str


class SummaryResponse(BaseModel):
    summary: str


class KnowledgeDraftResponse(BaseModel):
    """ready: the conversation holds a reusable answer, drafted below; when not,
    reason says what's missing and question/answer are empty."""
    ready: bool
    reason: str
    question: str = ''
    answer: str = ''

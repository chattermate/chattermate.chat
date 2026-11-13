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

Status cards: one structured block a tool result can show in the redesigned
widget (an order, a ticket). The reply's own text stays the answer, so a widget
that does not know cards, and every messaging channel, still reads it whole.
"""

from typing import List, Literal, Optional

from pydantic import BaseModel, Field

Tone = Literal['neutral', 'info', 'progress', 'success', 'warning', 'danger']
StepState = Literal['done', 'current', 'upcoming', 'failed']


class CardStatus(BaseModel):
    key: str
    label: str
    tone: Tone = 'neutral'


class CardStep(BaseModel):
    label: str
    state: StepState


class CardRow(BaseModel):
    label: str
    value: str


class Money(BaseModel):
    value: str
    currency: str = ''


class CardItem(BaseModel):
    title: str
    meta: Optional[str] = None
    image: Optional[str] = None
    quantity: Optional[int] = None
    amount: Optional[Money] = None


class CardTotal(BaseModel):
    label: str
    amount: Money


class CardAction(BaseModel):
    """`link` opens an http(s) URL; `reply` sends its value as the visitor's message."""
    id: str
    label: str
    kind: Literal['link', 'reply']
    value: str
    style: Literal['primary', 'secondary'] = 'secondary'


class StatusCard(BaseModel):
    v: Literal[1] = 1
    id: str
    kind: Literal['order', 'ticket', 'generic'] = 'generic'
    title: str
    subtitle: Optional[str] = None
    status: Optional[CardStatus] = None
    steps: List[CardStep] = Field(default_factory=list)
    rows: List[CardRow] = Field(default_factory=list)
    items: List[CardItem] = Field(default_factory=list)
    total: Optional[CardTotal] = None
    actions: List[CardAction] = Field(default_factory=list)
    fallback_text: str = ''

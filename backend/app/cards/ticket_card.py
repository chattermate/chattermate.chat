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

The ticket card: this conversation's support ticket as the visitor sees it. The
internal stages (triage, investigation, approval) read as one "Looking into it";
the ticket's title is the team's and is not shown.
"""

from app.cards.labels import ENGLISH, CardLabels
from app.models.schemas.cards import CardRow, CardStatus, CardStep, StatusCard

STEP_KEYS = ('ticket_step_received', 'ticket_step_in_progress', 'ticket_step_resolved')

# Ticket status → (label key, tone, current step)
_STATUSES = {
    'open': ('ticket_received', 'info', 0),
    'triaging': ('ticket_looking', 'progress', 1),
    'investigating': ('ticket_looking', 'progress', 1),
    'awaiting_approval': ('ticket_in_progress', 'progress', 1),
    'in_progress': ('ticket_in_progress', 'progress', 1),
    'resolved_pending_confirmation': ('ticket_resolved_confirm', 'success', 2),
    'resolved': ('ticket_resolved', 'success', 3),
    'closed': ('ticket_closed', 'neutral', 3),
    'reopened': ('ticket_reopened', 'warning', 1),
}


def _steps(current: int, labels: CardLabels):
    return [CardStep(label=labels.text(key), state='done' if i < current else 'current' if i == current else 'upcoming')
            for i, key in enumerate(STEP_KEYS)]


def ticket_card(number: str, status: str, labels: CardLabels = ENGLISH) -> StatusCard:
    key, tone, current = _STATUSES.get(str(status or '').lower(), ('ticket_received', 'info', 0))
    label = labels.text(key)
    # The priority is the team's triage setting, not something to show the customer.
    rows = [CardRow(label=labels.text('ticket'), value=number)]
    return StatusCard(
        id=f'ticket-{number}',
        kind='ticket',
        lang=labels.language,
        title=labels.text('support_ticket'),
        subtitle=number,
        status=CardStatus(key=str(status or 'open').lower(), label=label, tone=tone),
        steps=_steps(current, labels),
        rows=rows,
        fallback_text=f"{labels.text('ticket')} {number}: {label}",
    )

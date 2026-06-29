"""
ChatterMate - Contact capture helper

Builds the inline "contact" form shown to a visitor at human handoff, asking only for the
contact fields the agent is configured to collect AND that aren't already known. Keeps the
socket handler / chat agent thin and the rules in one place.

Copyright (C) 2024 ChatterMate

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>
"""

from typing import Optional, Dict, Any
from app.repositories.customer import CustomerRepository


def build_handoff_contact_form(
    customer,
    collect_email: bool,
    collect_name: bool,
) -> Optional[Dict[str, Any]]:
    """Return ``form_data`` (``form_type='contact'``) for the handoff contact prompt, or
    ``None`` when there is nothing to collect (toggles off, or the customer already has the
    info). The widget renders this with its existing inline form UI.
    """
    if customer is None:
        return None

    needs_email = bool(collect_email) and CustomerRepository.is_placeholder_email(getattr(customer, 'email', None))
    full_name = (getattr(customer, 'full_name', None) or '').strip()
    needs_name = bool(collect_name) and not full_name

    if not needs_email and not needs_name:
        return None

    fields = []
    if needs_email:
        fields.append({
            'name': 'email',
            'type': 'email',
            'label': 'Email',
            'placeholder': 'you@example.com',
            'required': True,
        })
    if needs_name:
        fields.append({
            'name': 'name',
            'type': 'text',
            'label': 'Name',
            'placeholder': 'Your name',
            'required': False,
        })

    return {
        'form_type': 'contact',
        'title': 'Before we connect you to a teammate',
        'description': 'Share your details so we can follow up.',
        'fields': fields,
    }

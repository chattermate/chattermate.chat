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

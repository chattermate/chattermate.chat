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

# Where a handoff email goes when the customer row can't take it — another
# customer in the org already owns that address (the (email, organization_id)
# unique constraint), or it is a channel identity key. meta_data renders as a
# label/value list in the inbox customer panel, so an agent still sees the
# address and can follow up. Dropping it is how a visitor asks to be contacted
# and then never is.
CONTACT_EMAIL_META_KEY = "contact_email_provided"


def retain_unstored_email(customer_repo, customer_id, submitted_email: str, update_result: dict) -> bool:
    """Keep a submitted handoff email that ``update_contact`` could not apply.

    Returns True when it was retained on meta_data. No-op when the address did
    land on the customer, when it is already their stored address, or when
    nothing was submitted — so a normal capture writes no metadata.
    """
    if not submitted_email or update_result.get('email_updated'):
        return False
    stored = (update_result.get('email') or '').lower()
    if submitted_email.lower() == stored:
        return False
    return customer_repo.update_meta_data(
        customer_id, {CONTACT_EMAIL_META_KEY: submitted_email}
    ) is not None


# The form's words: at a handover, and after an Offline agent's message
HANDOFF_FORM_TEXT = ('Before we connect you to a teammate', 'Share your details so we can follow up.')
OFFLINE_FORM_TEXT = ('Leave your email', "We'll reply here and by email when we're back.")


def build_handoff_contact_form(
    customer,
    collect_email: bool,
    collect_name: bool,
    text: tuple = HANDOFF_FORM_TEXT,
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
        'title': text[0],
        'description': text[1],
        'fields': fields,
    }

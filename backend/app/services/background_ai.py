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

Short model calls a worker makes about a conversation after the fact (an AI
title, a memory of it), with the org's own AI setup. Not counted as messages,
and only where the plan has the feature and allows AI replies: a hosted-model
org with no message credits left gets none.
"""

from typing import Iterable, Optional
from uuid import UUID

from sqlalchemy.orm import Session

from app.core.security import decrypt_api_key
from app.services.ai_access import plan_allows_ai
from app.services.feature_gate import plan_flag_on
from app.services.usage_metering import model_is_hosted, remaining_message_credits

# Who said each line of a transcript handed to the model
SPEAKERS = {'user': 'Customer', 'bot': 'Assistant', 'assistant': 'Assistant', 'agent': 'Teammate'}


def may_use_ai(db: Session, organization_id: UUID, config, feature: str) -> bool:
    """Whether a background call for `feature` may run; a failed plan read is no."""
    if not plan_flag_on(db, organization_id, feature, otherwise=False):
        return False
    if not plan_allows_ai(db, organization_id, config.model_type):
        return False
    if model_is_hosted(config.model_type):
        remaining = remaining_message_credits(db, organization_id)
        return remaining is None or remaining > 0
    return True


def model_settings(config) -> dict:
    """The AI config as a background call's model needs it (key decrypted)."""
    model_type = config.model_type.value if hasattr(config.model_type, 'value') else str(config.model_type)
    return dict(
        model_type=model_type,
        api_key=decrypt_api_key(config.encrypted_api_key),
        model_name=config.model_name,
        base_url=(config.settings or {}).get('base_url'),
    )


def build_agent(name: str, instructions: Iterable[str], max_tokens: int, *, model_type: str, api_key: str,
                model_name: str, base_url: Optional[str]):
    """Blocking: building the model may resolve a custom endpoint's host."""
    # Imported here: agno and the model clients are heavy, and only workers build these
    from agno.agent import Agent
    from app.utils.agno_utils import create_model

    return Agent(
        name=name,
        model=create_model(model_type=model_type, api_key=api_key, model_name=model_name,
                           max_tokens=max_tokens, base_url=base_url),
        instructions=list(instructions),
        markdown=False,
    )

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

from typing import Optional

from sqlalchemy.orm import Session

from app.core.logger import get_logger
from app.models.channels import AgentChannelConfig, ChannelAccount
from app.repositories.agent import AgentRepository
from app.repositories.channels import AgentChannelConfigRepository

logger = get_logger(__name__)


def assign_sole_agent(db: Session, account: ChannelAccount) -> Optional[AgentChannelConfig]:
    """Route a just-connected account to the organization's agent when it has
    exactly one, so skipping the connect dialog's agent step doesn't leave the
    channel silently unanswered. Existing routing, even a paused one, is left
    alone, and with several agents the choice stays the customer's."""
    configs = AgentChannelConfigRepository(db)
    if configs.get_by_account(account.id) is not None:
        return None
    # Every agent counts, as in the dialog's picker: an Offline agent is still
    # routed to, its chats just wait for the team
    agents = AgentRepository(db).get_all_agents(account.organization_id)
    if len(agents) != 1:
        return None
    try:
        config = configs.set_agent(account.id, agents[0].id)
    except Exception:
        # The account is connected either way; the card asks for an agent
        logger.exception(f"Could not auto-assign an agent to channel account {account.id}")
        return None
    logger.info(f"Routed channel account {account.id} to the org's only agent {agents[0].id}")
    return config

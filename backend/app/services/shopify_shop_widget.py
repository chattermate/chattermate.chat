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

from typing import List, Optional

from sqlalchemy.orm import Session

from app.models.shopify.agent_shopify_config import AgentShopifyConfig
from app.models.widget import Widget
from app.repositories.agent_shopify_config_repository import AgentShopifyConfigRepository
from app.repositories.widget import WidgetRepository


def shop_widget(db: Session, shop_id: str, configs: Optional[List[AgentShopifyConfig]] = None) -> Optional[Widget]:
    """The chat widget a store's theme embed loads: the first widget of the
    first agent connected to the store. None until an agent is connected.
    configs: the store's enabled agent configs, when the caller has them."""
    if configs is None:
        configs = AgentShopifyConfigRepository(db).get_configs_by_shop(shop_id, enabled_only=True)
    if not configs:
        return None
    widgets = WidgetRepository(db).get_widgets_by_agent(configs[0].agent_id)
    return widgets[0] if widgets else None

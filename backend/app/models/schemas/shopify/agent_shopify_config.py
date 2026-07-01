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

from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class AgentShopifyConfigBase(BaseModel):
    """Base Shopify agent configuration schema."""
    enabled: bool
    shop_id: Optional[str] = None


class AgentShopifyConfigCreate(AgentShopifyConfigBase):
    """Schema for creating a new Shopify agent configuration."""
    agent_id: str


class AgentShopifyConfigUpdate(AgentShopifyConfigBase):
    """Schema for updating a Shopify agent configuration."""
    pass


class ShopifyShopInfo(BaseModel):
    """Basic info about a Shopify shop."""
    id: str
    shop_domain: str
    
    class Config:
        orm_mode = True


class AgentShopifyConfigInDB(AgentShopifyConfigBase):
    """Schema for Shopify agent configuration stored in the database."""
    id: str
    agent_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True


class AgentShopifyConfig(AgentShopifyConfigInDB):
    """Schema for API response."""
    shop: Optional[ShopifyShopInfo] = None 
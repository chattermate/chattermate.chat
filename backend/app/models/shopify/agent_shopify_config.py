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

from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class AgentShopifyConfig(Base):
    """Model for storing agent-to-Shopify configuration."""
    __tablename__ = "agent_shopify_configs"

    id = Column(String, primary_key=True)
    agent_id = Column(String, nullable=False, index=True)
    
    # Link to ShopifyShop
    shop_id = Column(String, ForeignKey("shopify_shops.id"), nullable=True)
    shop = relationship("ShopifyShop", backref="agent_configs")
    
    enabled = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now()) 
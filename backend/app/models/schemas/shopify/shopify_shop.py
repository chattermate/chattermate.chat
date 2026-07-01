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

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from uuid import UUID

class ShopifyShopBase(BaseModel):
    """Base schema for ShopifyShop"""
    shop_domain: str = Field(..., description="Shopify shop domain")
    organization_id: Optional[str] = Field(None, description="ID of the organization this shop belongs to")

class ShopifyShopCreate(ShopifyShopBase):
    """Schema for creating a shopify shop"""
    access_token: Optional[str] = Field(None, description="Shopify access token")
    scope: Optional[str] = Field(None, description="Shopify OAuth scopes")
    is_installed: bool = Field(False, description="Whether the app is installed on this shop")
    oauth_state: Optional[str] = Field(None, description="CSRF protection state parameter")
    oauth_state_expiry: Optional[datetime] = Field(None, description="CSRF protection state parameter expiry")

class ShopifyShopUpdate(BaseModel):
    """Schema for updating a shopify shop"""
    access_token: Optional[str] = None
    scope: Optional[str] = None
    is_installed: Optional[bool] = None
    organization_id: Optional[str] = None
    oauth_state: Optional[str] = None
    oauth_state_expiry: Optional[datetime] = None

class ShopifyShopInDB(ShopifyShopBase):
    """Schema for shopify shop from database"""
    id: str
    scope: Optional[str] = None
    is_installed: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
        
        # Add JSON encoders to convert UUID to string
        json_encoders = {
            UUID: str  # Convert UUID to string
        }

class ShopifyShop(ShopifyShopInDB):
    """Schema for shopify shop response"""
    pass 
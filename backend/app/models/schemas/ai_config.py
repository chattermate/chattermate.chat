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

from pydantic import BaseModel, SecretStr
from typing import Optional, Dict
from app.models.ai_config import AIModelType
from uuid import UUID


class AIConfigBase(BaseModel):
    model_type: AIModelType
    model_name: str
    settings: Optional[Dict] = {}


class AIConfigCreate(AIConfigBase):
    api_key: SecretStr


class AIConfigUpdate(BaseModel):
    model_type: Optional[AIModelType] = None
    model_name: Optional[str] = None
    api_key: Optional[SecretStr] = None
    settings: Optional[Dict] = None


class AIConfigResponse(BaseModel):
    id: int
    organization_id: UUID
    model_type: AIModelType
    model_name: str
    is_active: bool
    settings: Dict = {}

    class Config:
        from_attributes = True


class AISetupResponse(BaseModel):
    message: str
    config: AIConfigResponse

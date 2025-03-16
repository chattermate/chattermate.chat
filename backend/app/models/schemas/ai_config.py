"""
ChatterMate - Ai Config
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

from pydantic import BaseModel, SecretStr, ConfigDict
from typing import Optional, Dict
from app.models.ai_config import AIModelType
from uuid import UUID


class AIConfigBase(BaseModel):
    model_type: AIModelType
    ai_model_name: str
    settings: Optional[Dict] = {}

    model_config = ConfigDict(protected_namespaces=())


class AIConfigCreate(AIConfigBase):
    api_key: SecretStr


class AIConfigUpdate(BaseModel):
    model_type: Optional[AIModelType] = None
    ai_model_name: Optional[str] = None
    api_key: Optional[SecretStr] = None
    settings: Optional[Dict] = None

    model_config = ConfigDict(protected_namespaces=())


class AIConfigResponse(BaseModel):
    id: int
    organization_id: UUID
    model_type: AIModelType
    ai_model_name: str
    is_active: bool
    settings: Dict = {}

    model_config = ConfigDict(
        from_attributes=True,
        protected_namespaces=()
    )


class AISetupResponse(BaseModel):
    message: str
    config: AIConfigResponse

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

from sqlalchemy.orm import Session
from app.models.ai_config import AIConfig, AIModelType
from app.core.security import encrypt_api_key, decrypt_api_key
from typing import Optional


class AIConfigRepository:
    def __init__(self, db: Session):
        self.db = db

    def create_config(self, org_id: str, model_type: str, model_name: str, api_key: str) -> AIConfig:
        """Create a new AI configuration"""
        try:
            # Encrypt API key before storing
            encrypted_key = encrypt_api_key(api_key)

            # Create new config
            config = AIConfig(
                organization_id=org_id,
                model_type=AIModelType(model_type.upper()),
                model_name=model_name,
                encrypted_api_key=encrypted_key,
                is_active=True
            )

            # Deactivate any existing configs
            existing_configs = self.db.query(AIConfig).filter(
                AIConfig.organization_id == org_id,
                AIConfig.is_active == True
            ).all()
            for existing in existing_configs:
                existing.is_active = False

            self.db.add(config)
            self.db.commit()
            self.db.refresh(config)
            return config

        except Exception as e:
            self.db.rollback()
            raise e

    def get_active_config(self, org_id: str) -> Optional[AIConfig]:
        """Get active AI configuration for an organization"""
        config = self.db.query(AIConfig).filter(
            AIConfig.organization_id == org_id,
            AIConfig.is_active == True
        ).first()

        if not config:
            return None

        # Return dict with decrypted API key
        return config

    def update_config(self, config_id: int, **kwargs) -> Optional[AIConfig]:
        """Update an existing AI configuration"""
        config = self.db.query(AIConfig).filter(
            AIConfig.id == config_id).first()
        if not config:
            return None

        for key, value in kwargs.items():
            if key == 'api_key':
                config.encrypted_api_key = encrypt_api_key(value)
            else:
                setattr(config, key, value)

        self.db.commit()
        self.db.refresh(config)
        return config

    def deactivate_config(self, config_id: int) -> bool:
        """Deactivate an AI configuration"""
        config = self.db.query(AIConfig).filter(
            AIConfig.id == config_id).first()
        if not config:
            return False

        config.is_active = False
        self.db.commit()
        return True

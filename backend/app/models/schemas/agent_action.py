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

import json
import re
from datetime import datetime
from typing import Any, Dict, Optional
from uuid import UUID

from jsonschema import SchemaError
from jsonschema.validators import Draft202012Validator
from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.core.config import settings
# Reuse the ORM enum so the API contract can never drift from the DB.
from app.models.agent_action import ActionConfirmPolicy

# Same shape the model sees as a tool name, so no translation is needed.
ACTION_NAME_PATTERN = re.compile(r"^[a-z][a-z0-9_]{0,63}$")
EMPTY_PARAMETERS: Dict[str, Any] = {"type": "object", "properties": {}}


def validate_parameters_schema(schema: Dict[str, Any]) -> Dict[str, Any]:
    """Reject anything that is not a small, valid JSON Schema for an object.

    The model receives this schema as a tool definition, and the widget and the
    server both check arguments against it, so it must be well formed.
    """
    if len(json.dumps(schema)) > settings.ACTION_SCHEMA_MAX_BYTES:
        raise ValueError(f"Argument schema is larger than {settings.ACTION_SCHEMA_MAX_BYTES} bytes")
    if schema.get("type") != "object":
        raise ValueError('Argument schema must have "type": "object"')
    try:
        Draft202012Validator.check_schema(schema)
    except SchemaError as exc:
        raise ValueError(f"Argument schema is not valid JSON Schema: {exc.message}") from exc
    return schema


class AgentActionFields(BaseModel):
    name: str
    label: str = Field(min_length=1, max_length=80)
    description: str = Field(min_length=1, max_length=1000)
    parameters: Dict[str, Any] = Field(default_factory=lambda: dict(EMPTY_PARAMETERS))
    confirm: ActionConfirmPolicy = ActionConfirmPolicy.NEVER
    timeout_s: int = Field(default_factory=lambda: settings.ACTION_TIMEOUT_DEFAULT_S, ge=1)
    sensitive_form: bool = False
    enabled: bool = True


class AgentActionWrite(AgentActionFields):
    """Validation for what an admin submits. Responses skip it, so lowering a
    limit in settings never breaks reading rows saved under the old one."""

    @field_validator("name")
    @classmethod
    def _valid_name(cls, value: str) -> str:
        if not ACTION_NAME_PATTERN.match(value):
            raise ValueError("Use lowercase letters, digits and underscores, starting with a letter (max 64)")
        return value

    @field_validator("label", "description")
    @classmethod
    def _strip(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Must not be blank")
        return value

    @field_validator("parameters")
    @classmethod
    def _valid_parameters(cls, value: Dict[str, Any]) -> Dict[str, Any]:
        return validate_parameters_schema(value)

    @field_validator("timeout_s")
    @classmethod
    def _timeout_cap(cls, value: int) -> int:
        if value > settings.ACTION_TIMEOUT_MAX_S:
            raise ValueError(f"Timeout must be at most {settings.ACTION_TIMEOUT_MAX_S} seconds")
        return value


class AgentActionCreate(AgentActionWrite):
    pass


class AgentActionUpdate(AgentActionWrite):
    """Full replace: the edit form always sends every field."""
    pass


class AgentActionResponse(AgentActionFields):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    agent_id: UUID
    last_registered_at: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class AgentActionModelView(BaseModel):
    """Exactly what the model is told about the action."""
    name: str
    description: str
    parameters: Dict[str, Any]

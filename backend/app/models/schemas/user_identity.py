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

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class UserIdentityResponse(BaseModel):
    """A single sign-on account linked to a team member, as an admin sees it."""
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    provider: str
    email: Optional[str] = None
    created_at: Optional[datetime] = None
    last_login_at: Optional[datetime] = None

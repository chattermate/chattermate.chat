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
from typing import Optional, List, Any
from app.models.schemas.agent import AgentResponse

class AgentWithJiraConfig(AgentResponse):
    """Model for agent data with Jira configuration."""
    tools: Optional[List[Any]] = None
    is_default: bool = False
    jira_enabled: bool = False
    jira_project_key: Optional[str] = None
    jira_issue_type_id: Optional[str] = None
    groups: List[Any] = []
    organization: Optional[Any] = None
    
    class Config:
        arbitrary_types_allowed = True 
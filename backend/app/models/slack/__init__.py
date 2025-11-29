"""
ChatterMate - Slack Models
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

from .slack_token import SlackToken
from .slack_workspace_config import SlackWorkspaceConfig, StorageMode
from .agent_slack_config import AgentSlackConfig
from .slack_conversation import SlackConversation

__all__ = [
    "SlackToken",
    "SlackWorkspaceConfig",
    "StorageMode",
    "AgentSlackConfig",
    "SlackConversation",
]

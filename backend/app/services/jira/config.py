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

import os

# Atlassian OAuth 2.0 (3LO) + REST endpoints — kept in one place so no URL or
# scope string is duplicated across the OAuth, client, and token modules.
AUTH_URL = "https://auth.atlassian.com/authorize"
TOKEN_URL = "https://auth.atlassian.com/oauth/token"
ACCESSIBLE_RESOURCES_URL = "https://api.atlassian.com/oauth/token/accessible-resources"
API_BASE = "https://api.atlassian.com/ex/jira"  # + /{cloud_id}/rest/api/3/...
OAUTH_SCOPE = "read:jira-work write:jira-work read:jira-user offline_access"
# Refresh a little before actual expiry so an in-flight request never races it.
TOKEN_REFRESH_LEEWAY_SECONDS = 5 * 60
HTTP_TIMEOUT_SECONDS = 20.0

# Jira's built-in priority scheme ids (default for Cloud projects).
PRIORITY_NAME_TO_ID = {"Highest": "1", "High": "2", "Medium": "3", "Low": "4", "Lowest": "5"}
DEFAULT_PRIORITY_ID = "3"  # Medium


def oauth_credentials() -> dict:
    """Read the Jira app credentials from the environment in one place."""
    return {
        "client_id": os.getenv("JIRA_CLIENT_ID"),
        "client_secret": os.getenv("JIRA_CLIENT_SECRET"),
        "redirect_uri": os.getenv("JIRA_REDIRECT_URI"),
    }

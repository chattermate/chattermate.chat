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

from typing import Any, Dict, List, Optional

import requests

from app.core.exceptions import JiraAuthError
from app.core.logger import get_logger
from app.services.jira import config

logger = get_logger(__name__)


def to_adf(text: str) -> dict:
    """Wrap plain text in Atlassian Document Format (required by the v3 API)."""
    return {
        "type": "doc",
        "version": 1,
        "content": [{"type": "paragraph", "content": [{"type": "text", "text": text}]}],
    }


class JiraClient:
    """Thin synchronous wrapper over the Jira Cloud REST v3 API for one site.

    Every call goes through `_request`, so auth headers and the base URL are
    built exactly once instead of being repeated in each method."""

    def __init__(self, access_token: str, cloud_id: str, site_url: Optional[str] = None):
        self.access_token = access_token
        self.cloud_id = cloud_id
        self.site_url = site_url

    def _request(self, method: str, path: str, **kwargs) -> requests.Response:
        url = f"{config.API_BASE}/{self.cloud_id}/rest/api/3/{path.lstrip('/')}"
        headers = {
            "Authorization": f"Bearer {self.access_token}",
            "Accept": "application/json",
            "Content-Type": "application/json",
        }
        return requests.request(
            method, url, headers=headers, timeout=config.HTTP_TIMEOUT_SECONDS, **kwargs)

    @staticmethod
    def _json(response: requests.Response, error: str) -> Any:
        """Parse a JSON body, raising the domain error (not a raw JSONDecodeError)
        when a 2xx response carries a non-JSON body (e.g. a proxy error page)."""
        try:
            return response.json()
        except ValueError:
            raise JiraAuthError(f"{error}: non-JSON response")

    def _get_json(self, path: str, error: str) -> Any:
        response = self._request("GET", path)
        if response.status_code != 200:
            raise JiraAuthError(f"{error}: {response.text[:200]}")
        return self._json(response, error)

    def get_projects(self) -> List[Dict[str, Any]]:
        projects = self._get_json("project", "Failed to get Jira projects")
        return [{"id": p["id"], "key": p["key"], "name": p["name"]} for p in projects]

    def get_issue_types(self, project_key: str) -> List[Dict[str, Any]]:
        project = self._get_json(f"project/{project_key}", "Failed to get Jira project")
        # Sub-tasks require a parent issue, so they're not offered as a target type.
        return [
            {
                "id": it["id"],
                "name": it["name"],
                "description": it.get("description", ""),
                "iconUrl": it.get("iconUrl", ""),
            }
            for it in project.get("issueTypes", []) if not it.get("subtask", False)
        ]

    def get_priorities(self) -> List[Dict[str, Any]]:
        priorities = self._get_json("priority", "Failed to get Jira priorities")
        return [
            {
                "id": p["id"],
                "name": p["name"],
                "description": p.get("description", ""),
                "iconUrl": p.get("iconUrl", ""),
            }
            for p in priorities
        ]

    def is_field_available(self, project_key: str, issue_type_id: str, field: str) -> bool:
        response = self._request(
            "GET",
            f"issue/createmeta?projectKeys={project_key}&issuetypeIds={issue_type_id}"
            "&expand=projects.issuetypes.fields",
        )
        if response.status_code != 200:
            logger.error(f"Failed to get Jira create metadata: {response.text[:200]}")
            return False
        try:
            projects = response.json().get("projects", [])
            issue_types = projects[0].get("issuetypes", []) if projects else []
            fields = issue_types[0].get("fields", {}) if issue_types else {}
            return field in fields
        except (IndexError, KeyError, TypeError) as e:
            logger.error(f"Error reading Jira create metadata: {e}")
            return False

    def create_issue(self, project_key: str, issue_type_id: str, summary: str,
                     description: str, priority_id: Optional[str] = None) -> Dict[str, Any]:
        fields: Dict[str, Any] = {
            "project": {"key": project_key},
            "issuetype": {"id": issue_type_id},
            "summary": summary,
            "description": to_adf(description),
        }
        if priority_id and self.is_field_available(project_key, issue_type_id, "priority"):
            fields["priority"] = {"id": priority_id}
        response = self._request("POST", "issue", json={"fields": fields})
        if response.status_code not in (200, 201):
            raise JiraAuthError(f"Failed to create Jira issue: {response.text[:200]}")
        return self._json(response, "Failed to create Jira issue")

    def add_comment(self, issue_key: str, text: str) -> None:
        response = self._request("POST", f"issue/{issue_key}/comment", json={"body": to_adf(text)})
        if response.status_code not in (200, 201):
            logger.warning(f"Failed to add Jira comment to {issue_key}: {response.text[:200]}")

    def get_issue(self, issue_key: str) -> Dict[str, Any]:
        return self._get_json(
            f"issue/{issue_key}?fields=summary,status,priority,assignee",
            f"Failed to get Jira issue {issue_key}",
        )

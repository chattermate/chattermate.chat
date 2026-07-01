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

from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List
import os
import requests
from urllib.parse import urlencode

from app.models.jira import JiraToken
from app.core.config import settings
from app.core.exceptions import JiraAuthError
from app.core.logger import get_logger
logger = get_logger(__name__)


class JiraService:
    """Service for handling Jira OAuth 2.0 flow and API interactions."""
    
    def __init__(self):
        self.client_id = os.getenv("JIRA_CLIENT_ID")
        self.client_secret = os.getenv("JIRA_CLIENT_SECRET")
        self.redirect_uri = os.getenv("JIRA_REDIRECT_URI")
        self.auth_url = "https://auth.atlassian.com/authorize"
        self.token_url = "https://auth.atlassian.com/oauth/token"
        self.scope = "read:jira-work write:jira-work read:jira-user offline_access"

    def get_authorization_url(self, state: str) -> str:
        """Generate the authorization URL for Jira OAuth flow."""
        params = {
            "audience": "api.atlassian.com",
            "client_id": self.client_id,
            "scope": self.scope,
            "redirect_uri": self.redirect_uri,
            "state": state,
            "response_type": "code",
            "prompt": "consent"
        }
        return f"{self.auth_url}?{urlencode(params)}"

    def validate_token(self, token: JiraToken) -> bool:
        """Check if the token is valid and not expired."""
        if token is None:
            return False
        return token.expires_at > datetime.utcnow() + timedelta(minutes=5)

    async def exchange_code_for_token(self, code: str) -> Dict[str, Any]:
        """Exchange authorization code for access token."""
        data = {
            "grant_type": "authorization_code",
            "client_id": self.client_id,
            "client_secret": self.client_secret,
            "code": code,
            "redirect_uri": self.redirect_uri
        }

        response = requests.post(self.token_url, data=data)
        if response.status_code != 200:
            raise JiraAuthError("Failed to exchange code for token")
        
        token_data = response.json()
        return {
            "access_token": token_data["access_token"],
            "refresh_token": token_data["refresh_token"],
            "token_type": token_data["token_type"],
            "expires_at": datetime.utcnow() + timedelta(seconds=token_data["expires_in"])
        }

    async def refresh_token(self, refresh_token: str) -> Dict[str, Any]:
        """Refresh an expired access token."""
        data = {
            "grant_type": "refresh_token",
            "client_id": self.client_id,
            "client_secret": self.client_secret,
            "refresh_token": refresh_token
        }

        response = requests.post(self.token_url, data=data)
        if response.status_code != 200:
            raise JiraAuthError("Failed to refresh token")

        token_data = response.json()
        return {
            "access_token": token_data["access_token"],
            "refresh_token": token_data.get("refresh_token", refresh_token),
            "token_type": token_data["token_type"],
            "expires_at": datetime.utcnow() + timedelta(seconds=token_data["expires_in"])
        }

    async def get_cloud_id(self, access_token: str) -> Dict[str, str]:
        """Get Jira Cloud ID and site URL for the authenticated user."""
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Accept": "application/json"
        }
        response = requests.get("https://api.atlassian.com/oauth/token/accessible-resources", headers=headers)
        
        if response.status_code != 200:
            raise JiraAuthError("Failed to get Jira Cloud ID")

        resources = response.json()
        if not resources:
            raise JiraAuthError("No Jira Cloud instances found")

        # Use the first available cloud instance
        return {
            "cloud_id": resources[0]["id"],
            "site_url": resources[0]["url"]
        }

    async def get_projects(self, access_token: str, cloud_id: str) -> List[Dict[str, Any]]:
        """Get all projects from Jira."""
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Accept": "application/json",
            "Content-Type": "application/json"
        }
        
        url = f"https://api.atlassian.com/ex/jira/{cloud_id}/rest/api/3/project"
        response = requests.get(url, headers=headers)
        
        if response.status_code != 200:
            raise JiraAuthError(f"Failed to get Jira projects: {response.text}")
        
        projects = response.json()
        return [
            {
                "id": project["id"],
                "key": project["key"],
                "name": project["name"]
            }
            for project in projects
        ]
    
    async def get_issue_types(self, access_token: str, cloud_id: str, project_key: str) -> List[Dict[str, Any]]:
        """Get all issue types for a project from Jira."""
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Accept": "application/json",
            "Content-Type": "application/json"
        }
        
        # First, get the project to find its ID
        url = f"https://api.atlassian.com/ex/jira/{cloud_id}/rest/api/3/project/{project_key}"
        response = requests.get(url, headers=headers)
        
        if response.status_code != 200:
            raise JiraAuthError(f"Failed to get Jira project: {response.text}")
        
        project = response.json()
        
        # Get issue types for the project, filtering out sub-tasks
        issue_types = []
        for issue_type in project.get("issueTypes", []):
            # Skip sub-tasks as they require a parent issue
            if issue_type.get("subtask", False):
                logger.info(f"Skipping sub-task issue type: {issue_type['name']} (ID: {issue_type['id']})")
                continue
                
            issue_types.append({
                "id": issue_type["id"],
                "name": issue_type["name"],
                "description": issue_type.get("description", ""),
                "iconUrl": issue_type.get("iconUrl", "")
            })
        
        return issue_types
        
    async def create_issue(self, organization, db, issue_data):
        """Wrapper method for create_issue that takes organization, db, and issue_data parameters."""
        from app.models.jira import JiraToken
        
        token = db.query(JiraToken).filter(
            JiraToken.organization_id == organization.id
        ).first()
        
        if not token:
            raise JiraAuthError("No Jira connection found")
        
        # Check if token is valid and refresh if needed
        is_valid = self.validate_token(token)
        if not is_valid:
            try:
                token_data = await self.refresh_token(token.refresh_token)
                
                # Update token in database
                for key, value in token_data.items():
                    setattr(token, key, value)
                
                db.commit()
            except Exception as e:
                logger.error(f"Failed to refresh Jira token: {e}")
                raise JiraAuthError("Jira token expired and could not be refreshed")
        
        # Create the issue
        result = await self.create_issue_internal(
            token.access_token,
            token.cloud_id,
            issue_data.projectKey,
            issue_data.issueTypeId,
            issue_data.summary,
            issue_data.description,
            issue_data.priority
        )
        
        return result
    
    async def create_issue_internal(self, access_token: str, cloud_id: str, project_key: str, issue_type_id: str, 
                          summary: str, description: str, priority_id: Optional[str] = None) -> Dict[str, Any]:
        """Create a new issue in Jira."""
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Accept": "application/json",
            "Content-Type": "application/json"
        }
        
        url = f"https://api.atlassian.com/ex/jira/{cloud_id}/rest/api/3/issue"
        
        data = {
            "fields": {
                "project": {
                    "key": project_key
                },
                "issuetype": {
                    "id": issue_type_id
                },
                "summary": summary,
                "description": {
                    "type": "doc",
                    "version": 1,
                    "content": [
                        {
                            "type": "paragraph",
                            "content": [
                                {
                                    "type": "text",
                                    "text": description
                                }
                            ]
                        }
                    ]
                }
            }
        }
        
        # Add priority if provided and available
        if priority_id:
            # Check if priority field is available for this project/issue type
            priority_available = await self.is_priority_available(access_token, cloud_id, project_key, issue_type_id)
            if priority_available:
                data["fields"]["priority"] = {
                    "id": priority_id
                }
            else:
                logger.warning(f"Priority field not available for project {project_key} and issue type {issue_type_id}. Skipping priority.")
        
        response = requests.post(url, headers=headers, json=data)
        
        if response.status_code not in (200, 201):
            raise JiraAuthError(f"Failed to create Jira issue: {response.text}")
        
        return response.json()
        
    async def get_priorities(self, access_token: str, cloud_id: str) -> List[Dict[str, Any]]:
        """Get all priorities from Jira."""
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Accept": "application/json",
            "Content-Type": "application/json"
        }
        
        url = f"https://api.atlassian.com/ex/jira/{cloud_id}/rest/api/3/priority"
        response = requests.get(url, headers=headers)
        
        if response.status_code != 200:
            raise JiraAuthError(f"Failed to get Jira priorities: {response.text}")
        
        priorities = response.json()
        return [
            {
                "id": priority["id"],
                "name": priority["name"],
                "description": priority.get("description", ""),
                "iconUrl": priority.get("iconUrl", "")
            }
            for priority in priorities
        ]
        
    async def check_field_availability(self, access_token: str, cloud_id: str, project_key: str, issue_type_id: str, field_name: str) -> bool:
        """Check if a field is available for a project/issue type combination."""
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Accept": "application/json",
            "Content-Type": "application/json"
        }
        
        # Get the create metadata for the project/issue type
        url = f"https://api.atlassian.com/ex/jira/{cloud_id}/rest/api/3/issue/createmeta?projectKeys={project_key}&issuetypeIds={issue_type_id}&expand=projects.issuetypes.fields"
        response = requests.get(url, headers=headers)
        
        if response.status_code != 200:
            logger.error(f"Failed to get create metadata: {response.text}")
            return False
        
        metadata = response.json()
        
        # Navigate through the response structure to find the field
        try:
            projects = metadata.get("projects", [])
            if not projects:
                return False
                
            issue_types = projects[0].get("issuetypes", [])
            if not issue_types:
                return False
                
            fields = issue_types[0].get("fields", {})
            
            # Check if the field exists
            return field_name in fields
        except Exception as e:
            logger.error(f"Error checking field availability: {e}")
            return False
            
    async def is_priority_available(self, access_token: str, cloud_id: str, project_key: str, issue_type_id: str) -> bool:
        """Check if the priority field is available for a project/issue type combination."""
        return await self.check_field_availability(access_token, cloud_id, project_key, issue_type_id, "priority") 
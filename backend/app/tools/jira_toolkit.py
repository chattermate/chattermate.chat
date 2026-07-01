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

from typing import Optional, Dict, Any, List
from agno.tools import Toolkit
from app.core.logger import get_logger
from app.services.jira import JiraService
from app.repositories.session_to_agent import SessionToAgentRepository
from app.api.jira import CreateJiraIssueModel
from app.database import SessionLocal
from app.models.organization import Organization
from app.models.agent import Agent
from uuid import UUID

logger = get_logger(__name__)

class JiraTools(Toolkit):
    def __init__(self, agent_id: str, org_id: str, session_id: str):
        super().__init__(name="jira_tools")
        self.agent_id = agent_id
        self.org_id = org_id
        self.session_id = session_id
        self.jira_service = JiraService()
        
        # Register the functions
        self.register(self.create_jira_ticket)
        self.register(self.get_ticket_status)
        self.register(self.check_existing_ticket)
    
    def create_jira_ticket(
        self, 
        summary: str, 
        description: str, 
        priority: Optional[str] = "Medium"
    ) -> str:
        """
        Create a Jira ticket for the current session or update an existing one.
        
        Args:
            summary (str): The summary/title of the ticket.
            description (str): The detailed description of the ticket.
            priority (str, optional): The priority level of the ticket (Highest, High, Medium, Low, Lowest). Defaults to "Medium".
            
        Returns:
            str: JSON string with information about the created or updated ticket including ticket ID and status.
        """
        try:
            import json
            import requests
            from datetime import datetime, timedelta
            
            # Check if a ticket already exists for this session
            existing_ticket_str = self.check_existing_ticket()
            existing_ticket = json.loads(existing_ticket_str)
            existing_ticket_id = None
            is_update = False
            
            if existing_ticket.get("exists", False):
                existing_ticket_id = existing_ticket.get("ticket_id")
                is_update = True
                logger.info(f"Found existing ticket {existing_ticket_id} for session {self.session_id}, will update it")
            
            # Use context manager for database operations
            with SessionLocal() as db:
                # Get the agent's Jira configuration
                try:
                    agent_uuid = UUID(str(self.agent_id))
                    agent = db.query(Agent).filter(Agent.id == agent_uuid).first()
                except (ValueError, TypeError) as e:
                    logger.error(f"Invalid agent ID format: {e}")
                    return json.dumps({
                        "success": False,
                        "message": f"Invalid agent ID format: {str(e)}"
                    })
                    
                if not agent:
                    return json.dumps({
                        "success": False,
                        "message": "Agent not found"
                    })
                    
                # Get the organization
                try:
                    org_uuid = UUID(str(self.org_id))
                    organization = db.query(Organization).filter(
                            Organization.id == org_uuid
                    ).first()
                except (ValueError, TypeError) as e:
                    logger.error(f"Invalid organization ID format: {e}")
                    return json.dumps({
                        "success": False,
                        "message": f"Invalid organization ID format: {str(e)}"
                    })
            
                
                if not organization:
                    return json.dumps({
                        "success": False,
                        "message": "Organization not found"
                    })
                
                # Get the agent's Jira configuration
                from app.models.jira import AgentJiraConfig
                jira_config = db.query(AgentJiraConfig).filter(
                    AgentJiraConfig.agent_id == str(self.agent_id)
                ).first()
                
                if not jira_config or not jira_config.enabled:
                    return json.dumps({
                        "success": False,
                        "message": "Jira integration is not enabled for this agent"
                    })
                    
                # Create the issue data
                issue_data = CreateJiraIssueModel(
                    projectKey=jira_config.project_key,
                    issueTypeId=jira_config.issue_type_id,
                    summary=summary,
                    description=description,
                    priority=priority,
                    chatId=str(self.session_id)  # Ensure session_id is a string
                )
                
                # Get the Jira token
                from app.models.jira import JiraToken
                token = db.query(JiraToken).filter(
                    JiraToken.organization_id == organization.id
                ).first()
                
                if not token:
                    return json.dumps({
                        "success": False,
                        "message": "No Jira connection found"
                    })
            
            # Check if token is valid and refresh if needed
            is_valid = self.jira_service.validate_token(token)
            if not is_valid:
                # Implement synchronous token refresh
                try:
                    # Get client credentials from environment
                    import os
                    client_id = os.getenv("JIRA_CLIENT_ID")
                    client_secret = os.getenv("JIRA_CLIENT_SECRET")
                    
                    if not client_id or not client_secret:
                        return json.dumps({
                            "success": False,
                            "message": "Jira client credentials not configured"
                        })
                    
                    # Refresh token using requests
                    refresh_data = {
                        "grant_type": "refresh_token",
                        "client_id": client_id,
                        "client_secret": client_secret,
                        "refresh_token": token.refresh_token
                    }
                    
                    refresh_response = requests.post(
                        "https://auth.atlassian.com/oauth/token",
                        data=refresh_data
                    )
                    
                    if refresh_response.status_code != 200:
                        logger.error(f"Failed to refresh token: {refresh_response.text}")
                        return json.dumps({
                            "success": False,
                            "message": f"Failed to refresh Jira token: {refresh_response.text}"
                        })
                    
                    # Parse response and update token
                    token_data = refresh_response.json()
                    
                    # Update token in database
                    token.access_token = token_data["access_token"]
                    token.refresh_token = token_data.get("refresh_token", token.refresh_token)
                    token.token_type = token_data["token_type"]
                    token.expires_at = datetime.utcnow() + timedelta(seconds=token_data["expires_in"])
                    
                    db.commit()
                    logger.info("Successfully refreshed Jira token")
                    
                except Exception as e:
                    logger.error(f"Error refreshing Jira token: {e}")
                    return json.dumps({
                        "success": False,
                        "message": f"Error refreshing Jira token: {str(e)}"
                    })
            
            # Create the issue directly using the REST API
            headers = {
                "Authorization": f"Bearer {token.access_token}",
                "Accept": "application/json",
                "Content-Type": "application/json"
            }
            
            # Check if priority field is available for this project and issue type
            priority_available = False
            try:
                # Get the create metadata to check available fields
                create_meta_url = f"https://api.atlassian.com/ex/jira/{str(token.cloud_id)}/rest/api/3/issue/createmeta?projectKeys={issue_data.projectKey}&issuetypeIds={issue_data.issueTypeId}&expand=projects.issuetypes.fields"
                meta_response = requests.get(create_meta_url, headers=headers)
                
                if meta_response.status_code == 200:
                    meta_data = meta_response.json()
                    # Navigate through the response to find the priority field
                    if meta_data.get("projects") and len(meta_data["projects"]) > 0:
                        project = meta_data["projects"][0]
                        if project.get("issuetypes") and len(project["issuetypes"]) > 0:
                            issue_type = project["issuetypes"][0]
                            if issue_type.get("fields") and "priority" in issue_type["fields"]:
                                priority_available = True
                                logger.info("Priority field is available for this project and issue type")
            except Exception as e:
                logger.warning(f"Failed to check if priority field is available: {e}")
                # Continue without setting priority
            
            # Prepare the issue data for the API
            api_data = {
                "fields": {
                    "summary": issue_data.summary,
                    "description": {
                        "type": "doc",
                        "version": 1,
                        "content": [
                            {
                                "type": "paragraph",
                                "content": [
                                    {
                                        "type": "text",
                                        "text": issue_data.description
                                    }
                                ]
                            }
                        ]
                    }
                }
            }
            
            # Only include project and issuetype for new tickets, not updates
            if not is_update:
                api_data["fields"]["project"] = {"key": issue_data.projectKey}
                api_data["fields"]["issuetype"] = {"id": issue_data.issueTypeId}
            
            # Add priority if provided and available
            if priority_available and issue_data.priority:
                # Map string priority to Jira priority
                priority_map = {
                    "Highest": "1",
                    "High": "2",
                    "Medium": "3",
                    "Low": "4",
                    "Lowest": "5"
                }
                priority_id = priority_map.get(issue_data.priority, "3")  # Default to Medium
                api_data["fields"]["priority"] = {"id": priority_id}
                logger.info(f"Setting priority to {issue_data.priority} (ID: {priority_id})")
            else:
                logger.info("Priority field is not available or not provided, skipping")
            
            try:
                if is_update:
                    # Get the existing ticket details first to get the current description
                    existing_ticket_url = f"https://api.atlassian.com/ex/jira/{str(token.cloud_id)}/rest/api/3/issue/{existing_ticket_id}"
                    existing_ticket_response = requests.get(existing_ticket_url, headers=headers)
                    
                    if existing_ticket_response.status_code == 200:
                        existing_ticket_data = existing_ticket_response.json()
                        existing_description = ""
                        
                        # Extract the existing description text
                        if existing_ticket_data.get("fields", {}).get("description"):
                            description_field = existing_ticket_data["fields"]["description"]
                            if isinstance(description_field, dict) and description_field.get("content"):
                                # Extract text from Atlassian Document Format
                                for content in description_field.get("content", []):
                                    if content.get("type") == "paragraph" and content.get("content"):
                                        for text_node in content.get("content", []):
                                            if text_node.get("type") == "text":
                                                existing_description += text_node.get("text", "")
                                        existing_description += "\n\n"
                            elif isinstance(description_field, str):
                                existing_description = description_field
                        
                        # Append the new description to the existing one
                        combined_description = existing_description.strip()
                        if combined_description:
                            combined_description += "\n\n--- Update " + datetime.now().strftime("%Y-%m-%d %H:%M:%S") + " ---\n\n"
                        combined_description += description
                        
                        # Update the description in the API data
                        api_data["fields"]["description"] = {
                            "type": "doc",
                            "version": 1,
                            "content": [
                                {
                                    "type": "paragraph",
                                    "content": [
                                        {
                                            "type": "text",
                                            "text": combined_description
                                        }
                                    ]
                                }
                            ]
                        }
                        
                        logger.info(f"Appending new description to existing ticket {existing_ticket_id}")
                    else:
                        error_msg = f"Failed to get existing ticket details: {existing_ticket_response.text}"
                        logger.warning(error_msg)
                        return json.dumps({
                            "success": False,
                            "message": error_msg
                        })
                    
                    # Update existing ticket
                    url = f"https://api.atlassian.com/ex/jira/{str(token.cloud_id)}/rest/api/3/issue/{existing_ticket_id}"
                    response = requests.put(url, headers=headers, json=api_data)
                    
                    if response.status_code not in (200, 204):
                        return json.dumps({
                            "success": False,
                            "message": f"Failed to update Jira ticket: {response.text}"
                        })
                    
                    # Get updated ticket details
                    get_response = requests.get(url, headers=headers)
                    if get_response.status_code != 200:
                        logger.warning(f"Failed to get updated ticket details: {get_response.text}")
                        issue_result = {"key": existing_ticket_id}
                    else:
                        issue_result = get_response.json()
                    
                    action_message = "updated"
                else:
                    # Create new ticket
                    url = f"https://api.atlassian.com/ex/jira/{str(token.cloud_id)}/rest/api/3/issue"
                    response = requests.post(url, headers=headers, json=api_data)
                    
                    if response.status_code not in (200, 201):
                        return json.dumps({
                            "success": False,
                            "message": f"Failed to create Jira ticket: {response.text}"
                        })
                    
                    issue_result = response.json()
                    action_message = "created"
                
                # Get the site URL from the token
                site_url = token.site_url
                if not site_url:
                    # Try to get the domain from the token
                    domain = token.domain
                    if domain:
                        site_url = f"https://{domain}.atlassian.net"
                    else:
                        # Try to get the site URL from the cloud resources
                        try:
                            resources_url = "https://api.atlassian.com/oauth/token/accessible-resources"
                            resources_response = requests.get(resources_url, headers={
                                "Authorization": f"Bearer {token.access_token}",
                                "Accept": "application/json"
                            })
                            
                            if resources_response.status_code == 200:
                                resources = resources_response.json()
                                for resource in resources:
                                    if resource.get("id") == str(token.cloud_id):
                                        site_url = resource.get("url", "")
                                        break
                        except Exception as e:
                            logger.warning(f"Failed to get site URL from resources: {e}")
                
                # Construct the ticket URL
                ticket_key = issue_result["key"]
                if site_url:
                    # Remove trailing slash if present
                    if site_url.endswith("/"):
                        site_url = site_url[:-1]
                    
                    # Construct the URL using the site URL
                    ticket_url = f"{site_url}/browse/{ticket_key}"
                else:
                    # Get the organization name for the URL
                    org_name = organization.name.lower().replace(" ", "-") if organization.name else "organization"
                    # Use the Atlassian Cloud URL format
                    ticket_url = f"https://{org_name}.atlassian.net/browse/{ticket_key}"
                
                # Update the session with ticket information
                session_repo = SessionToAgentRepository(db)
                try:
                    # Use the combined description for updates, or just the new description for new tickets
                    final_description = combined_description if is_update and 'combined_description' in locals() else description
                    
                    session_repo.update_session(
                            str(self.session_id),  # Ensure session_id is a string
                        {
                            "ticket_id": issue_result["key"],
                                "ticket_status": "Updated" if is_update else "Created",
                            "ticket_summary": summary,
                                "ticket_description": final_description,
                            "integration_type": "JIRA",
                                "ticket_priority": priority if priority_available else None,
                                "ticket_url": ticket_url
                        }
                    )
                except Exception as e:
                    logger.error(f"Failed to update session with ticket information: {e}")
                    # Continue since the ticket was created/updated successfully
                
                return json.dumps({
                    "success": True,
                    "message": f"Ticket {action_message} successfully: {issue_result['key']}",
                    "ticket_id": issue_result["key"],
                    "ticket_url": ticket_url,
                    "was_updated": is_update
                })
                
            except requests.exceptions.RequestException as e:
                logger.error(f"Request error {'updating' if is_update else 'creating'} Jira ticket: {e}")
                return json.dumps({
                    "success": False,
                    "message": f"Request error {'updating' if is_update else 'creating'} Jira ticket: {str(e)}"
                })
                
        except Exception as e:
            logger.error(f"Error {'updating' if 'is_update' in locals() and is_update else 'creating'} Jira ticket: {str(e)}")
            return json.dumps({
                "success": False,
                "message": f"Error {'updating' if 'is_update' in locals() and is_update else 'creating'} Jira ticket: {str(e)}"
            })
    
    def get_ticket_status(self, ticket_id: Optional[str] = None) -> str:
        """
        Get the status of a Jira ticket.
        
        Args:
            ticket_id (str, optional): The ID of the ticket to check. If not provided, will check for a ticket associated with the current session.
            
        Returns:
            str: JSON string with information about the ticket including its status.
        """
        try:
            import json
            import requests
            from datetime import datetime, timedelta
            
            # Use context manager for database operations
            with SessionLocal() as db:
                # If no ticket ID is provided, check if there's a ticket for this session
                if not ticket_id:
                    session_repo = SessionToAgentRepository(db)
                    try:
                        session = session_repo.get_session(str(self.session_id))
                    except Exception as e:
                        logger.error(f"Failed to get session: {e}")
                        return json.dumps({
                            "success": False,
                            "message": f"Failed to get session: {str(e)}"
                        })
                    
                    if not session or not session.ticket_id:
                        return json.dumps({
                            "success": False,
                            "message": "No ticket found for this session"
                        })
                        
                    ticket_id = session.ticket_id
                
                # Get the organization
                try:
                    org_uuid = UUID(str(self.org_id))
                    organization = db.query(Organization).filter(
                            Organization.id == org_uuid
                    ).first()
                except (ValueError, TypeError) as e:
                    logger.error(f"Invalid organization ID format: {e}")
                    return json.dumps({
                        "success": False,
                        "message": f"Invalid organization ID format: {str(e)}"
                    })
                
                if not organization:
                    return json.dumps({
                        "success": False,
                        "message": "Organization not found"
                    })
                
                # Get the ticket status from Jira
                from app.models.jira import JiraToken
                token = db.query(JiraToken).filter(
                    JiraToken.organization_id == organization.id
                ).first()
                
                if not token:
                    return json.dumps({
                        "success": False,
                        "message": "No Jira connection found"
                    })
            
            # Check if token is valid and refresh if needed
            is_valid = self.jira_service.validate_token(token)
            if not is_valid:
                # Implement synchronous token refresh
                try:
                    # Get client credentials from environment
                    import os
                    client_id = os.getenv("JIRA_CLIENT_ID")
                    client_secret = os.getenv("JIRA_CLIENT_SECRET")
                    
                    if not client_id or not client_secret:
                        return json.dumps({
                            "success": False,
                            "message": "Jira client credentials not configured"
                        })
                    
                    # Refresh token using requests
                    refresh_data = {
                        "grant_type": "refresh_token",
                        "client_id": client_id,
                        "client_secret": client_secret,
                        "refresh_token": token.refresh_token
                    }
                    
                    refresh_response = requests.post(
                        "https://auth.atlassian.com/oauth/token",
                        data=refresh_data
                    )
                    
                    if refresh_response.status_code != 200:
                        logger.error(f"Failed to refresh token: {refresh_response.text}")
                        return json.dumps({
                            "success": False,
                            "message": f"Failed to refresh Jira token: {refresh_response.text}"
                        })
                    
                    # Parse response and update token
                    token_data = refresh_response.json()
                    
                    # Update token in database
                    token.access_token = token_data["access_token"]
                    token.refresh_token = token_data.get("refresh_token", token.refresh_token)
                    token.token_type = token_data["token_type"]
                    token.expires_at = datetime.utcnow() + timedelta(seconds=token_data["expires_in"])
                    
                    db.commit()
                    logger.info("Successfully refreshed Jira token")
                    
                except Exception as e:
                    logger.error(f"Error refreshing Jira token: {e}")
                    return json.dumps({
                        "success": False,
                        "message": f"Error refreshing Jira token: {str(e)}"
                    })
            
            # Get the issue
            headers = {
                "Authorization": f"Bearer {token.access_token}",
                "Accept": "application/json"
            }
            
            # Ensure ticket_id is a string before using it in the URL
            ticket_id_str = str(ticket_id) if ticket_id else ""
            
            url = f"https://api.atlassian.com/ex/jira/{str(token.cloud_id)}/rest/api/3/issue/{ticket_id_str}"
            
            try:
                response = requests.get(url, headers=headers)
            except requests.exceptions.RequestException as e:
                logger.error(f"Failed to make request to Jira API: {e}")
                return json.dumps({
                    "success": False,
                    "message": f"Failed to make request to Jira API: {str(e)}"
                })
            
            if response.status_code != 200:
                return json.dumps({
                    "success": False,
                    "message": f"Failed to get Jira ticket: {response.text}"
                })
                
            try:
                issue_data = response.json()
            except ValueError as e:
                logger.error(f"Failed to parse Jira response: {e}")
                return json.dumps({
                    "success": False,
                    "message": f"Failed to parse Jira response: {str(e)}"
                })
            
            # Get the site URL from the token
            site_url = token.site_url
            if not site_url:
                # Try to get the domain from the token
                domain = token.domain
                if domain:
                    site_url = f"https://{domain}.atlassian.net"
                else:
                    # Try to get the site URL from the cloud resources
                    try:
                        resources_url = "https://api.atlassian.com/oauth/token/accessible-resources"
                        resources_response = requests.get(resources_url, headers={
                            "Authorization": f"Bearer {token.access_token}",
                            "Accept": "application/json"
                        })
                        
                        if resources_response.status_code == 200:
                            resources = resources_response.json()
                            for resource in resources:
                                if resource.get("id") == str(token.cloud_id):
                                    site_url = resource.get("url", "")
                                    break
                    except Exception as e:
                        logger.warning(f"Failed to get site URL from resources: {e}")
            
            # Construct the ticket URL
            if site_url:
                # Remove trailing slash if present
                if site_url.endswith("/"):
                    site_url = site_url[:-1]
                
                # Construct the URL using the site URL
                ticket_url = f"{site_url}/browse/{ticket_id_str}"
            else:
                # Get the organization name for the URL
                org_name = organization.name.lower().replace(" ", "-") if organization.name else "organization"
                # Use the Atlassian Cloud URL format
                ticket_url = f"https://{org_name}.atlassian.net/browse/{ticket_id_str}"
            
            return json.dumps({
                "success": True,
                "ticket_id": ticket_id_str,
                "ticket_status": issue_data.get("fields", {}).get("status", {}).get("name", "Unknown"),
                "ticket_summary": issue_data.get("fields", {}).get("summary", ""),
                "ticket_description": issue_data.get("fields", {}).get("description", ""),
                "ticket_priority": issue_data.get("fields", {}).get("priority", {}).get("name", ""),
                "ticket_url": ticket_url
            })
        except Exception as e:
            logger.error(f"Error getting Jira ticket status: {str(e)}")
            return json.dumps({
                "success": False,
                "message": f"Error getting Jira ticket status: {str(e)}"
            })
    
    def check_existing_ticket(self) -> str:
        """
        Check if a Jira ticket already exists for the current session.
        
        Returns:
            str: JSON string with information about whether a ticket exists.
        """
        try:
            import json
            
            # Use context manager for database operations
            with SessionLocal() as db:
                # Get the session
                session_repo = SessionToAgentRepository(db)
                try:
                    session = session_repo.get_session(str(self.session_id))
                except Exception as e:
                    logger.error(f"Failed to get session: {e}")
                    return json.dumps({
                        "exists": False,
                        "message": f"Failed to get session: {str(e)}"
                    })
                
                if not session or not session.ticket_id:
                    return json.dumps({
                        "exists": False,
                        "message": "No ticket found for this session"
                    })
                
            # Get the ticket status
            ticket_status_str = self.get_ticket_status(session.ticket_id)
            ticket_status = json.loads(ticket_status_str)
            
            if not ticket_status.get("success", False):
                return json.dumps({
                    "exists": True,
                    "ticket_id": session.ticket_id,
                    "ticket_status": session.ticket_status,
                    "ticket_summary": session.ticket_summary,
                    "ticket_description": session.ticket_description,
                    "ticket_priority": session.ticket_priority,
                    "message": "Ticket exists in the database but could not be retrieved from Jira"
                })
                
            return json.dumps({
                "exists": True,
                "ticket_id": ticket_status.get("ticket_id"),
                "ticket_status": ticket_status.get("ticket_status"),
                "ticket_summary": ticket_status.get("ticket_summary"),
                "ticket_description": ticket_status.get("ticket_description"),
                "ticket_priority": ticket_status.get("ticket_priority"),
                "ticket_url": ticket_status.get("ticket_url"),
                "message": "Ticket exists"
            })
        except Exception as e:
            logger.error(f"Error checking existing ticket: {str(e)}")
            return json.dumps({
                "exists": False,
                "message": f"Error checking existing ticket: {str(e)}"
            })
    
    # Private async methods that will be called by the public synchronous methods
    
    # Note: We've removed the async _check_existing_ticket method and replaced it with a synchronous implementation 
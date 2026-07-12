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
from typing import Optional
from uuid import UUID

from agno.tools import Toolkit

from app.core.exceptions import DocuSignAuthError
from app.core.logger import get_logger
from app.database import SessionLocal
from app.models.docusign import AgentDocuSignConfig
from app.services.docusign import DocuSignClient, get_credentials

logger = get_logger(__name__)


def _fail(message: str) -> str:
    return json.dumps({"success": False, "message": message})


class DocuSignTools(Toolkit):
    """Agent tools for sending DocuSign envelopes from a template and checking
    signature status mid-conversation. Registered on a ChatAgent when the agent
    has DocuSign enabled. Tool methods are synchronous; all DocuSign I/O goes
    through the shared `app.services.docusign` client and token manager."""

    def __init__(self, agent_id: str, org_id: str, session_id: str):
        super().__init__(name="docusign_tools")
        self.agent_id = str(agent_id)
        self.org_id = str(org_id)
        self.session_id = str(session_id)
        self.register(self.list_templates)
        self.register(self.send_envelope)
        self.register(self.get_envelope_status)

    def _config(self, db) -> Optional[AgentDocuSignConfig]:
        return db.query(AgentDocuSignConfig).filter(
            AgentDocuSignConfig.agent_id == self.agent_id).first()

    def list_templates(self) -> str:
        """List the DocuSign templates available to send.

        Returns:
            str: JSON with a list of {templateId, name}.
        """
        try:
            with SessionLocal() as db:
                config_row = self._config(db)
                if not config_row or not config_row.enabled:
                    return _fail("DocuSign is not enabled for this agent")
                try:
                    creds = get_credentials(db, UUID(self.org_id))
                    templates = DocuSignClient(
                        creds.access_token, creds.account_id, creds.base_uri).list_templates()
                except DocuSignAuthError as e:
                    return _fail(str(e))
                return json.dumps({"success": True, "templates": templates})
        except Exception as e:
            logger.error(f"Error listing DocuSign templates: {e}")
            return _fail(f"Error listing templates: {e}")

    def send_envelope(self, recipient_email: str, recipient_name: str,
                      template_id: Optional[str] = None,
                      email_subject: Optional[str] = None) -> str:
        """Send a DocuSign envelope from a template to a recipient for signature.

        Args:
            recipient_email (str): The signer's email address.
            recipient_name (str): The signer's full name.
            template_id (str, optional): Template to use. Defaults to the agent's
                configured default template.
            email_subject (str, optional): Subject line for the signing email.

        Returns:
            str: JSON with envelope_id and status.
        """
        try:
            with SessionLocal() as db:
                config_row = self._config(db)
                if not config_row or not config_row.enabled:
                    return _fail("DocuSign is not enabled for this agent")

                template = template_id or config_row.default_template_id
                if not template:
                    return _fail("No template specified and no default template configured")

                try:
                    creds = get_credentials(db, UUID(self.org_id))
                    result = DocuSignClient(
                        creds.access_token, creds.account_id, creds.base_uri
                    ).send_envelope_from_template(
                        template, recipient_email, recipient_name, email_subject=email_subject)
                except DocuSignAuthError as e:
                    return _fail(str(e))

                return json.dumps({
                    "success": True,
                    "message": f"Envelope sent to {recipient_email}",
                    "envelope_id": result.get("envelopeId"),
                    "status": result.get("status"),
                })
        except Exception as e:
            logger.error(f"Error sending DocuSign envelope: {e}")
            return _fail(f"Error sending envelope: {e}")

    def get_envelope_status(self, envelope_id: str) -> str:
        """Get the current status of a DocuSign envelope.

        Args:
            envelope_id (str): The envelope id returned when it was sent.

        Returns:
            str: JSON with the envelope status.
        """
        try:
            with SessionLocal() as db:
                config_row = self._config(db)
                if not config_row or not config_row.enabled:
                    return _fail("DocuSign is not enabled for this agent")
                try:
                    creds = get_credentials(db, UUID(self.org_id))
                    envelope = DocuSignClient(
                        creds.access_token, creds.account_id, creds.base_uri
                    ).get_envelope(envelope_id)
                except DocuSignAuthError as e:
                    return _fail(str(e))
                return json.dumps({
                    "success": True,
                    "envelope_id": envelope_id,
                    "status": envelope.get("status"),
                    "email_subject": envelope.get("emailSubject"),
                })
        except Exception as e:
            logger.error(f"Error getting DocuSign envelope status: {e}")
            return _fail(f"Error getting envelope status: {e}")

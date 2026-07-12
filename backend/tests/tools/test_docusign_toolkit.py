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
from contextlib import contextmanager
from unittest.mock import MagicMock, patch

import pytest

from app.models.docusign import AgentDocuSignConfig
from app.services.docusign.tokens import DocuSignCredentials
from app.tools.docusign_toolkit import DocuSignTools

CREDS = DocuSignCredentials(access_token="tok", account_id="acct", base_uri="https://na2.docusign.net")


@pytest.fixture
def agent_config(db, test_agent):
    config = AgentDocuSignConfig(
        agent_id=str(test_agent.id), enabled=True, default_template_id="tmpl-default")
    db.add(config)
    db.commit()
    return config


@pytest.fixture
def use_test_db(db):
    @contextmanager
    def _factory():
        yield db
    with patch("app.tools.docusign_toolkit.SessionLocal", _factory):
        yield


def _tools(test_agent, test_organization):
    return DocuSignTools(
        agent_id=str(test_agent.id), org_id=str(test_organization.id), session_id="s1")


def test_send_envelope_uses_default_template(use_test_db, agent_config, test_agent, test_organization):
    client = MagicMock()
    client.send_envelope_from_template.return_value = {"envelopeId": "env-1", "status": "sent"}
    with patch("app.tools.docusign_toolkit.get_credentials", return_value=CREDS), \
         patch("app.tools.docusign_toolkit.DocuSignClient", return_value=client):
        result = json.loads(_tools(test_agent, test_organization)
                            .send_envelope("s@x.com", "Sam"))

    assert result["success"] and result["envelope_id"] == "env-1"
    # default template used when none is passed
    args = client.send_envelope_from_template.call_args
    assert args.args[0] == "tmpl-default"


def test_send_envelope_requires_a_template(use_test_db, agent_config, test_agent, test_organization, db):
    agent_config.default_template_id = None
    db.commit()
    with patch("app.tools.docusign_toolkit.get_credentials", return_value=CREDS), \
         patch("app.tools.docusign_toolkit.DocuSignClient", return_value=MagicMock()):
        result = json.loads(_tools(test_agent, test_organization).send_envelope("s@x.com", "Sam"))
    assert result["success"] is False and "template" in result["message"].lower()


def test_tools_blocked_when_disabled(use_test_db, agent_config, test_agent, test_organization, db):
    agent_config.enabled = False
    db.commit()
    result = json.loads(_tools(test_agent, test_organization).send_envelope("s@x.com", "Sam"))
    assert result["success"] is False and "not enabled" in result["message"]


def test_get_envelope_status(use_test_db, agent_config, test_agent, test_organization):
    client = MagicMock()
    client.get_envelope.return_value = {"status": "completed", "emailSubject": "NDA"}
    with patch("app.tools.docusign_toolkit.get_credentials", return_value=CREDS), \
         patch("app.tools.docusign_toolkit.DocuSignClient", return_value=client):
        result = json.loads(_tools(test_agent, test_organization).get_envelope_status("env-1"))
    assert result["status"] == "completed"
    client.get_envelope.assert_called_once_with("env-1")


def test_list_templates(use_test_db, agent_config, test_agent, test_organization):
    client = MagicMock()
    client.list_templates.return_value = [{"templateId": "t1", "name": "NDA"}]
    with patch("app.tools.docusign_toolkit.get_credentials", return_value=CREDS), \
         patch("app.tools.docusign_toolkit.DocuSignClient", return_value=client):
        result = json.loads(_tools(test_agent, test_organization).list_templates())
    assert result["success"] and result["templates"][0]["templateId"] == "t1"

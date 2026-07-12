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

# DocuSign has separate demo (sandbox) and production auth hosts. Default to
# demo; set DOCUSIGN_AUTH_BASE=https://account.docusign.com for production.
# The per-account REST base URI comes from /oauth/userinfo, so it isn't hardcoded.
DEFAULT_AUTH_BASE = "https://account-d.docusign.com"
OAUTH_SCOPE = "signature"
API_VERSION = "v2.1"
TOKEN_REFRESH_LEEWAY_SECONDS = 5 * 60
HTTP_TIMEOUT_SECONDS = 30.0


def auth_base() -> str:
    return os.getenv("DOCUSIGN_AUTH_BASE", DEFAULT_AUTH_BASE).rstrip("/")


def oauth_credentials() -> dict:
    """Read the DocuSign integration-key credentials from the environment."""
    return {
        "client_id": os.getenv("DOCUSIGN_CLIENT_ID"),
        "client_secret": os.getenv("DOCUSIGN_CLIENT_SECRET"),
        "redirect_uri": os.getenv("DOCUSIGN_REDIRECT_URI"),
    }

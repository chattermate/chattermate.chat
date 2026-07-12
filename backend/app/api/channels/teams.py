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

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.channels.accounts import get_org_account_or_404, to_account_out
from app.channels import teams as teams_api
from app.core.auth import get_current_organization, require_permissions
from app.core.logger import get_logger
from app.database import get_db
from app.models.channels import ChannelType
from app.models.organization import Organization
from app.models.schemas.channel import ChannelAccountOut, TeamsConnectRequest
from app.models.user import User
from app.repositories.channels import ChannelAccountRepository

router = APIRouter()
logger = get_logger(__name__)


@router.post("", response_model=ChannelAccountOut)
async def connect_teams(
    request: TeamsConnectRequest,
    current_user: User = Depends(require_permissions("manage_organization")),
    organization: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db),
):
    """Connect a Microsoft Teams bot: validate the Azure AD app id + secret by
    minting a Bot Connector token, then store the encrypted credentials. The
    messaging endpoint (shown as the account's webhook URL) is set in Azure."""
    app_id = request.app_id.strip()
    app_password = request.app_password.strip()
    if await teams_api.request_connector_token(app_id, app_password) is None:
        raise HTTPException(
            status_code=400,
            detail="Invalid Azure app ID or client secret (could not obtain a Bot Framework token)")

    credentials = {"app_id": app_id, "app_password": app_password}
    display_name = request.display_name or "Microsoft Teams"

    repo = ChannelAccountRepository(db)
    existing = repo.get_by_external_id(ChannelType.TEAMS.value, app_id)
    if existing is not None:
        if existing.organization_id != organization.id:
            raise HTTPException(
                status_code=409, detail="This Teams app is already connected to another organization")
        repo.update_credentials(existing, credentials)
        account = repo.set_active(existing, True)
    else:
        account = repo.create_account(
            organization_id=organization.id,
            channel_type=ChannelType.TEAMS.value,
            external_account_id=app_id,
            credentials=credentials,
            display_name=display_name,
        )

    logger.info(f"Connected Teams app {app_id} for org {organization.id}")
    return to_account_out(db, account)


@router.delete("/{account_id}")
async def disconnect_teams(
    account_id: UUID,
    current_user: User = Depends(require_permissions("manage_organization")),
    organization: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db),
):
    """Disconnect a Teams bot (delete the account; the Azure app is untouched)."""
    account = get_org_account_or_404(db, account_id, organization)
    if account.channel_type != ChannelType.TEAMS.value:
        raise HTTPException(status_code=404, detail="Channel account not found")
    ChannelAccountRepository(db).delete(account)
    return {"status": "disconnected"}

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
from app.channels import sms_twilio
from app.core.auth import get_current_organization, require_permissions
from app.core.config import settings
from app.database import get_db
from app.models.channels import ChannelType
from app.models.organization import Organization
from app.models.schemas.channel import ChannelAccountOut, TwilioConnectRequest
from app.models.user import User
from app.repositories.channels import ChannelAccountRepository
from app.core.logger import get_logger

router = APIRouter()
logger = get_logger(__name__)


def _webhook_url(account_id) -> str:
    return f"{settings.BACKEND_URL.rstrip('/')}{settings.API_V1_STR}/webhooks/twilio/{account_id}"


@router.post("", response_model=ChannelAccountOut)
async def connect_twilio_sms(
    request: TwilioConnectRequest,
    current_user: User = Depends(require_permissions("manage_organization")),
    organization: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db),
):
    """Connect a Twilio number for SMS. Credentials are validated against the
    Twilio account API; the response's webhook_url must be set as the number's
    'A message comes in' webhook in the Twilio console."""
    if not await sms_twilio.validate_credentials(request.account_sid, request.auth_token):
        raise HTTPException(status_code=400, detail="Invalid Twilio Account SID or auth token")

    phone = request.phone_number.strip()
    repo = ChannelAccountRepository(db)
    existing = repo.get_by_external_id(ChannelType.SMS.value, phone)
    if existing is not None:
        if existing.organization_id != organization.id:
            raise HTTPException(status_code=409, detail="This number is already connected to another organization")
        repo.update_credentials(existing, {"account_sid": request.account_sid,
                                           "auth_token": request.auth_token})
        account = repo.set_active(existing, True)
    else:
        account = repo.create_account(
            organization_id=organization.id,
            channel_type=ChannelType.SMS.value,
            external_account_id=phone,
            credentials={"account_sid": request.account_sid, "auth_token": request.auth_token},
            display_name=f"SMS {phone}",
        )
    out = to_account_out(db, account)
    out.webhook_url = _webhook_url(account.id)
    return out


@router.delete("/{account_id}")
async def disconnect_twilio_sms(
    account_id: UUID,
    current_user: User = Depends(require_permissions("manage_organization")),
    organization: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db),
):
    account = get_org_account_or_404(db, account_id, organization)
    if account.channel_type != ChannelType.SMS.value:
        raise HTTPException(status_code=404, detail="Channel account not found")
    ChannelAccountRepository(db).delete(account)
    return {"status": "disconnected"}

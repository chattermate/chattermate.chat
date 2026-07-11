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

from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.channels.accounts import get_org_account_or_404, to_account_out
from app.channels.sms import get_provider, list_providers
from app.core.auth import get_current_organization, require_permissions
from app.core.config import settings
from app.database import get_db
from app.models.channels import ChannelType
from app.models.organization import Organization
from app.models.schemas.channel import ChannelAccountOut, SmsConnectRequest, SmsProviderInfo
from app.models.user import User
from app.repositories.channels import ChannelAccountRepository
from app.core.logger import get_logger

router = APIRouter()
logger = get_logger(__name__)


@router.get("/providers", response_model=List[SmsProviderInfo])
async def list_sms_providers(
    current_user: User = Depends(require_permissions("manage_organization")),
):
    """Available SMS providers and the credential fields each needs — drives
    the connect form's provider dropdown."""
    return [
        SmsProviderInfo(
            name=p.name, label=p.label,
            fields=[{"key": f.key, "label": f.label, "secret": f.secret, "optional": f.optional}
                    for f in p.credential_fields],
        )
        for p in list_providers()
    ]


@router.post("", response_model=ChannelAccountOut)
async def connect_sms(
    request: SmsConnectRequest,
    current_user: User = Depends(require_permissions("manage_organization")),
    organization: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db),
):
    """Connect an SMS number through one of the supported providers. Validates
    the credentials with the provider before saving."""
    provider = get_provider(request.provider)
    if provider is None:
        raise HTTPException(status_code=400, detail=f"Unknown SMS provider '{request.provider}'")

    phone = request.phone_number.strip()
    try:
        await provider.validate_credentials(phone, request.credentials)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    repo = ChannelAccountRepository(db)
    existing = repo.get_by_external_id(ChannelType.SMS.value, phone)
    if existing is not None:
        if existing.organization_id != organization.id:
            raise HTTPException(status_code=409, detail="This number is already connected to another organization")
        repo.update_credentials(existing, request.credentials)
        existing.settings = {**(existing.settings or {}), "provider": request.provider}
        db.commit()
        account = repo.set_active(existing, True)
    else:
        account = repo.create_account(
            organization_id=organization.id,
            channel_type=ChannelType.SMS.value,
            external_account_id=phone,
            credentials=request.credentials,
            display_name=f"SMS {phone} ({provider.label})",
            settings={"provider": request.provider},
        )
    out = to_account_out(db, account)
    out.webhook_url = f"{settings.BACKEND_URL.rstrip('/')}{settings.API_V1_STR}/webhooks/sms/{request.provider}/{account.id}"
    return out


@router.delete("/{account_id}")
async def disconnect_sms(
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

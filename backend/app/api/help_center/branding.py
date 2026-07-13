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

Help-center settings + branding endpoints (settings get/put, logo upload).
"""

import io
from uuid import UUID, uuid4

from fastapi import APIRouter, Depends, File, HTTPException, Request, UploadFile
from sqlalchemy.orm import Session, selectinload

from app.core.auth import require_permissions
from app.core.config import settings as app_settings
from app.core.cors import update_cors_middleware
from app.database import get_db
from app.models.agent import Agent
from app.models.help_center import HelpCenterSettings
from app.models.schemas.help_center import (
    DnsRecord,
    DomainStatusResponse,
    HelpCenterAgentOption,
    HelpCenterSettingsResponse,
    HelpCenterSettingsUpdate,
)
from app.models.user import User
from app.repositories.faq import FAQRepository
from app.repositories.help_center import HelpCenterRepository
from app.services.file_storage import resolve_public_url, store_upload
from app.services.help_center_access import check_help_center_access, help_center_allowed
from app.services.help_center_settings import get_or_create_settings, live_url

router = APIRouter()

MAX_LOGO_BYTES = 2 * 1024 * 1024
# Extensions are derived from the VALIDATED content type, never the client
# filename — a filename-derived extension could store scriptable content
# (.svg/.html) under the static uploads mount.
_LOGO_TYPES = {"image/png": ".png", "image/svg+xml": ".svg"}
# Conservative SVG screen: the logo renders on the public help center, so
# active content in an uploaded SVG would be stored XSS there.
_SVG_FORBIDDEN = (b"<script", b"javascript:", b"onload=", b"onerror=", b"onclick=", b"<foreignobject")


def domain_status_response(row: HelpCenterSettings) -> DomainStatusResponse:
    """DNS-records table for the admin UI, shaped from stored state."""
    records = []
    if row.custom_domain:
        records = [
            DnsRecord(
                type="CNAME",
                host=row.custom_domain,
                value=app_settings.HELP_CENTER_CNAME_TARGET,
                verified=row.cname_record_verified,
            ),
            DnsRecord(
                type="TXT",
                host=f"_chattermate.{row.custom_domain}",
                value=f"cm-verify={row.domain_verification_token}",
                verified=row.txt_record_verified,
            ),
        ]
    return DomainStatusResponse(
        custom_domain=row.custom_domain,
        domain_status=row.domain_status,
        ssl_status=row.ssl_status,
        records=records,
        domain_verified_at=row.domain_verified_at,
    )


async def settings_response(
    db: Session, row: HelpCenterSettings, organization_id: UUID
) -> HelpCenterSettingsResponse:
    agents = (
        db.query(Agent)
        .options(selectinload(Agent.widgets))  # avoid a lazy-load query per agent
        .filter(Agent.organization_id == organization_id)
        .order_by(Agent.name)
        .all()
    )
    response = HelpCenterSettingsResponse.model_validate(row)
    response.logo_url = await resolve_public_url(row.logo_url) if row.logo_url else None
    response.live_url = live_url(row)
    response.published_count = FAQRepository(db).count_published(organization_id)
    response.plan_allowed = help_center_allowed(db, organization_id)
    response.agents = [
        HelpCenterAgentOption(
            id=agent.id,
            name=agent.display_name or agent.name,
            has_widget=bool(agent.widgets),
        )
        for agent in agents
    ]
    response.domain = domain_status_response(row)
    return response


@router.get("/settings", response_model=HelpCenterSettingsResponse)
async def get_settings(
    current_user: User = Depends(require_permissions("manage_knowledge")),
    db: Session = Depends(get_db),
):
    """Get-or-create the org's help center settings. Ungated read: the response
    carries plan_allowed so the UI can render the upgrade lock."""
    row = get_or_create_settings(db, current_user.organization)
    return await settings_response(db, row, current_user.organization_id)


@router.put("/settings", response_model=HelpCenterSettingsResponse)
async def update_settings(
    payload: HelpCenterSettingsUpdate,
    request: Request,
    current_user: User = Depends(require_permissions("manage_knowledge")),
    db: Session = Depends(get_db),
):
    check_help_center_access(db, current_user.organization_id)
    row = get_or_create_settings(db, current_user.organization)
    updates = payload.model_dump(exclude_unset=True)
    if updates.get("agent_id") is not None:
        agent = db.query(Agent).filter(
            Agent.id == updates["agent_id"],
            Agent.organization_id == current_user.organization_id,
        ).first()
        if not agent:
            raise HTTPException(status_code=404, detail="Agent not found")
    was_enabled = row.enabled
    for field, value in updates.items():
        setattr(row, field, value)
    row = HelpCenterRepository(db).update(row)
    # Toggling `enabled` changes which {slug}.{base} origins the widget may call,
    # so refresh the CORS allowlist (and propagate to other workers via Redis).
    if "enabled" in updates and updates["enabled"] != was_enabled:
        update_cors_middleware(request.app)
    return await settings_response(db, row, current_user.organization_id)


@router.post("/logo", response_model=HelpCenterSettingsResponse)
async def upload_logo(
    file: UploadFile = File(...),
    current_user: User = Depends(require_permissions("manage_knowledge")),
    db: Session = Depends(get_db),
):
    check_help_center_access(db, current_user.organization_id)
    row = get_or_create_settings(db, current_user.organization)

    content = await file.read()
    if len(content) > MAX_LOGO_BYTES:
        raise HTTPException(status_code=400, detail="Logo must be 2 MB or smaller.")
    if file.content_type not in _LOGO_TYPES:
        raise HTTPException(status_code=400, detail="Logo must be a PNG or SVG file.")
    if file.content_type == "image/svg+xml":
        lowered = content.lower()
        if any(marker in lowered for marker in _SVG_FORBIDDEN):
            raise HTTPException(status_code=400, detail="SVG logos must not contain scripts or event handlers.")
    else:
        try:
            from PIL import Image
            Image.open(io.BytesIO(content)).verify()
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid image file.")

    file_name = f"{uuid4()}{_LOGO_TYPES[file.content_type]}"
    row.logo_url = await store_upload(
        content,
        f"help_center/{current_user.organization_id}",
        file_name,
        content_type=file.content_type,
    )
    row = HelpCenterRepository(db).update(row)
    return await settings_response(db, row, current_user.organization_id)


@router.delete("/logo", response_model=HelpCenterSettingsResponse)
async def remove_logo(
    current_user: User = Depends(require_permissions("manage_knowledge")),
    db: Session = Depends(get_db),
):
    check_help_center_access(db, current_user.organization_id)
    row = get_or_create_settings(db, current_user.organization)
    row.logo_url = None
    row = HelpCenterRepository(db).update(row)
    return await settings_response(db, row, current_user.organization_id)

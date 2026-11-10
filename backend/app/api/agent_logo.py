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

Upload and removal of the launcher logo.
"""

from uuid import UUID, uuid4

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from fastapi.concurrency import run_in_threadpool
from sqlalchemy.orm import Session

from app.api.agent import verify_agent_access
from app.core.auth import require_unified_permissions
from app.core.logger import get_logger
from app.database import get_db
from app.models.agent import Agent, AgentCustomization
from app.models.schemas.agent_customization import CustomizationResponse, LauncherIcon
from app.services.feature_gate import check_feature_access
from app.services.file_storage import delete_upload, store_upload
from app.services.launcher import (
    FREE_ICON_FALLBACK,
    LAUNCHER_KEY,
    LOGO_FEATURE,
    UPGRADE_MESSAGE,
    first_save_metadata,
)
from app.services.launcher_logo import (
    LOGO_CONTENT_TYPE,
    LOGO_EXTENSION,
    MAX_LOGO_BYTES,
    LogoRejected,
    process_logo,
)

router = APIRouter()
logger = get_logger(__name__)


def _owned_agent(db: Session, agent_id: UUID, auth_info: dict) -> Agent:
    agent = db.query(Agent).filter(Agent.id == agent_id).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    verify_agent_access(agent, auth_info)
    return agent


def _customization(db: Session, agent_id: UUID):
    return db.query(AgentCustomization).filter(AgentCustomization.agent_id == agent_id).first()


def _with_launcher(metadata: dict, **changes) -> dict:
    """A new dict on purpose: a JSON column only notices reassignment."""
    return {**(metadata or {}), LAUNCHER_KEY: {**((metadata or {}).get(LAUNCHER_KEY) or {}), **changes}}


@router.post("/{agent_id}/customization/logo/shopify", response_model=CustomizationResponse)
@router.post("/{agent_id}/customization/logo", response_model=CustomizationResponse)
async def upload_launcher_logo(
    agent_id: UUID,
    logo: UploadFile = File(...),
    auth_info: dict = Depends(require_unified_permissions("manage_agents")),
    db: Session = Depends(get_db)
):
    """Store a new launcher logo, replacing any previous one."""
    _owned_agent(db, agent_id, auth_info)
    organization_id = auth_info["organization_id"]
    check_feature_access(db, organization_id, LOGO_FEATURE, UPGRADE_MESSAGE)

    # One byte past the limit is enough to know it's too big.
    content = await logo.read(MAX_LOGO_BYTES + 1)
    try:
        processed = await run_in_threadpool(process_logo, content)
    except LogoRejected as rejected:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(rejected))

    try:
        logo_url = await store_upload(
            processed.content, f"agents/{organization_id}", f"{uuid4()}{LOGO_EXTENSION}", LOGO_CONTENT_TYPE)
    except Exception as e:
        logger.error(f"Error storing launcher logo: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to upload logo")

    customization = _customization(db, agent_id)
    if not customization:
        customization = AgentCustomization(agent_id=agent_id, customization_metadata=first_save_metadata(None))
        db.add(customization)
    previous_url = customization.icon_url
    customization.icon_url = logo_url
    customization.customization_metadata = _with_launcher(
        customization.customization_metadata, logo_transparent=processed.has_transparency)
    try:
        db.commit()
    except Exception as e:
        db.rollback()
        await delete_upload(logo_url)
        logger.error(f"Error saving launcher logo: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to upload logo")
    db.refresh(customization)

    # Only now: a failed save above must leave the old logo working.
    if previous_url:
        await delete_upload(previous_url)
    return customization


@router.delete("/{agent_id}/customization/logo/shopify", response_model=CustomizationResponse)
@router.delete("/{agent_id}/customization/logo", response_model=CustomizationResponse)
async def remove_launcher_logo(
    agent_id: UUID,
    auth_info: dict = Depends(require_unified_permissions("manage_agents")),
    db: Session = Depends(get_db)
):
    """Remove the logo. Open to every plan, so a lapsed org can still clean up."""
    _owned_agent(db, agent_id, auth_info)
    customization = _customization(db, agent_id)
    if not customization:
        raise HTTPException(status_code=404, detail="Agent has no customization")

    previous_url = customization.icon_url
    metadata = customization.customization_metadata or {}
    launcher = {k: v for k, v in (metadata.get(LAUNCHER_KEY) or {}).items()
                if k not in ('background', 'logo_transparent')}
    if launcher.get('icon') == LauncherIcon.LOGO.value:
        launcher['icon'] = FREE_ICON_FALLBACK
    customization.customization_metadata = {**metadata, LAUNCHER_KEY: launcher}
    customization.icon_url = None
    db.commit()
    db.refresh(customization)

    if previous_url:
        await delete_upload(previous_url)
    return customization

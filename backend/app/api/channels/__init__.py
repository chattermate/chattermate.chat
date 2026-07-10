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

from fastapi import APIRouter

from app.api.channels.accounts import router as accounts_router
from app.api.channels.telegram import router as telegram_router
from app.api.channels.meta import router as meta_router
from app.api.channels.agent_config import router as agent_config_router

# Aggregates channel onboarding/management routes under /channels
router = APIRouter()
router.include_router(accounts_router, tags=["channels"])
router.include_router(telegram_router, prefix="/telegram", tags=["channels"])
router.include_router(meta_router, prefix="/meta", tags=["channels"])
router.include_router(agent_config_router, prefix="/agent-config", tags=["channels"])

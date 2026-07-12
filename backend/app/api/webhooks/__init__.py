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

from app.api.webhooks.telegram import router as telegram_router
from app.api.webhooks.slack import router as slack_router
from app.api.webhooks.email import router as email_router
from app.api.webhooks.sms import router as sms_router
from app.api.webhooks.line import router as line_router
from app.api.webhooks.teams import router as teams_router
from app.api.webhooks.meta import router as meta_router

# Aggregates every channel's webhook routes under /webhooks
router = APIRouter()
router.include_router(telegram_router, prefix="/telegram", tags=["webhooks"])
router.include_router(slack_router, prefix="/slack", tags=["webhooks"])
router.include_router(email_router, prefix="/email", tags=["webhooks"])
router.include_router(sms_router, prefix="/sms", tags=["webhooks"])
router.include_router(line_router, prefix="/line", tags=["webhooks"])
router.include_router(teams_router, prefix="/teams", tags=["webhooks"])
# One endpoint for all three Meta products (WhatsApp / Messenger / Instagram)
router.include_router(meta_router, prefix="/meta", tags=["webhooks"])

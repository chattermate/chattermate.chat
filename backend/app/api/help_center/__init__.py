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

Admin API for the FAQ manager + help center, split by concern
(settings/branding, FAQ content, generation jobs; the custom-domain router
joins in the domain-verification unit). Mounted at /api/v1/help-center.
"""

from fastapi import APIRouter

from app.api.help_center.branding import router as branding_router
from app.api.help_center.faqs import router as faqs_router
from app.api.help_center.generation import router as generation_router

router = APIRouter()
router.include_router(branding_router)
router.include_router(faqs_router)
router.include_router(generation_router)

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

"""What the inbox may do on the org's plan. Each is a flag in the plan's
features; community installs get them all (feature_gate.plan_flags).

- Every plan: the inbox itself, taking over, handing back, notes and @-mentions.
- Starter and up: snooze and saved replies.
- Growth and up: AI in the inbox (improve a reply, refresh the summary, draft
  a help-center answer from the conversation).

A lower plan keeps what the team saved (saved replies stay listed, editable and
removable in Settings): it can't add more, or use them in a reply. A failed plan
read allows the feature: a blip must never take a tool away from a paying team.
"""

from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.services.feature_gate import plan_flag_on

SNOOZE_FEATURE = "inbox_snooze"
SAVED_REPLIES_FEATURE = "saved_replies"
INBOX_AI_FEATURE = "inbox_ai"

UPGRADE_MESSAGES = {
    SNOOZE_FEATURE: "Snooze is on the Starter plan and up",
    SAVED_REPLIES_FEATURE: "Saved replies are on the Starter plan and up",
    INBOX_AI_FEATURE: "AI in the inbox is on the Growth plan and up",
}


def require_inbox_feature(db: Session, organization_id: UUID, feature: str) -> None:
    """403 with the upgrade line when the plan leaves `feature` out."""
    if not plan_flag_on(db, organization_id, feature):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=UPGRADE_MESSAGES[feature])

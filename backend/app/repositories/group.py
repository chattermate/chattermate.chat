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

from sqlalchemy.orm import Session, joinedload
from app.models.user import UserGroup

class GroupRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_group_with_users(self, group_id: str):
        return self.db.query(UserGroup)\
            .options(joinedload(UserGroup.users))\
            .filter(UserGroup.id == group_id)\
            .first() 
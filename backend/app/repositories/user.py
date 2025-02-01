from sqlalchemy.orm import Session
from app.models.user import User
from uuid import UUID
from typing import List, Optional
from app.core.logger import get_logger

logger = get_logger(__name__)


class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_users_by_organization(self, organization_id: UUID) -> List[User]:
        """Get all users in an organization"""
        return self.db.query(User)\
            .filter(User.organization_id == organization_id)\
            .order_by(User.created_at.desc())\
            .all()

    def get_user(self, user_id: str | UUID) -> User | None:
        """Get a user by ID"""
        if isinstance(user_id, str):
            user_id = UUID(user_id)
        return self.db.query(User).filter(User.id == user_id).first()

    def get_user_by_email(self, email: str) -> User | None:
        """Get a user by email"""
        return self.db.query(User).filter(User.email == email).first()

    def create_user(self, **kwargs) -> User:
        """Create a new user"""
        user = User(**kwargs)
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user

    def update_user(self, user_id: str, **kwargs) -> Optional[User]:
        """Update user"""
        user = self.get_user(user_id)
        if user:
            for key, value in kwargs.items():
                setattr(user, key, value)
            self.db.commit()
            self.db.refresh(user)
        return user

    def delete_user(self, user_id: str) -> bool:
        """Delete user"""
        user = self.get_user(user_id)
        if user:
            self.db.delete(user)
            self.db.commit()
            return True
        return False

    def get_user_fcm_token(self, user_id: str) -> Optional[str]:
        """Get user's FCM token for web notifications"""
        try:
            user = self.db.query(User).filter(User.id == user_id).first()
            return user.fcm_token_web if user else None
        except Exception as e:
            logger.error(f"Error getting user FCM token: {str(e)}")
            return None

    def update_fcm_token(self, user_id: str, token: str) -> bool:
        """Update user's FCM token"""
        try:
            user = self.db.query(User).filter(User.id == user_id).first()
            if not user:
                return False

            user.fcm_token_web = token
            self.db.commit()
            return True
        except Exception as e:
            logger.error(f"Error updating FCM token: {str(e)}")
            self.db.rollback()
            return False

    def clear_fcm_token(self, user_id: str) -> bool:
        """Clear user's FCM token"""
        try:
            user = self.db.query(User).filter(User.id == user_id).first()
            if not user:
                return False

            user.fcm_token_web = None
            self.db.commit()
            return True
        except Exception as e:
            logger.error(f"Error clearing FCM token: {str(e)}")
            self.db.rollback()
            return False

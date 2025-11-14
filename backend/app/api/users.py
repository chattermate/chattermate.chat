"""
ChatterMate - Users
Copyright (C) 2024 ChatterMate

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>
"""

from fastapi import APIRouter, Depends, HTTPException, status, Response, Request, Body, File, UploadFile
from fastapi.responses import JSONResponse
from fastapi.security import HTTPBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import List
import json
import os
from urllib.parse import quote
from sqlalchemy.sql import func
from uuid import UUID

from app.database import get_db
from app.models.user import User
from app.models.schemas.user import UserCreate, UserStatusUpdate, UserUpdate, UserResponse, TokenResponse
from app.core.security import create_access_token, create_refresh_token, verify_token
from app.core.auth import get_current_user, require_permissions
from app.core.logger import get_logger
from app.repositories.user import UserRepository
from pydantic import BaseModel
from app.models.role import Role
from app.core.s3 import get_s3_signed_url, upload_file_to_s3, delete_file_from_s3
from app.core.config import settings
from app.repositories.shopify_shop_repository import ShopifyShopRepository
from app.models.schemas.shopify.shopify_shop import ShopifyShopUpdate
# Try to import enterprise modules
try:
    from app.enterprise.repositories.subscription import SubscriptionRepository
    from app.enterprise.repositories.plan import PlanRepository

    HAS_ENTERPRISE = True
except ImportError:
    HAS_ENTERPRISE = False

logger = get_logger(__name__)
router = APIRouter(
    tags=["users"]
)

security = HTTPBearer()

UPLOAD_DIR = "uploads/user"
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

def get_file_extension(filename: str) -> str:
    return os.path.splitext(filename)[1].lower()

async def save_upload_file(file: UploadFile, org_id: str, user_id: str) -> str:
    """Save uploaded file and return the file path"""
    # Generate unique filename
    file_extension = get_file_extension(file.filename)
    filename = f"profile{file_extension}"
    
    if settings.S3_FILE_STORAGE:
        folder = f"users/{org_id}/{user_id}"
        content = await file.read()
        return await upload_file_to_s3(content, folder, filename, content_type=file.content_type)
    else:
        # Local storage
        # Create upload directory if it doesn't exist
        user_upload_dir = os.path.join(UPLOAD_DIR, org_id, user_id)
        os.makedirs(user_upload_dir, exist_ok=True)
        
        file_path = os.path.join(user_upload_dir, filename)
        
        # Save file
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        return f"/uploads/user/{org_id}/{user_id}/{filename}"

@router.post("", response_model=UserResponse)
async def create_user(
    user_data: UserCreate,
    current_user: User = Depends(require_permissions("manage_users")),
    db: Session = Depends(get_db)
):
    """Create a new user"""
    try:
        user_repo = UserRepository(db)
        
        # Check if email already exists
        if user_repo.get_user_by_email(user_data.email):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )

        # Check enterprise subscription limits if enterprise module is available
        if HAS_ENTERPRISE:
            # Get organization's subscription and plan
            subscription_repo = SubscriptionRepository(db)
            subscription = subscription_repo.get_by_organization(str(current_user.organization_id))
            
            if not subscription:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="No active subscription found"
                )

            # Check subscription status
            if not subscription.is_active() and not subscription.is_trial():
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Subscription is not active"
                )

            # Check if max_users feature exists in plan
            plan_repo = PlanRepository(db)
            if plan_repo.check_feature_availability(subscription.plan_id, 'max_users'):
                # Get current active users count
                active_users = user_repo.get_active_users_count(str(current_user.organization_id))

                # Check against subscription quantity (user seats)
                if subscription.quantity is not None and active_users >= subscription.quantity:
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail=f"Maximum number of users ({subscription.quantity}) reached for your plan. Please upgrade your plan to add more users."
                    )
        
        # Hash the password
        hashed_password = User.get_password_hash(user_data.password)
        
        # Create user with organization from current user
        new_user = user_repo.create_user(
            email=user_data.email,
            full_name=user_data.full_name,
            hashed_password=hashed_password,
            organization_id=current_user.organization_id,
            is_active=user_data.is_active,
            role_id=user_data.role_id
        )

        return new_user.to_dict()
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating user: {str(e)}")
        if "duplicate key value violates unique constraint" in str(e):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("", response_model=List[UserResponse])
async def list_users(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(require_permissions("manage_users")),
    db: Session = Depends(get_db)
):
    """List all users in the organization"""
    try:
        user_repo = UserRepository(db)
        users = user_repo.get_users_by_organization(current_user.organization_id)

        # Get signed URLs for profile pictures if using S3
        if settings.S3_FILE_STORAGE:
            for user in users:
                if user.profile_pic:
                    try:
                        user.profile_pic = await get_s3_signed_url(user.profile_pic)
                    except Exception as e:
                        logger.error(f"Error getting signed URL for user profile picture: {str(e)}")
                        # Don't fail the request if we can't get the signed URL
                        pass

        return users
    except Exception as e:
        logger.error(f"Error listing users: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: str,
    current_user: User = Depends(require_permissions("manage_users")),
    db: Session = Depends(get_db)
):
    """Get user by ID"""
    user_repo = UserRepository(db)
    user = user_repo.get_user(user_id)
    
    if not user or user.organization_id != current_user.organization_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user.to_dict()


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: str,
    current_user: User = Depends(require_permissions("manage_users")),
    db: Session = Depends(get_db)
):
    """Delete a user"""
    try:
        user_repo = UserRepository(db)
        user = user_repo.get_user(user_id)
        
        if not user or user.organization_id != current_user.organization_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        
        user_repo.delete_user(user_id)
        return Response(status_code=status.HTTP_204_NO_CONTENT)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to delete user: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete user"
        )


@router.post("/login", response_model=TokenResponse)
async def login(
    response: Response,
    request: Request,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """Authenticate user and set cookies"""
    try:
        # Verify credentials
        user = db.query(User).filter(
            User.email == form_data.username,
            User.is_active == True
        ).first()
  
        if not user or not user.verify_password(form_data.password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Update online status
        user.is_online = True
        user.last_seen = func.now()
        db.commit()

        # Get role info
        role = db.query(Role).filter(Role.id == user.role_id).first()

        # Generate tokens
        token_data = {"sub": str(user.id), "org": str(user.organization_id)}
        access_token = create_access_token(token_data)
        refresh_token = create_refresh_token(token_data)

        # Set secure cookies
        response.set_cookie(
            key="access_token",
            value=access_token,
            httponly=True,
            secure=True,
            samesite="none",  # Changed to "none" for cross-domain support (shopifiy)
            max_age=180  # 30 minutes
        )
        response.set_cookie(
            key="refresh_token",
            value=refresh_token,
            httponly=True,
            secure=True,
            samesite="none",  # Changed to "none" for cross-domain support (shopifiy)
            max_age=604800  # 7 days
        )

        # Set session data with role information
        user_info = json.dumps({
            "id": str(user.id),
            "email": user.email,
            "full_name": user.full_name,
            "organization_id": str(user.organization_id),
            "role": role.to_dict() if role else None
        }, default=str)
        response.set_cookie(
            key="user_info",
            value=quote(user_info),  # URL encode the JSON string
            samesite="none",  # Changed to "none" for cross-domain support (shopifiy)
            secure=True,  # Required when samesite="none"
            max_age=604800  # 7 days
        )

        # Handle Shopify shop update if shop_id is provided in query params
        shop_id = request.query_params.get('shop_id')
        if shop_id:
            try:
                shop_repository = ShopifyShopRepository(db)
                db_shop = shop_repository.get_shop(shop_id)
                
                if db_shop:
                    # Update shop with user's organization_id
                    shop_update = ShopifyShopUpdate(
                        organization_id=str(user.organization_id)
                    )
                    shop_repository.update_shop(db_shop.id, shop_update)
                    db.commit()
                    logger.info(f"Updated shop {db_shop.shop_domain} with organization_id {user.organization_id} after login")
                else:
                    logger.warning(f"Shop {shop_id} not found during login")
            except Exception as e:
                logger.error(f"Error updating shopify shop during login: {str(e)}")
                # Don't fail login if shop update fails

        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "email": user.email,
                "full_name": user.full_name,
                "organization_id": user.organization_id,
                "profile_pic": await get_s3_signed_url(user.profile_pic) if settings.S3_FILE_STORAGE and user.profile_pic else user.profile_pic,
                "is_online": user.is_online,
                "last_seen": user.last_seen,
                "is_active": user.is_active,
                "role": role.to_dict() if role else None
            }
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login failed: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Login failed. Please try again later."
        )


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(
    response: Response,
    request: Request,  # Add this to access cookies
    db: Session = Depends(get_db)
):
    """Get new access token using refresh token from cookie"""
    try:
        # Get refresh token from cookie
        refresh_token = request.cookies.get("refresh_token")
        if not refresh_token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Refresh token missing",
                headers={"WWW-Authenticate": "Bearer"},
            )

        payload = verify_token(refresh_token)

        if not payload or payload.get("type") != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token",
                headers={"WWW-Authenticate": "Bearer"},
            )

        user_id = payload.get("sub")
        org_id = payload.get("org")

        if not user_id or not org_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Convert string UUID to UUID object
        try:
            user_id = UUID(user_id)
            org_id = UUID(org_id)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload format",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Verify user still exists and is active
        user = db.query(User).filter(User.id == user_id).first()
        if not user or not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found or inactive",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Update last seen
        user.last_seen = func.now()
        db.commit()

        role = db.query(Role).filter(Role.id == user.role_id).first()
  
        # Generate new tokens
        token_data = {"sub": str(user_id), "org": str(org_id)}
        access_token = create_access_token(token_data)
        refresh_token = create_refresh_token(token_data)

        # Set secure cookies
        response.set_cookie(
            key="access_token",
            value=access_token,
            httponly=True,
            secure=True,
            samesite="none",  # Changed to "none" for cross-domain support (shopifiy)
            max_age=1800  # 30 minutes
        )
        response.set_cookie(
            key="refresh_token",
            value=refresh_token,
            httponly=True,
            secure=True,
            samesite="none",  # Changed to "none" for cross-domain support (shopifiy)
            max_age=604800  # 7 days
        )

        # Set session data
        user_info = json.dumps({
            "id": str(user.id),
            "email": user.email,
            "full_name": user.full_name,
            "organization_id": str(user.organization_id),
            "role": role.to_dict() if role else None
        }, default=str)
        response.set_cookie(
            key="user_info",
            value=quote(user_info),  # URL encode the JSON string
            samesite="none",  # Changed to "none" for cross-domain support (shopifiy)
            secure=True,  # Required when samesite="none"
            max_age=604800  # 7 days
        )

        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "email": user.email,
                "full_name": user.full_name,
                "organization_id": user.organization_id,
                "profile_pic": await get_s3_signed_url(user.profile_pic) if settings.S3_FILE_STORAGE and user.profile_pic else user.profile_pic,
                "is_online": user.is_online,
                "last_seen": user.last_seen,
                "is_active": user.is_active,
                "role": role.to_dict() if role else None
            }
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Token refresh failed: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Token refresh failed. Please try again later."
        )


@router.post("/logout")
async def logout(
    response: Response,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Logout user and clear cookies"""
    # Update online status
    user_repo = UserRepository(db)
    user_repo.update_user(current_user.id, is_online=False, last_seen=func.now())

    # Clear cookies
    response.delete_cookie("access_token")
    response.delete_cookie("refresh_token")
    response.delete_cookie("user_info")

    return {"message": "Successfully logged out"}


class FCMTokenUpdate(BaseModel):
    token: str


@router.post("/token/fcm-token")
async def update_fcm_token(
    token_data: FCMTokenUpdate = Body(...),
    current_user: User = Depends(get_current_user),
    db=Depends(get_db)
):
    """Update user's FCM token for web notifications"""
    try:
        user_repo = UserRepository(db)
        success = user_repo.update_fcm_token(current_user.id, token_data.token)

        if success:
            return {"message": "FCM token updated successfully"}
        return {"error": "Failed to update FCM token"}

    except Exception as e:
        logger.error(f"Error updating FCM token: {str(e)}")
        return {"error": str(e)}


@router.delete("/token/fcm-token")
async def clear_fcm_token(
    current_user: User = Depends(get_current_user),
    db=Depends(get_db)
):
    """Clear user's FCM token"""
    try:
        user_repo = UserRepository(db)
        print(current_user.id)
        success = user_repo.clear_fcm_token(current_user.id)

        if success:
            return {"message": "FCM token cleared successfully"}
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to clear FCM token"
        )

    except Exception as e:
        logger.error(f"Error clearing FCM token: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.patch("/me", response_model=UserResponse)
async def update_profile(
    data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update current user's profile"""
    try:
        user_repo = UserRepository(db)
        
        # Remove role_id from update data to prevent role modification
        if hasattr(data, 'role_id'):
            delattr(data, 'role_id')
        
        # If updating email, check if it's already taken
        if data.email and data.email != current_user.email:
            existing_user = user_repo.get_user_by_email(data.email)
            if existing_user:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email already registered"
                )
        
        # Verify current password if updating password
        if data.password:
            if not data.current_password:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Current password is required"
                )
            if not current_user.verify_password(data.current_password):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Incorrect current password"
                )
            
            # Hash new password
            data.password = User.get_password_hash(data.password)
        
        # Remove current_password from update data
        if hasattr(data, 'current_password'):
            delattr(data, 'current_password')
        
        updated_user = user_repo.update_user(
            current_user.id,
            **data.dict(exclude_unset=True)
        )
                # Generate signed URL if using S3 and user has a profile picture
        if settings.S3_FILE_STORAGE and updated_user.profile_pic:
            signed_url = await get_s3_signed_url(updated_user.profile_pic)
            # Create a response with both the user data and the signed URL
            user_dict = updated_user.to_dict()
            user_dict["profile_pic"] = signed_url
            return user_dict
        
        return updated_user
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Profile update failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update profile"
        )


@router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: str,
    user_data: UserUpdate,
    current_user: User = Depends(require_permissions("manage_users")),
    db: Session = Depends(get_db)
):
    """Update a user"""
    user_repo = UserRepository(db)
    user = user_repo.get_user(user_id)
    
    if not user or user.organization_id != current_user.organization_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    # Check if updating email and if it's already taken
    if user_data.email and user_data.email != user.email:
        existing_user = user_repo.get_user_by_email(user_data.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
    

    if HAS_ENTERPRISE and hasattr(user_data, 'is_active') and user_data.is_active != user.is_active:
        subscription_repo = SubscriptionRepository(db)
        
        # Get current subscription
        subscription = subscription_repo.get_by_organization(str(user.organization_id))
        if subscription:
            # Check subscription status when activating user
            if user_data.is_active and not (subscription.is_active() or subscription.is_trial()):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Cannot activate user: Subscription is not active"
                )

            # When activating a user, check against subscription limit if max_users feature exists
            if user_data.is_active:
                plan_repo = PlanRepository(db)
                if plan_repo.check_feature_availability(subscription.plan_id, 'max_users'):
                    active_users = user_repo.get_active_users_count(str(user.organization_id))
                    if subscription.quantity is not None and active_users >= subscription.quantity:
                        raise HTTPException(
                            status_code=status.HTTP_403_FORBIDDEN,
                            detail=f"Cannot activate user: Maximum number of users ({subscription.quantity}) reached for your plan. Please upgrade your plan to add more users."
                        )
    
    try:
        updated_user = user_repo.update_user(user_id, **user_data.dict(exclude_unset=True))
        
        # Generate signed URL if using S3 and user has a profile picture
        if settings.S3_FILE_STORAGE and updated_user.profile_pic:
            signed_url = await get_s3_signed_url(updated_user.profile_pic)
            # Create a response with both the user data and the signed URL
            user_dict = updated_user.to_dict()
            user_dict["profile_pic"] = signed_url
            return user_dict
            
        return updated_user
    except Exception as e:
        logger.error(f"Failed to update user: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update user"
        )


@router.post("/{user_id}/status")
async def update_user_status(
    user_id: str,
    status_data: UserStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update user's online status"""
    try:
        user_repo = UserRepository(db)
        user = user_repo.get_user(user_id)
        
        if not user or user.id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Can only update own status"
            )
        
        user_repo.update_user(
            user_id, 
            is_online=status_data.is_online,
            last_seen=func.now()
        )
        
        # Get updated user to return current last_seen
        updated_user = user_repo.get_user(user_id)
        return {
            "message": "Status updated successfully",
            "is_online": updated_user.is_online,
            "last_seen": updated_user.last_seen
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Status update failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update status"
        )


@router.post("/me/profile-pic", response_model=UserResponse)
async def upload_profile_pic(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload user profile picture"""
    try:
        # Validate file extension
        file_ext = get_file_extension(file.filename)
        if file_ext not in ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File type not allowed. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"
            )
        
        # Validate file size
        file_size = len(await file.read())
        await file.seek(0)  # Reset file pointer
        if file_size > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File size too large. Maximum size: {MAX_FILE_SIZE/1024/1024}MB"
            )

        # Delete old profile picture if it exists
        if current_user.profile_pic:
            if settings.S3_FILE_STORAGE:
                await delete_file_from_s3(current_user.profile_pic)
            else:
                old_photo_path = current_user.profile_pic.lstrip('/')
                if os.path.exists(old_photo_path):
                    os.remove(old_photo_path)
        
        # Save file and update user
        file_path = await save_upload_file(
            file,
            str(current_user.organization_id),
            str(current_user.id)
        )
        
        user_repo = UserRepository(db)
        updated_user = user_repo.update_user(
            current_user.id,
            profile_pic=file_path
        )
        
        # Generate signed URL if using S3
        if settings.S3_FILE_STORAGE and updated_user.profile_pic:
            signed_url = await get_s3_signed_url(updated_user.profile_pic)
            # Create a response with both the user data and the signed URL
            user_dict = updated_user.to_dict()
            user_dict["profile_pic"] = signed_url
            return user_dict
        
        return updated_user
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Profile picture upload failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to upload profile picture"
        )


@router.delete("/me/profile-pic", response_model=UserResponse)
async def delete_profile_pic(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete user profile picture"""
    try:
        if current_user.profile_pic:
            if settings.S3_FILE_STORAGE:
                await delete_file_from_s3(current_user.profile_pic)
            else:
                old_photo_path = current_user.profile_pic.lstrip('/')
                if os.path.exists(old_photo_path):
                    os.remove(old_photo_path)

        user_repo = UserRepository(db)
        updated_user = user_repo.update_user(
            current_user.id,
            profile_pic=None
        )
        
        # Return user data with profile_pic_url set to None for consistency
        if settings.S3_FILE_STORAGE:
            user_dict = updated_user.to_dict()
            user_dict["profile_pic"] = None
            return user_dict
            
        return updated_user
        
    except Exception as e:
        logger.error(f"Profile picture deletion failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete profile picture"
        )




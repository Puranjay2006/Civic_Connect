from fastapi import APIRouter, HTTPException, status, Depends
from datetime import datetime
from typing import List
from bson import ObjectId

from app.database import get_users_collection
from app.models import (
    UserResponse, TokenData, NotificationResponse, UserRole
)
from app.auth import require_auth

router = APIRouter()


@router.get("/profile", response_model=UserResponse)
async def get_profile(current_user: TokenData = Depends(require_auth)):
    """Get current user's profile"""
    
    if current_user.user_id.startswith("admin_"):
        admin_name = "Super Admin" if current_user.role == UserRole.SUPER_ADMIN else f"{current_user.department.value} Admin"
        return UserResponse(
            id=current_user.user_id,
            email=current_user.email,
            name=admin_name,
            role=current_user.role,
            department=current_user.department,
            points=0,
            issues_reported=0,
            issues_resolved=0,
            created_at=datetime.utcnow(),
        )
    
    users = get_users_collection()
    user = await users.find_one({"_id": ObjectId(current_user.user_id)})
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return UserResponse(
        id=str(user["_id"]),
        email=user["email"],
        name=user["name"],
        phone=user.get("phone"),
        role=UserRole(user["role"]),
        department=user.get("department"),
        points=user.get("points", 0),
        issues_reported=user.get("issues_reported", 0),
        issues_resolved=user.get("issues_resolved", 0),
        created_at=user["created_at"],
    )


@router.put("/profile")
async def update_profile(
    name: str = None,
    phone: str = None,
    current_user: TokenData = Depends(require_auth)
):
    """Update current user's profile"""
    
    if current_user.user_id.startswith("admin_"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Admin profiles cannot be updated"
        )
    
    users = get_users_collection()
    
    update_data = {"updated_at": datetime.utcnow()}
    if name:
        update_data["name"] = name
    if phone:
        update_data["phone"] = phone
    
    result = await users.update_one(
        {"_id": ObjectId(current_user.user_id)},
        {"$set": update_data}
    )
    
    if result.modified_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return {"message": "Profile updated successfully"}


@router.get("/notifications", response_model=List[NotificationResponse])
async def get_notifications(current_user: TokenData = Depends(require_auth)):
    """Get current user's notifications"""
    
    if current_user.user_id.startswith("admin_"):
        return []  # Admins don't have notifications in this system
    
    users = get_users_collection()
    user = await users.find_one(
        {"_id": ObjectId(current_user.user_id)},
        {"notifications": 1}
    )
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    notifications = user.get("notifications", [])
    
    # Convert to response format
    return [
        NotificationResponse(
            id=str(n.get("_id", ObjectId())),
            title=n["title"],
            message=n["message"],
            type=n.get("type", "info"),
            is_read=n.get("is_read", False),
            issue_id=n.get("issue_id"),
            created_at=n.get("created_at", datetime.utcnow())
        )
        for n in notifications
    ]


@router.put("/notifications/{notification_id}/read")
async def mark_notification_read(
    notification_id: str,
    current_user: TokenData = Depends(require_auth)
):
    """Mark a notification as read"""
    
    if current_user.user_id.startswith("admin_"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Admin users do not have notifications"
        )
    
    users = get_users_collection()
    
    result = await users.update_one(
        {
            "_id": ObjectId(current_user.user_id),
            "notifications._id": ObjectId(notification_id)
        },
        {"$set": {"notifications.$.is_read": True}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )
    
    return {"message": "Notification marked as read"}


@router.put("/notifications/read-all")
async def mark_all_notifications_read(current_user: TokenData = Depends(require_auth)):
    """Mark all notifications as read"""
    
    if current_user.user_id.startswith("admin_"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Admin users do not have notifications"
        )
    
    users = get_users_collection()
    
    await users.update_one(
        {"_id": ObjectId(current_user.user_id)},
        {"$set": {"notifications.$[].is_read": True}}
    )
    
    return {"message": "All notifications marked as read"}


@router.get("/leaderboard", response_model=List[UserResponse])
async def get_leaderboard(limit: int = 10):
    """Get leaderboard of top users by points"""
    
    users = get_users_collection()
    
    cursor = users.find(
        {"role": UserRole.CITIZEN.value, "points": {"$gt": 0}},
        {"password_hash": 0, "notifications": 0}
    ).sort("points", -1).limit(limit)
    
    leaderboard = []
    async for user in cursor:
        leaderboard.append(UserResponse(
            id=str(user["_id"]),
            email=user["email"],
            name=user["name"],
            phone=user.get("phone"),
            role=UserRole(user["role"]),
            points=user.get("points", 0),
            issues_reported=user.get("issues_reported", 0),
            issues_resolved=user.get("issues_resolved", 0),
            created_at=user["created_at"],
        ))
    
    return leaderboard

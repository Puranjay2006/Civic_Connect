from fastapi import APIRouter, HTTPException, status, Depends, UploadFile, File, Form
from datetime import datetime
from typing import List, Optional
from bson import ObjectId
import os
import uuid
import aiofiles

from app.database import get_issues_collection, get_users_collection
from app.models import (
    IssueCreate, IssueResponse, IssueUpdate, TokenData, 
    Status, Department, Category, Priority, UserRole
)
from app.auth import require_auth, require_admin
from app.config import get_settings

router = APIRouter()
settings = get_settings()


async def save_upload_file(file: UploadFile) -> str:
    """Save uploaded file and return the path"""
    # Create uploads directory if it doesn't exist
    os.makedirs(settings.upload_dir, exist_ok=True)
    
    # Generate unique filename
    ext = os.path.splitext(file.filename)[1] if file.filename else ".jpg"
    filename = f"{uuid.uuid4()}{ext}"
    filepath = os.path.join(settings.upload_dir, filename)
    
    # Save file
    async with aiofiles.open(filepath, "wb") as f:
        content = await file.read()
        await f.write(content)
    
    return f"/uploads/{filename}"


@router.post("", response_model=IssueResponse)
async def create_issue(
    title: str = Form(...),
    description: str = Form(...),
    category: Category = Form(...),
    department: Department = Form(...),
    location: str = Form(...),
    latitude: Optional[float] = Form(None),
    longitude: Optional[float] = Form(None),
    priority: Priority = Form(Priority.MEDIUM),
    image: Optional[UploadFile] = File(None),
    current_user: TokenData = Depends(require_auth)
):
    """Create a new issue report"""
    
    if current_user.user_id.startswith("admin_"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Admin users cannot report issues"
        )
    
    issues = get_issues_collection()
    users = get_users_collection()
    
    # Save image if provided
    image_url = None
    if image:
        image_url = await save_upload_file(image)
    
    now = datetime.utcnow()
    
    # Create issue document
    issue_doc = {
        "title": title,
        "description": description,
        "category": category.value,
        "department": department.value,
        "location": location,
        "latitude": latitude,
        "longitude": longitude,
        "priority": priority.value,
        "status": Status.SUBMITTED.value,
        "image_url": image_url,
        "user_id": current_user.user_id,
        "user_email": current_user.email,
        "upvotes": 0,
        "upvoted_by": [],
        "status_history": [
            {
                "status": Status.SUBMITTED.value,
                "changed_at": now,
                "changed_by": current_user.user_id,
                "comment": "Issue submitted"
            }
        ],
        "feedback": None,
        "rating": None,
        "admin_notes": [],
        "created_at": now,
        "updated_at": now,
    }
    
    result = await issues.insert_one(issue_doc)
    issue_id = str(result.inserted_id)
    
    # Update user stats
    await users.update_one(
        {"_id": ObjectId(current_user.user_id)},
        {
            "$inc": {"issues_reported": 1, "points": 10},  # 10 points for reporting
            "$set": {"updated_at": now}
        }
    )
    
    return IssueResponse(
        id=issue_id,
        title=title,
        description=description,
        category=category,
        department=department,
        location=location,
        latitude=latitude,
        longitude=longitude,
        priority=priority,
        status=Status.SUBMITTED,
        image_url=image_url,
        user_id=current_user.user_id,
        user_email=current_user.email,
        upvotes=0,
        created_at=now,
        updated_at=now,
    )


@router.get("", response_model=List[IssueResponse])
async def get_issues(
    department: Optional[Department] = None,
    status_filter: Optional[Status] = None,
    category: Optional[Category] = None,
    limit: int = 50,
    skip: int = 0
):
    """Get all issues with optional filters"""
    
    issues = get_issues_collection()
    
    # Build query
    query = {}
    if department:
        query["department"] = department.value
    if status_filter:
        query["status"] = status_filter.value
    if category:
        query["category"] = category.value
    
    cursor = issues.find(query).sort("created_at", -1).skip(skip).limit(limit)
    
    result = []
    async for issue in cursor:
        result.append(IssueResponse(
            id=str(issue["_id"]),
            title=issue["title"],
            description=issue["description"],
            category=Category(issue["category"]),
            department=Department(issue["department"]),
            location=issue["location"],
            latitude=issue.get("latitude"),
            longitude=issue.get("longitude"),
            priority=Priority(issue["priority"]),
            status=Status(issue["status"]),
            image_url=issue.get("image_url"),
            user_id=issue["user_id"],
            user_email=issue.get("user_email"),
            upvotes=issue.get("upvotes", 0),
            feedback=issue.get("feedback"),
            rating=issue.get("rating"),
            created_at=issue["created_at"],
            updated_at=issue["updated_at"],
        ))
    
    return result


@router.get("/my-issues", response_model=List[IssueResponse])
async def get_my_issues(
    current_user: TokenData = Depends(require_auth),
    limit: int = 50,
    skip: int = 0
):
    """Get current user's reported issues"""
    
    if current_user.user_id.startswith("admin_"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Admin users don't have personal issues"
        )
    
    issues = get_issues_collection()
    
    cursor = issues.find(
        {"user_id": current_user.user_id}
    ).sort("created_at", -1).skip(skip).limit(limit)
    
    result = []
    async for issue in cursor:
        result.append(IssueResponse(
            id=str(issue["_id"]),
            title=issue["title"],
            description=issue["description"],
            category=Category(issue["category"]),
            department=Department(issue["department"]),
            location=issue["location"],
            latitude=issue.get("latitude"),
            longitude=issue.get("longitude"),
            priority=Priority(issue["priority"]),
            status=Status(issue["status"]),
            image_url=issue.get("image_url"),
            user_id=issue["user_id"],
            user_email=issue.get("user_email"),
            upvotes=issue.get("upvotes", 0),
            feedback=issue.get("feedback"),
            rating=issue.get("rating"),
            created_at=issue["created_at"],
            updated_at=issue["updated_at"],
        ))
    
    return result


@router.get("/{issue_id}", response_model=IssueResponse)
async def get_issue(issue_id: str):
    """Get a specific issue by ID"""
    
    issues = get_issues_collection()
    issue = await issues.find_one({"_id": ObjectId(issue_id)})
    
    if not issue:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Issue not found"
        )
    
    return IssueResponse(
        id=str(issue["_id"]),
        title=issue["title"],
        description=issue["description"],
        category=Category(issue["category"]),
        department=Department(issue["department"]),
        location=issue["location"],
        latitude=issue.get("latitude"),
        longitude=issue.get("longitude"),
        priority=Priority(issue["priority"]),
        status=Status(issue["status"]),
        image_url=issue.get("image_url"),
        user_id=issue["user_id"],
        user_email=issue.get("user_email"),
        upvotes=issue.get("upvotes", 0),
        feedback=issue.get("feedback"),
        rating=issue.get("rating"),
        created_at=issue["created_at"],
        updated_at=issue["updated_at"],
    )


@router.put("/{issue_id}/status")
async def update_issue_status(
    issue_id: str,
    new_status: Status,
    comment: Optional[str] = None,
    current_user: TokenData = Depends(require_admin)
):
    """Update issue status (admin only)"""
    
    issues = get_issues_collection()
    users = get_users_collection()
    
    issue = await issues.find_one({"_id": ObjectId(issue_id)})
    if not issue:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Issue not found"
        )
    
    # Check if department admin has permission
    if current_user.role == UserRole.DEPARTMENT_ADMIN:
        if current_user.department.value != issue["department"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only update issues in your department"
            )
    
    now = datetime.utcnow()
    
    # Create status history entry
    history_entry = {
        "status": new_status.value,
        "changed_at": now,
        "changed_by": current_user.user_id,
        "comment": comment or f"Status changed to {new_status.value}"
    }
    
    # Update issue
    await issues.update_one(
        {"_id": ObjectId(issue_id)},
        {
            "$set": {
                "status": new_status.value,
                "updated_at": now
            },
            "$push": {"status_history": history_entry}
        }
    )
    
    # If resolved, update user stats and award points
    if new_status == Status.RESOLVED:
        user_id = issue["user_id"]
        if not user_id.startswith("admin_"):
            await users.update_one(
                {"_id": ObjectId(user_id)},
                {
                    "$inc": {"issues_resolved": 1, "points": 25},  # 25 points for resolved issue
                    "$push": {
                        "notifications": {
                            "_id": ObjectId(),
                            "title": "Issue Resolved!",
                            "message": f"Your issue '{issue['title']}' has been resolved. Thank you for reporting!",
                            "type": "success",
                            "is_read": False,
                            "issue_id": issue_id,
                            "created_at": now
                        }
                    }
                }
            )
    else:
        # Add notification for status change
        user_id = issue["user_id"]
        if not user_id.startswith("admin_"):
            await users.update_one(
                {"_id": ObjectId(user_id)},
                {
                    "$push": {
                        "notifications": {
                            "_id": ObjectId(),
                            "title": "Issue Status Updated",
                            "message": f"Your issue '{issue['title']}' status changed to {new_status.value}",
                            "type": "info",
                            "is_read": False,
                            "issue_id": issue_id,
                            "created_at": now
                        }
                    }
                }
            )
    
    return {"message": f"Issue status updated to {new_status.value}"}


@router.post("/{issue_id}/upvote")
async def upvote_issue(
    issue_id: str,
    current_user: TokenData = Depends(require_auth)
):
    """Upvote an issue"""
    
    if current_user.user_id.startswith("admin_"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Admin users cannot upvote issues"
        )
    
    issues = get_issues_collection()
    
    issue = await issues.find_one({"_id": ObjectId(issue_id)})
    if not issue:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Issue not found"
        )
    
    upvoted_by = issue.get("upvoted_by", [])
    
    if current_user.user_id in upvoted_by:
        # Remove upvote
        await issues.update_one(
            {"_id": ObjectId(issue_id)},
            {
                "$inc": {"upvotes": -1},
                "$pull": {"upvoted_by": current_user.user_id}
            }
        )
        return {"message": "Upvote removed", "upvotes": issue.get("upvotes", 0) - 1}
    else:
        # Add upvote
        await issues.update_one(
            {"_id": ObjectId(issue_id)},
            {
                "$inc": {"upvotes": 1},
                "$push": {"upvoted_by": current_user.user_id}
            }
        )
        return {"message": "Issue upvoted", "upvotes": issue.get("upvotes", 0) + 1}


@router.post("/{issue_id}/feedback")
async def submit_feedback(
    issue_id: str,
    rating: int,
    feedback: Optional[str] = None,
    current_user: TokenData = Depends(require_auth)
):
    """Submit feedback and rating for a resolved issue"""
    
    if rating < 1 or rating > 5:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Rating must be between 1 and 5"
        )
    
    issues = get_issues_collection()
    users = get_users_collection()
    
    issue = await issues.find_one({"_id": ObjectId(issue_id)})
    if not issue:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Issue not found"
        )
    
    if issue["user_id"] != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only submit feedback for your own issues"
        )
    
    if issue["status"] != Status.RESOLVED.value:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Feedback can only be submitted for resolved issues"
        )
    
    if issue.get("rating") is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Feedback already submitted for this issue"
        )
    
    now = datetime.utcnow()
    
    # Update issue with feedback
    await issues.update_one(
        {"_id": ObjectId(issue_id)},
        {
            "$set": {
                "rating": rating,
                "feedback": feedback,
                "updated_at": now
            }
        }
    )
    
    # Award points for feedback
    if not current_user.user_id.startswith("admin_"):
        await users.update_one(
            {"_id": ObjectId(current_user.user_id)},
            {"$inc": {"points": 5}}  # 5 points for feedback
        )
    
    return {"message": "Feedback submitted successfully"}

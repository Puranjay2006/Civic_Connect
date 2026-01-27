from fastapi import APIRouter
from datetime import datetime
from typing import List

from app.database import get_issues_collection, get_users_collection
from app.models import (
    DashboardStats, DepartmentStats, Status, Department, UserRole
)

router = APIRouter()


@router.get("/dashboard", response_model=DashboardStats)
async def get_dashboard_stats():
    """Get public dashboard statistics"""
    
    issues = get_issues_collection()
    users = get_users_collection()
    
    # Get total counts
    total_issues = await issues.count_documents({})
    total_users = await users.count_documents({"role": UserRole.CITIZEN.value})
    
    # Get status counts
    pending_count = await issues.count_documents({
        "status": {"$in": [Status.SUBMITTED.value, Status.UNDER_REVIEW.value]}
    })
    in_progress_count = await issues.count_documents({
        "status": Status.IN_PROGRESS.value
    })
    resolved_count = await issues.count_documents({
        "status": Status.RESOLVED.value
    })
    rejected_count = await issues.count_documents({
        "status": Status.REJECTED.value
    })
    
    # Calculate resolution rate
    resolution_rate = 0
    if total_issues > 0:
        resolution_rate = round((resolved_count / total_issues) * 100, 1)
    
    # Calculate average rating
    pipeline = [
        {"$match": {"rating": {"$ne": None}}},
        {"$group": {"_id": None, "avg_rating": {"$avg": "$rating"}}}
    ]
    rating_result = await issues.aggregate(pipeline).to_list(1)
    avg_rating = round(rating_result[0]["avg_rating"], 1) if rating_result else 0
    
    # Get department stats
    dept_stats = []
    for dept in Department:
        dept_total = await issues.count_documents({"department": dept.value})
        dept_resolved = await issues.count_documents({
            "department": dept.value,
            "status": Status.RESOLVED.value
        })
        dept_pending = await issues.count_documents({
            "department": dept.value,
            "status": {"$in": [Status.SUBMITTED.value, Status.UNDER_REVIEW.value, Status.IN_PROGRESS.value]}
        })
        
        dept_rate = 0
        if dept_total > 0:
            dept_rate = round((dept_resolved / dept_total) * 100, 1)
        
        # Calculate avg resolution time for department
        avg_time_pipeline = [
            {
                "$match": {
                    "department": dept.value,
                    "status": Status.RESOLVED.value
                }
            },
            {
                "$project": {
                    "resolution_time": {
                        "$divide": [
                            {"$subtract": ["$updated_at", "$created_at"]},
                            1000 * 60 * 60  # Convert to hours
                        ]
                    }
                }
            },
            {
                "$group": {
                    "_id": None,
                    "avg_time": {"$avg": "$resolution_time"}
                }
            }
        ]
        time_result = await issues.aggregate(avg_time_pipeline).to_list(1)
        avg_resolution_time = round(time_result[0]["avg_time"], 1) if time_result else 0
        
        dept_stats.append(DepartmentStats(
            department=dept,
            total_issues=dept_total,
            resolved_issues=dept_resolved,
            pending_issues=dept_pending,
            resolution_rate=dept_rate,
            avg_resolution_time=avg_resolution_time
        ))
    
    return DashboardStats(
        total_issues=total_issues,
        total_users=total_users,
        pending_issues=pending_count,
        in_progress_issues=in_progress_count,
        resolved_issues=resolved_count,
        rejected_issues=rejected_count,
        resolution_rate=resolution_rate,
        avg_rating=avg_rating,
        department_stats=dept_stats
    )


@router.get("/issues")
async def get_public_issues(
    department: Department = None,
    limit: int = 20,
    skip: int = 0
):
    """Get recent public issues (limited info)"""
    
    issues = get_issues_collection()
    
    query = {}
    if department:
        query["department"] = department.value
    
    cursor = issues.find(
        query,
        {
            "title": 1,
            "category": 1,
            "department": 1,
            "location": 1,
            "status": 1,
            "upvotes": 1,
            "created_at": 1,
            "latitude": 1,
            "longitude": 1,
        }
    ).sort("created_at", -1).skip(skip).limit(limit)
    
    result = []
    async for issue in cursor:
        result.append({
            "id": str(issue["_id"]),
            "title": issue["title"],
            "category": issue["category"],
            "department": issue["department"],
            "location": issue["location"],
            "status": issue["status"],
            "upvotes": issue.get("upvotes", 0),
            "created_at": issue["created_at"],
            "latitude": issue.get("latitude"),
            "longitude": issue.get("longitude"),
        })
    
    return result


@router.get("/map-data")
async def get_map_data():
    """Get issues with location data for map visualization"""
    
    issues = get_issues_collection()
    
    cursor = issues.find(
        {
            "latitude": {"$ne": None},
            "longitude": {"$ne": None}
        },
        {
            "title": 1,
            "category": 1,
            "department": 1,
            "location": 1,
            "status": 1,
            "latitude": 1,
            "longitude": 1,
            "created_at": 1,
        }
    )
    
    result = []
    async for issue in cursor:
        result.append({
            "id": str(issue["_id"]),
            "title": issue["title"],
            "category": issue["category"],
            "department": issue["department"],
            "location": issue["location"],
            "status": issue["status"],
            "latitude": issue["latitude"],
            "longitude": issue["longitude"],
            "created_at": issue["created_at"],
        })
    
    return result


@router.get("/trends")
async def get_issue_trends():
    """Get issue trends over time"""
    
    issues = get_issues_collection()
    
    # Get issues grouped by date (last 30 days)
    from datetime import timedelta
    
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    
    pipeline = [
        {
            "$match": {
                "created_at": {"$gte": thirty_days_ago}
            }
        },
        {
            "$group": {
                "_id": {
                    "$dateToString": {
                        "format": "%Y-%m-%d",
                        "date": "$created_at"
                    }
                },
                "count": {"$sum": 1},
                "resolved": {
                    "$sum": {
                        "$cond": [
                            {"$eq": ["$status", Status.RESOLVED.value]},
                            1,
                            0
                        ]
                    }
                }
            }
        },
        {"$sort": {"_id": 1}}
    ]
    
    result = await issues.aggregate(pipeline).to_list(100)
    
    return {
        "labels": [r["_id"] for r in result],
        "reported": [r["count"] for r in result],
        "resolved": [r["resolved"] for r in result]
    }


@router.get("/category-distribution")
async def get_category_distribution():
    """Get issue distribution by category"""
    
    issues = get_issues_collection()
    
    pipeline = [
        {
            "$group": {
                "_id": "$category",
                "count": {"$sum": 1}
            }
        }
    ]
    
    result = await issues.aggregate(pipeline).to_list(100)
    
    return {
        "labels": [r["_id"] for r in result],
        "data": [r["count"] for r in result]
    }

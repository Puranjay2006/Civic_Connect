from fastapi import APIRouter, HTTPException, status, Depends
from datetime import datetime
from bson import ObjectId

from app.database import get_users_collection
from app.models import (
    UserCreate, UserLogin, AdminLogin, UserResponse, TokenResponse,
    UserRole, TokenData
)
from app.auth import (
    hash_password, verify_password, create_access_token, 
    create_refresh_token, decode_token, verify_admin_passkey, require_auth
)

router = APIRouter()


@router.post("/register", response_model=TokenResponse)
async def register(user_data: UserCreate):
    """Register a new user"""
    users = get_users_collection()
    
    # Check if email already exists
    existing = await users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create user document
    now = datetime.utcnow()
    user_doc = {
        "email": user_data.email,
        "name": user_data.name,
        "phone": user_data.phone,
        "password_hash": hash_password(user_data.password),
        "role": UserRole.CITIZEN.value,
        "department": None,
        "is_email_verified": False,
        "points": 0,
        "issues_reported": 0,
        "issues_resolved": 0,
        "notifications": [],
        "created_at": now,
        "updated_at": now,
        "last_login": now,
    }
    
    result = await users.insert_one(user_doc)
    user_id = str(result.inserted_id)
    
    # Create tokens
    token_data = {
        "user_id": user_id,
        "email": user_data.email,
        "role": UserRole.CITIZEN.value,
    }
    
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserResponse(
            id=user_id,
            email=user_data.email,
            name=user_data.name,
            phone=user_data.phone,
            role=UserRole.CITIZEN,
            points=0,
            issues_reported=0,
            issues_resolved=0,
            created_at=now,
        )
    )


@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    """Login with email and password"""
    users = get_users_collection()
    
    # Find user
    user = await users.find_one({"email": credentials.email})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Verify password
    if not verify_password(credentials.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Update last login
    await users.update_one(
        {"_id": user["_id"]},
        {"$set": {"last_login": datetime.utcnow()}}
    )
    
    user_id = str(user["_id"])
    
    # Create tokens
    token_data = {
        "user_id": user_id,
        "email": user["email"],
        "role": user["role"],
        "department": user.get("department"),
    }
    
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserResponse(
            id=user_id,
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
    )


@router.post("/admin-login", response_model=TokenResponse)
async def admin_login(credentials: AdminLogin):
    """Login as admin with passkey"""
    
    # Verify passkey
    role, department = verify_admin_passkey(credentials.passkey, credentials.department)
    
    # Create a pseudo-user for admin session
    now = datetime.utcnow()
    admin_name = "Super Admin" if role == UserRole.SUPER_ADMIN else f"{department.value} Admin"
    admin_email = f"{admin_name.lower().replace(' ', '_')}@civic-connect.local"
    
    # Create tokens
    token_data = {
        "user_id": f"admin_{role.value}_{department.value if department else 'super'}",
        "email": admin_email,
        "role": role.value,
        "department": department.value if department else None,
    }
    
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserResponse(
            id=token_data["user_id"],
            email=admin_email,
            name=admin_name,
            role=role,
            department=department,
            points=0,
            issues_reported=0,
            issues_resolved=0,
            created_at=now,
        )
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(refresh_token: str):
    """Refresh access token using refresh token"""
    
    payload = decode_token(refresh_token)
    
    if payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token type"
        )
    
    # Create new access token
    token_data = {
        "user_id": payload["user_id"],
        "email": payload["email"],
        "role": payload["role"],
        "department": payload.get("department"),
    }
    
    new_access_token = create_access_token(token_data)
    
    # Get user info
    users = get_users_collection()
    user = None
    
    if not payload["user_id"].startswith("admin_"):
        user = await users.find_one({"_id": ObjectId(payload["user_id"])})
    
    user_response = UserResponse(
        id=payload["user_id"],
        email=payload["email"],
        name=user["name"] if user else payload["email"].split("@")[0].replace("_", " ").title(),
        phone=user.get("phone") if user else None,
        role=UserRole(payload["role"]),
        department=payload.get("department"),
        points=user.get("points", 0) if user else 0,
        issues_reported=user.get("issues_reported", 0) if user else 0,
        issues_resolved=user.get("issues_resolved", 0) if user else 0,
        created_at=user["created_at"] if user else datetime.utcnow(),
    )
    
    return TokenResponse(
        access_token=new_access_token,
        refresh_token=refresh_token,  # Return same refresh token
        user=user_response
    )


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: TokenData = Depends(require_auth)):
    """Get current user information"""
    
    if current_user.user_id.startswith("admin_"):
        # Admin user
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
    
    # Regular user
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

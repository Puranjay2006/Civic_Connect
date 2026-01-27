from datetime import datetime, timedelta
from typing import Optional
from jose import jwt, JWTError
from passlib.context import CryptContext
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.config import get_settings
from app.models import TokenData, UserRole, Department

settings = get_settings()

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Bearer token scheme
bearer_scheme = HTTPBearer(auto_error=False)


def hash_password(password: str) -> str:
    """Hash a password using bcrypt"""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token"""
    to_encode = data.copy()
    expire = datetime.utcnow() + (
        expires_delta or timedelta(minutes=settings.access_token_expire_minutes)
    )
    to_encode.update({"exp": expire, "type": "access"})
    return jwt.encode(to_encode, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)


def create_refresh_token(data: dict) -> str:
    """Create a JWT refresh token"""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=settings.refresh_token_expire_days)
    to_encode.update({"exp": expire, "type": "refresh"})
    return jwt.encode(to_encode, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)


def decode_token(token: str) -> dict:
    """Decode and validate a JWT token"""
    try:
        payload = jwt.decode(
            token, 
            settings.jwt_secret_key, 
            algorithms=[settings.jwt_algorithm]
        )
        return payload
    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme)
) -> Optional[TokenData]:
    """Extract current user from JWT token (optional auth)"""
    if credentials is None:
        return None
    
    try:
        payload = decode_token(credentials.credentials)
        
        if payload.get("type") != "access":
            return None
        
        return TokenData(
            user_id=payload.get("user_id"),
            email=payload.get("email"),
            role=UserRole(payload.get("role", "citizen")),
            department=Department(payload.get("department")) if payload.get("department") else None
        )
    except Exception:
        return None


async def require_auth(
    credentials: HTTPAuthorizationCredentials = Depends(HTTPBearer())
) -> TokenData:
    """Require authentication - raises 401 if not authenticated"""
    payload = decode_token(credentials.credentials)
    
    if payload.get("type") != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token type",
        )
    
    return TokenData(
        user_id=payload.get("user_id"),
        email=payload.get("email"),
        role=UserRole(payload.get("role", "citizen")),
        department=Department(payload.get("department")) if payload.get("department") else None
    )


async def require_admin(
    current_user: TokenData = Depends(require_auth)
) -> TokenData:
    """Require admin role"""
    if current_user.role not in [UserRole.SUPER_ADMIN, UserRole.DEPARTMENT_ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    return current_user


async def require_super_admin(
    current_user: TokenData = Depends(require_auth)
) -> TokenData:
    """Require super admin role"""
    if current_user.role != UserRole.SUPER_ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Super admin access required",
        )
    return current_user


def verify_admin_passkey(passkey: str, department: Optional[Department] = None) -> tuple[UserRole, Optional[Department]]:
    """Verify admin passkey and return role and department"""
    
    # Check super admin passkey
    if passkey == settings.super_admin_passkey:
        return UserRole.SUPER_ADMIN, None
    
    # Check department passkeys
    department_passkeys = settings.get_department_passkeys()
    
    for dept_name, dept_passkey in department_passkeys.items():
        if passkey == dept_passkey:
            # If department is specified, it must match
            if department and department.value != dept_name:
                continue
            return UserRole.DEPARTMENT_ADMIN, Department(dept_name)
    
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid passkey",
    )

from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List, Literal
from datetime import datetime
from enum import Enum


class Department(str, Enum):
    PUBLIC_WORKS = "Public Works"
    HEALTH = "Health"
    EDUCATION = "Education"
    ENVIRONMENT = "Environment"
    TRANSPORT = "Transport"
    WATER_SUPPLY = "Water Supply"
    ELECTRICITY = "Electricity"
    HOUSING = "Housing"


class Status(str, Enum):
    SUBMITTED = "Submitted"
    UNDER_REVIEW = "Under Review"
    IN_PROGRESS = "In Progress"
    RESOLVED = "Resolved"
    REJECTED = "Rejected"


class Category(str, Enum):
    ROAD_DAMAGE = "Road Damage"
    WATER_ISSUE = "Water Issue"
    ELECTRICITY = "Electricity"
    SANITATION = "Sanitation"
    PUBLIC_SAFETY = "Public Safety"
    ENVIRONMENT = "Environment"
    TRANSPORT = "Transport"
    OTHER = "Other"


class Priority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"


class UserRole(str, Enum):
    CITIZEN = "citizen"
    DEPARTMENT_ADMIN = "department_admin"
    SUPER_ADMIN = "super_admin"


# ============= User Models =============

class UserBase(BaseModel):
    email: EmailStr
    name: str
    phone: Optional[str] = None


class UserCreate(UserBase):
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class AdminLogin(BaseModel):
    passkey: str
    department: Optional[Department] = None


class UserInDB(UserBase):
    id: str = Field(alias="_id")
    password_hash: str
    role: UserRole = UserRole.CITIZEN
    department: Optional[Department] = None
    is_email_verified: bool = False
    points: int = 0
    issues_reported: int = 0
    issues_resolved: int = 0
    created_at: datetime
    updated_at: datetime
    last_login: Optional[datetime] = None
    
    class Config:
        populate_by_name = True


class UserResponse(UserBase):
    id: str
    role: UserRole
    department: Optional[Department] = None
    points: int = 0
    issues_reported: int = 0
    issues_resolved: int = 0
    created_at: datetime
    
    class Config:
        from_attributes = True


class TokenData(BaseModel):
    user_id: str
    email: str
    role: UserRole
    department: Optional[Department] = None


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserResponse


# ============= Issue Models =============

class IssueBase(BaseModel):
    title: str = Field(..., min_length=5, max_length=200)
    description: str = Field(..., min_length=10, max_length=2000)
    category: Category
    department: Department
    location: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    priority: Priority = Priority.MEDIUM


class IssueCreate(IssueBase):
    image_url: Optional[str] = None


class IssueUpdate(BaseModel):
    status: Optional[Status] = None
    priority: Optional[Priority] = None
    note: Optional[str] = None


class IssueResponse(BaseModel):
    id: str
    title: str
    description: str
    category: Category
    department: Department
    location: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    priority: Priority
    status: Status
    image_url: Optional[str] = None
    user_id: str
    user_email: Optional[str] = None
    upvotes: int = 0
    feedback: Optional[str] = None
    rating: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class IssueListResponse(BaseModel):
    issues: List[IssueResponse]
    total: int
    page: int
    page_size: int


# ============= Notification Models =============

class NotificationType(str, Enum):
    INFO = "info"
    SUCCESS = "success"
    WARNING = "warning"
    ERROR = "error"


class NotificationBase(BaseModel):
    message: str
    type: NotificationType = NotificationType.INFO
    issue_id: Optional[str] = None


class NotificationInDB(NotificationBase):
    id: str = Field(alias="_id")
    user_id: str
    is_read: bool = False
    created_at: datetime
    
    class Config:
        populate_by_name = True


class NotificationResponse(BaseModel):
    id: str
    title: str
    message: str
    type: str = "info"
    is_read: bool
    issue_id: Optional[str] = None
    created_at: datetime


# ============= Stats Models =============

class DepartmentStats(BaseModel):
    department: Department
    total_issues: int
    resolved_issues: int
    pending_issues: int
    resolution_rate: float
    avg_resolution_time: float = 0


class DashboardStats(BaseModel):
    total_issues: int
    total_users: int
    pending_issues: int
    in_progress_issues: int
    resolved_issues: int
    rejected_issues: int
    resolution_rate: float
    avg_rating: float
    department_stats: List[DepartmentStats]


# ============= AI Models =============

class AIRequest(BaseModel):
    message: str
    context: Optional[List[dict]] = None
    issue_context: Optional[str] = None


class AIResponse(BaseModel):
    response: str
    suggestions: List[str] = []

# 🚀 Civic Connect - Full-Stack Upgrade Guide

## Overview

This guide documents how to upgrade Civic Connect from a frontend-only demo to a production-ready full-stack application with authentication, database persistence, and cloud deployment.

---

## 📋 Current Architecture (Demo Mode)

```
┌─────────────────────────────────────┐
│         Frontend (React/Vite)        │
│  - All data stored in localStorage   │
│  - Simulated authentication          │
│  - No real backend/database          │
└─────────────────────────────────────┘
```

---

## 🎯 Target Architecture (Production)

```
┌─────────────────────────────────────┐
│         Frontend (React/Vite)        │
│    Hosted on Vercel / Netlify        │
└──────────────────┬──────────────────┘
                   │ REST API / GraphQL
                   ▼
┌─────────────────────────────────────┐
│       Backend (FastAPI/Python)       │
│     Hosted on Railway / Render       │
│                                     │
│  ┌─────────────────────────────────┐ │
│  │   Authentication (JWT + OAuth)   │ │
│  │   - Email/Password login         │ │
│  │   - Google OAuth integration     │ │
│  │   - Admin passkey verification   │ │
│  └─────────────────────────────────┘ │
│                                     │
│  ┌─────────────────────────────────┐ │
│  │   File Storage (AWS S3 / Cloudflare R2) │
│  │   - Issue photos                 │ │
│  │   - User avatars                 │ │
│  └─────────────────────────────────┘ │
└──────────────────┬──────────────────┘
                   │
                   ▼
┌─────────────────────────────────────┐
│       Database (MongoDB Atlas)       │
│    Free tier: 512MB storage          │
│                                     │
│  Collections:                        │
│  - users                             │
│  - issues                            │
│  - departments                       │
│  - notifications                     │
│  - feedback                          │
└─────────────────────────────────────┘
```

---

## 🗄️ Database Schema Design

### MongoDB Collections

#### 1. Users Collection

```javascript
{
  "_id": ObjectId,
  "email": "user@example.com",
  "name": "John Doe",
  "phone": "+91-9876543210",
  "passwordHash": "$2b$12$...",  // bcrypt hashed
  "role": "citizen" | "department_admin" | "super_admin",
  "department": "Water" | null,  // For department admins
  "isEmailVerified": true,
  "profilePhoto": "https://storage.example.com/avatars/...",
  "points": 150,  // Gamification points
  "issuesReported": 12,
  "issuesResolved": 8,
  "badges": ["First Report", "Problem Solver"],
  "notifications": [
    {
      "id": "uuid",
      "message": "Your issue has been resolved!",
      "type": "success",
      "issueId": "issue_uuid",
      "isRead": false,
      "createdAt": ISODate
    }
  ],
  "createdAt": ISODate,
  "updatedAt": ISODate,
  "lastLogin": ISODate
}
```

#### 2. Issues Collection

```javascript
{
  "_id": ObjectId,
  "issueId": "CIV-2024-001234",  // Human-readable ID
  "title": "Pothole on Main Road",
  "description": "Large pothole causing traffic issues...",
  "category": "Pothole" | "Garbage" | "Streetlight" | "WaterLeak" | "Sewage" | "Other",
  "department": "Roads" | "Water" | "Electrical" | "Sanitation" | "Medical",
  "status": "Pending" | "InProgress" | "Resolved",
  "priority": "low" | "medium" | "high" | "urgent",
  "location": {
    "address": "123 Main Street, City",
    "coordinates": {
      "lat": 28.6139,
      "lng": 77.2090
    }
  },
  "photos": ["https://storage.example.com/issues/..."],
  "userId": ObjectId,  // Reference to user
  "assignedTo": ObjectId | null,  // Department admin
  "timeline": [
    {
      "status": "Pending",
      "timestamp": ISODate,
      "updatedBy": ObjectId,
      "note": "Issue reported"
    },
    {
      "status": "InProgress",
      "timestamp": ISODate,
      "updatedBy": ObjectId,
      "note": "Team dispatched"
    }
  ],
  "rating": 5,  // User rating after resolution (1-5)
  "feedback": "Great work!",
  "aiSummary": "This issue involves a road safety concern...",
  "estimatedResolutionTime": "48 hours",
  "actualResolutionTime": "36 hours",
  "createdAt": ISODate,
  "updatedAt": ISODate,
  "resolvedAt": ISODate | null
}
```

#### 3. Departments Collection

```javascript
{
  "_id": ObjectId,
  "name": "Roads",
  "description": "Handles road maintenance and repairs",
  "passkey": "$2b$12$...",  // Hashed admin passkey
  "admins": [ObjectId],  // Array of admin user IDs
  "stats": {
    "totalIssues": 450,
    "resolved": 380,
    "inProgress": 50,
    "pending": 20,
    "avgResolutionTime": "42 hours"
  },
  "contactEmail": "roads@civic.gov",
  "contactPhone": "+91-1800-XXX-XXXX",
  "workingHours": "9 AM - 6 PM",
  "createdAt": ISODate
}
```

---

## 🔧 Backend Implementation

### Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI app entry
│   ├── config.py            # Environment config
│   ├── database.py          # MongoDB connection
│   │
│   ├── models/
│   │   ├── user.py
│   │   ├── issue.py
│   │   └── department.py
│   │
│   ├── schemas/
│   │   ├── user.py          # Pydantic schemas
│   │   ├── issue.py
│   │   └── auth.py
│   │
│   ├── routers/
│   │   ├── auth.py          # Login/signup/reset
│   │   ├── users.py         # User profile
│   │   ├── issues.py        # CRUD operations
│   │   ├── departments.py   # Department management
│   │   └── admin.py         # Admin operations
│   │
│   ├── services/
│   │   ├── auth_service.py
│   │   ├── issue_service.py
│   │   ├── notification_service.py
│   │   ├── email_service.py
│   │   └── ai_service.py    # Gemini integration
│   │
│   └── utils/
│       ├── security.py      # JWT, password hashing
│       ├── validators.py
│       └── helpers.py
│
├── requirements.txt
├── Dockerfile
└── docker-compose.yml
```

### Key Dependencies (requirements.txt)

```txt
fastapi==0.109.0
uvicorn[standard]==0.27.0
motor==3.3.2                    # Async MongoDB driver
python-jose[cryptography]==3.3.0  # JWT tokens
passlib[bcrypt]==1.7.4          # Password hashing
python-multipart==0.0.6         # File uploads
boto3==1.34.0                   # AWS S3
google-generativeai==0.3.2      # Gemini AI
pydantic[email]==2.5.3
python-dotenv==1.0.0
aiofiles==23.2.1
httpx==0.26.0
```

### Example API Endpoints

```python
# Auth endpoints
POST   /api/auth/register       # Create account
POST   /api/auth/login          # Login with email/password
POST   /api/auth/admin-login    # Admin passkey login
POST   /api/auth/refresh        # Refresh JWT token
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
POST   /api/auth/verify-email

# User endpoints
GET    /api/users/me            # Get current user profile
PUT    /api/users/me            # Update profile
GET    /api/users/notifications
PUT    /api/users/notifications/{id}/read

# Issue endpoints
POST   /api/issues              # Create new issue
GET    /api/issues              # List issues (with filters)
GET    /api/issues/{id}         # Get issue details
PUT    /api/issues/{id}         # Update issue (admin)
GET    /api/issues/my           # Get user's issues
POST   /api/issues/{id}/rate    # Rate resolved issue
POST   /api/issues/{id}/feedback

# Department endpoints
GET    /api/departments         # List all departments
GET    /api/departments/{name}/stats
GET    /api/departments/{name}/issues

# Admin endpoints
GET    /api/admin/dashboard     # Dashboard stats
GET    /api/admin/analytics     # Detailed analytics
PUT    /api/admin/issues/{id}/assign
PUT    /api/admin/issues/{id}/status

# Public endpoints
GET    /api/public/stats        # Public dashboard stats
GET    /api/public/leaderboard
GET    /api/public/track/{issueId}
```

### Sample FastAPI Code

```python
# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, users, issues, departments, admin
from app.database import connect_db, close_db

app = FastAPI(
    title="Civic Connect API",
    description="Backend API for Civic Connect - Citizen Issue Reporting Platform",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://civic-connect.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(issues.router, prefix="/api/issues", tags=["Issues"])
app.include_router(departments.router, prefix="/api/departments", tags=["Departments"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])

@app.on_event("startup")
async def startup():
    await connect_db()

@app.on_event("shutdown")
async def shutdown():
    await close_db()

@app.get("/health")
async def health_check():
    return {"status": "healthy", "version": "1.0.0"}
```

---

## 🔐 Authentication Flow

### JWT Token-Based Auth

```
1. User Login
   ┌────────┐     POST /auth/login      ┌────────┐
   │ Client │ ──────────────────────────► │ Server │
   └────────┘     {email, password}      └────────┘
        │                                      │
        │         {access_token,               │
        │          refresh_token,              │
        ◄──────────user_data}──────────────────┘
        │
        │
2. Authenticated Requests
   ┌────────┐     GET /api/issues         ┌────────┐
   │ Client │ ──────────────────────────► │ Server │
   └────────┘  Authorization: Bearer JWT   └────────┘
        │                                      │
        │         {issues: [...]}              │
        ◄──────────────────────────────────────┘

3. Token Refresh
   ┌────────┐     POST /auth/refresh      ┌────────┐
   │ Client │ ──────────────────────────► │ Server │
   └────────┘     {refresh_token}          └────────┘
        │                                      │
        │         {new_access_token}           │
        ◄──────────────────────────────────────┘
```

---

## 📁 File Storage Setup

### Option 1: AWS S3

```python
# services/storage_service.py
import boto3
from botocore.exceptions import ClientError

s3_client = boto3.client(
    's3',
    aws_access_key_id=settings.AWS_ACCESS_KEY,
    aws_secret_access_key=settings.AWS_SECRET_KEY,
    region_name=settings.AWS_REGION
)

async def upload_file(file, folder: str) -> str:
    file_key = f"{folder}/{uuid.uuid4()}-{file.filename}"
    
    s3_client.upload_fileobj(
        file.file,
        settings.S3_BUCKET,
        file_key,
        ExtraArgs={'ContentType': file.content_type}
    )
    
    return f"https://{settings.S3_BUCKET}.s3.{settings.AWS_REGION}.amazonaws.com/{file_key}"
```

### Option 2: Cloudflare R2 (S3-compatible, cheaper)

```python
s3_client = boto3.client(
    's3',
    endpoint_url=f"https://{settings.CF_ACCOUNT_ID}.r2.cloudflarestorage.com",
    aws_access_key_id=settings.R2_ACCESS_KEY,
    aws_secret_access_key=settings.R2_SECRET_KEY,
)
```

---

## 🚀 Deployment Options

### Frontend Deployment (Vercel)

1. Push frontend to GitHub
2. Connect to Vercel
3. Set environment variables:
   ```
   VITE_API_URL=https://api.civic-connect.example.com
   VITE_GEMINI_API_KEY=your_key
   ```
4. Deploy!

### Backend Deployment (Railway)

1. Push backend to GitHub
2. Connect to Railway
3. Set environment variables:
   ```
   MONGODB_URI=mongodb+srv://...
   JWT_SECRET=your_secret
   AWS_ACCESS_KEY=...
   AWS_SECRET_KEY=...
   S3_BUCKET=civic-connect-uploads
   GEMINI_API_KEY=...
   ```
4. Railway auto-deploys on push

### Database Setup (MongoDB Atlas)

1. Create free M0 cluster at mongodb.com
2. Create database user
3. Whitelist IP addresses (or 0.0.0.0/0 for development)
4. Get connection string
5. Create indexes:

```javascript
// Create indexes for performance
db.issues.createIndex({ "userId": 1 })
db.issues.createIndex({ "department": 1, "status": 1 })
db.issues.createIndex({ "createdAt": -1 })
db.issues.createIndex({ "location.coordinates": "2dsphere" })
db.users.createIndex({ "email": 1 }, { unique: true })
```

---

## 🔧 Environment Variables

### Frontend (.env)
```env
VITE_API_URL=http://localhost:8000
VITE_GEMINI_API_KEY=your_gemini_key
VITE_GOOGLE_CLIENT_ID=your_oauth_client_id
```

### Backend (.env)
```env
# Server
HOST=0.0.0.0
PORT=8000
DEBUG=false

# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/civic-connect

# Authentication
JWT_SECRET=your-super-secret-key-change-in-production
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# Admin Passkeys (hashed values stored in DB)
SUPER_ADMIN_PASSKEY=ykls_764
DEPARTMENT_PASSKEY_PREFIX=ljn_987

# Storage
AWS_ACCESS_KEY=...
AWS_SECRET_KEY=...
AWS_REGION=ap-south-1
S3_BUCKET=civic-connect-uploads

# External Services
GEMINI_API_KEY=your_gemini_key
SENDGRID_API_KEY=your_sendgrid_key  # For emails

# Google OAuth
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

---

## 📧 Email Service Integration

### Using SendGrid

```python
# services/email_service.py
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

async def send_password_reset_email(email: str, reset_token: str):
    reset_url = f"{settings.FRONTEND_URL}/reset-password?token={reset_token}"
    
    message = Mail(
        from_email='noreply@civic-connect.com',
        to_emails=email,
        subject='Reset Your Civic Connect Password',
        html_content=f'''
            <h2>Password Reset Request</h2>
            <p>Click the link below to reset your password:</p>
            <a href="{reset_url}">{reset_url}</a>
            <p>This link expires in 1 hour.</p>
        '''
    )
    
    sg = SendGridAPIClient(settings.SENDGRID_API_KEY)
    sg.send(message)
```

---

## 🤖 AI Integration (Gemini)

### Backend AI Service

```python
# services/ai_service.py
import google.generativeai as genai

genai.configure(api_key=settings.GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-pro')

async def generate_ai_response(issue_title: str, issue_description: str) -> str:
    prompt = f"""
    As Casey, the Civic Connect AI assistant, provide a helpful response 
    about this reported civic issue:
    
    Issue: {issue_title}
    Description: {issue_description}
    
    Include:
    1. Acknowledgment of the issue
    2. Estimated resolution timeline
    3. Helpful tips for the citizen
    
    Keep response concise and friendly.
    """
    
    response = await model.generate_content_async(prompt)
    return response.text

async def categorize_issue(description: str) -> dict:
    prompt = f"""
    Analyze this civic issue and return JSON:
    Description: {description}
    
    Return: {{"category": "...", "department": "...", "priority": "...", "summary": "..."}}
    Categories: Pothole, Garbage, Streetlight, WaterLeak, Sewage, Other
    Departments: Roads, Water, Electrical, Sanitation, Medical
    Priority: low, medium, high, urgent
    """
    
    response = await model.generate_content_async(prompt)
    return json.loads(response.text)
```

---

## 📊 Analytics & Monitoring

### Recommended Tools

1. **Application Monitoring**: Sentry (error tracking)
2. **API Monitoring**: Better Stack / Uptime Robot
3. **Logging**: Logfire / Logtail
4. **Analytics**: PostHog (open source) / Mixpanel

### Health Check Endpoint

```python
@app.get("/health")
async def health_check():
    try:
        # Check database connection
        await db.command("ping")
        db_status = "healthy"
    except:
        db_status = "unhealthy"
    
    return {
        "status": "healthy" if db_status == "healthy" else "degraded",
        "version": settings.VERSION,
        "database": db_status,
        "timestamp": datetime.utcnow().isoformat()
    }
```

---

## 🔒 Security Checklist

- [ ] Use HTTPS everywhere
- [ ] Implement rate limiting (slowapi)
- [ ] Validate all inputs (Pydantic)
- [ ] Hash passwords with bcrypt
- [ ] Use short-lived JWT tokens
- [ ] Implement CORS properly
- [ ] Sanitize file uploads
- [ ] Use environment variables for secrets
- [ ] Enable MongoDB authentication
- [ ] Implement request logging
- [ ] Add input sanitization for XSS prevention

---

## 📱 Future Enhancements

1. **Mobile App** - React Native version
2. **Real-time Updates** - WebSocket for live status changes
3. **Push Notifications** - Firebase Cloud Messaging
4. **Map Integration** - Google Maps for issue visualization
5. **Voice Reporting** - Speech-to-text for accessibility
6. **Multi-language** - i18n for Indian languages
7. **Offline Mode** - PWA with service workers

---

## 🎓 Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [MongoDB Atlas](https://www.mongodb.com/atlas)
- [Vercel Deployment](https://vercel.com/docs)
- [Railway Deployment](https://docs.railway.app/)
- [Gemini AI API](https://ai.google.dev/)
- [JWT Best Practices](https://auth0.com/blog/a-look-at-the-latest-draft-for-jwt-bcp/)

---

## 📝 Quick Start Commands

```bash
# Frontend
cd frontend
npm install
npm run dev            # Development
npm run build          # Production build

# Backend (after setup)
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# Docker (production)
docker-compose up --build
```

---

**Good luck with the Youth Solves for India Contest! 🇮🇳**

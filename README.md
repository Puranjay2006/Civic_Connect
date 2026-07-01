# Civic Connect

An AI-powered civic issue reporting platform. Residents submit local problems - potholes, broken streetlights, waterlogging - and the system automatically categorises them, routes them to the right government department, and lets citizens track resolution in real time.

Won the Youth Solves for India Contest at the IIT Mandi x Masai School x NoBroker.com Hackathon. Built end-to-end in 48 hours.

**Live app:** [civic-connect-8y5i.onrender.com](https://civic-connect-8y5i.onrender.com)

## What it does

- **Issue reporting** - submit civic problems with title, description, category, location (with coordinates), priority, and an optional photo
- **AI categorisation** - Google Gemini automatically classifies each issue and routes it to the correct department
- **Status tracking** - citizens can follow every issue through Pending, In Progress, and Resolved
- **Multi-role access** - public users, department staff, and admins each have a separate dashboard and permission set
- **Admin dashboard** - full oversight across all departments, issues, and user accounts
- **Public reports** - aggregated data visible to all residents without an account
- **Feedback** - citizens leave feedback after an issue is marked resolved
- **Notifications** - in-app notification system for status updates

## Stack

| Layer | Technology |
|---|---|
| Frontend | React (TypeScript), component-based SPA |
| Backend | FastAPI, Python |
| Database | MongoDB (via Motor async driver) |
| Auth | JWT (python-jose, passlib/bcrypt) |
| AI | Google Gemini (google-genai) |
| File uploads | aiofiles |
| Deployment | Render |

## Project structure

```
backend/
  app/
    routers/    # issues, auth, users, ai, public
    models.py   # Pydantic models (Issue, User, Status, Department, etc.)
    auth.py     # JWT helpers, role-based request dependencies
    database.py # MongoDB connection
    config.py   # settings loaded from .env
components/     # React components, one per view/page
App.tsx         # client-side router as a view state machine
```

## Running locally

**Backend:**

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env   # fill in MONGODB_URI, JWT_SECRET_KEY, GEMINI_API_KEY
uvicorn app.main:app --reload
```

API will be available at `http://localhost:8000`.

**Frontend:**

The frontend is a TypeScript React app. Serve it with any static file server or open through a dev server that handles the TypeScript compilation.

## Deployment

Backend is deployed on Render as a web service. Set `MONGODB_URI`, `JWT_SECRET_KEY`, and `GEMINI_API_KEY` in Render's environment variable settings.

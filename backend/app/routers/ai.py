from fastapi import APIRouter
from typing import Optional
from google import genai
from google.genai import types

from app.config import get_settings
from app.models import AIRequest, AIResponse

router = APIRouter()
settings = get_settings()

# Configure Gemini client
client = genai.Client(api_key=settings.gemini_api_key)


CASEY_SYSTEM_PROMPT = """You are Casey, a friendly and helpful AI assistant for Civic Connect, a civic issue reporting platform.

Your role is to help citizens:
1. Report civic issues correctly by guiding them through the process
2. Suggest the appropriate department for their issue
3. Provide helpful tips for writing effective issue descriptions
4. Answer questions about how the platform works
5. Help citizens track their reported issues

Guidelines:
- Be friendly, professional, and empathetic
- Keep responses concise but helpful (max 3-4 sentences unless detailed explanation needed)
- If unsure about something specific to Civic Connect, guide users to contact support
- Help categorize issues into the correct department:
  * Public Works: Roads, street lights, drainage, public buildings
  * Health: Sanitation, disease outbreaks, hospital services, public health
  * Education: Schools, educational facilities, scholarships
  * Environment: Pollution, waste management, parks, trees
  * Transport: Public transport, traffic signals, bus stops
  * Water Supply: Water pipes, water quality, water shortage
  * Electricity: Power outages, electrical hazards, streetlights
  * Housing: Building permits, housing schemes, unauthorized construction

Always be encouraging about civic participation and thank users for being active citizens!
"""


@router.post("/chat", response_model=AIResponse)
async def chat_with_casey(request: AIRequest):
    """Chat with Casey, the AI assistant"""
    
    try:
        # Build the prompt with context
        full_prompt = f"{CASEY_SYSTEM_PROMPT}\n\nUser message: {request.message}"
        if request.issue_context:
            full_prompt += f"\n\nIssue context: {request.issue_context}"
        
        # Add conversation history if available
        if request.context:
            history_text = "\n\nPrevious conversation:\n"
            for msg in request.context:
                role = "User" if msg.get("role") == "user" else "Assistant"
                history_text += f"{role}: {msg.get('content', '')}\n"
            full_prompt = history_text + full_prompt
        
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=full_prompt
        )
        
        return AIResponse(
            response=response.text,
            suggestions=extract_suggestions(response.text, request.message)
        )
        
    except Exception as e:
        # Fallback response if Gemini fails
        return AIResponse(
            response="I apologize, but I'm having trouble connecting right now. Please try again in a moment, or you can proceed with reporting your issue directly.",
            suggestions=["Report an Issue", "View My Reports", "Check Dashboard"]
        )


@router.post("/suggest-department")
async def suggest_department(description: str):
    """Suggest the best department for an issue based on description"""
    
    try:
        prompt = f"""Based on the following civic issue description, suggest the most appropriate government department to handle it.

Issue description: {description}

Available departments:
- Public Works: Roads, street lights, drainage, public buildings
- Health: Sanitation, disease outbreaks, hospital services, public health
- Education: Schools, educational facilities, scholarships
- Environment: Pollution, waste management, parks, trees
- Transport: Public transport, traffic signals, bus stops
- Water Supply: Water pipes, water quality, water shortage
- Electricity: Power outages, electrical hazards, streetlights
- Housing: Building permits, housing schemes, unauthorized construction

Respond with ONLY the department name (exactly as listed above) and nothing else."""

        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt
        )
        suggested_dept = response.text.strip()
        
        # Validate department name
        valid_depts = [
            "Public Works", "Health", "Education", "Environment",
            "Transport", "Water Supply", "Electricity", "Housing"
        ]
        
        if suggested_dept not in valid_depts:
            suggested_dept = "Public Works"  # Default fallback
        
        return {"department": suggested_dept}
        
    except Exception:
        return {"department": "Public Works"}


@router.post("/improve-description")
async def improve_description(
    title: str,
    description: str,
    category: Optional[str] = None
):
    """Suggest improvements for issue description"""
    
    try:
        prompt = f"""As a civic engagement assistant, help improve this issue report for better clarity and actionability.

Title: {title}
Description: {description}
Category: {category or "Not specified"}

Provide a brief suggestion (2-3 sentences) on how to improve the description to be more specific and actionable. 
Focus on: specific location details, time/duration of issue, impact on community, any relevant measurements or observations.

Keep your response encouraging and helpful."""

        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt
        )
        
        return {
            "suggestion": response.text.strip(),
            "tips": [
                "Include exact location or landmark",
                "Mention how long the issue has existed",
                "Describe impact on daily life",
                "Add any relevant measurements"
            ]
        }
        
    except Exception:
        return {
            "suggestion": "Consider adding more specific details about the location and how this issue affects the community.",
            "tips": [
                "Include exact location or landmark",
                "Mention how long the issue has existed",
                "Describe impact on daily life"
            ]
        }


def extract_suggestions(response: str, user_message: str) -> list:
    """Extract action suggestions based on conversation context"""
    
    suggestions = []
    
    # Keywords to detect user intent
    lower_message = user_message.lower()
    lower_response = response.lower()
    
    if any(word in lower_message for word in ["report", "complaint", "issue", "problem"]):
        suggestions.append("Report an Issue")
    
    if any(word in lower_message for word in ["track", "status", "my report", "follow"]):
        suggestions.append("Track My Reports")
    
    if any(word in lower_message for word in ["dashboard", "stats", "statistics"]):
        suggestions.append("View Dashboard")
    
    if any(word in lower_response for word in ["public works", "road", "street light"]):
        suggestions.append("Report to Public Works")
    
    if any(word in lower_response for word in ["health", "sanitation", "hospital"]):
        suggestions.append("Report to Health Dept")
    
    # Default suggestions if none detected
    if not suggestions:
        suggestions = ["Report an Issue", "View My Reports", "Check Dashboard"]
    
    return suggestions[:3]  # Max 3 suggestions

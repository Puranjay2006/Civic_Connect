import { GoogleGenAI } from '@google/genai';
import { CivicIssue, Department } from '../types';
import { DepartmentReport } from './reportService';
import { DEPARTMENTS } from '../constants';

const getAi = () => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        throw new Error("API_KEY environment variable is not set.");
    }
    return new GoogleGenAI({ apiKey });
}

export const getChatbotResponse = async (issue: CivicIssue | undefined, issueId: string): Promise<string> => {
  const ai = getAi();
  
  let prompt: string;
  let systemInstruction: string = `You are "Casey", a friendly, empathetic, and professional virtual assistant for the Civic Connect platform. Your primary role is to provide citizens with clear and reassuring status updates about their reported issues.
- Always be polite and positive.
- Keep responses concise (2-3 sentences).
- If an issue is found, clearly state its status and what that means in simple terms.
- If an issue is NOT found, be apologetic and gently guide the user to double-check their ID.
- Do not invent information or promise specific resolution times.`;

  if (issue) {
    prompt = `A citizen is asking for the status of their complaint with ID "${issueId}". The complaint is about "${issue.title}" and its current status is "${issue.status}". Please provide a helpful response based on the persona. If the status is 'Pending', mention it has been received and is in the queue for review. If 'In Progress', say that our team is actively working on it. If 'Resolved', thank them for their patience and confirm the issue is fixed.`;
  } else {
    prompt = `A citizen is asking for the status of their complaint with ID "${issueId}", but this ID was not found in our system. Please provide a polite response based on the persona, informing them that the complaint ID is invalid. Ask them to double-check the ID and try again. Suggest they can report a new issue if they can't find their ID.`;
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction,
      }
    });
    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return "I'm sorry, I'm having trouble connecting to my services right now. Please try again in a moment.";
  }
};

export const geocodeLocation = async (locationString: string): Promise<{ lat: number; lng: number } | null> => {
  const ai = getAi();
  const prompt = `What are the latitude and longitude for the following location? Respond with only the latitude and longitude separated by a comma. Location: "${locationString}"`;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        tools: [{ googleMaps: {} }],
      },
    });
    
    const text = response.text;
    const parts = text.split(',');
    if (parts.length === 2) {
      const lat = parseFloat(parts[0].trim());
      const lng = parseFloat(parts[1].trim());
      if (!isNaN(lat) && !isNaN(lng)) {
        return { lat, lng };
      }
    }
    console.error("Could not parse coordinates from Gemini response:", text);
    return null;
  } catch (error) {
    console.error("Error calling Gemini API for geocoding:", error);
    return null;
  }
};

// FIX: Changed return type and string literal from 'Unknown' to 'unknown' to match component state type. This resolves type errors in IssueForm.tsx.
export const suggestDepartment = async (title: string, description: string, category: string): Promise<Department | 'unknown'> => {
  if (!title.trim() && !description.trim()) {
    return 'unknown';
  }
  const ai = getAi();
  
  const prompt = `You are an expert routing agent for a city's civic services department. Your task is to analyze a citizen's report and assign it to the correct department.

Here are the available departments and their responsibilities:
- **Electrical:** Issues with streetlights, power outages, exposed wiring, faulty traffic signals.
- **Water:** Leaking pipes, water main breaks, sewage problems, drainage and flooding issues.
- **Medical:** Public health emergencies, requests for emergency medical services (if non-critical), unsanitary conditions in public food establishments.
- **Sanitation:** Garbage collection (missed, overflowing bins), illegal dumping, street cleaning, large debris removal.
- **Roads:** Potholes, damaged sidewalks, faded road markings, broken signs, debris on the road.

Analyze the following issue report and determine the single most appropriate department.

**Examples:**
- **Issue:** "My street light is flickering" -> **Department:** Electrical
- **Issue:** "There's a huge pothole in front of my house." -> **Department:** Roads
- **Issue:** "The garbage truck missed our street this week and the bins are overflowing." -> **Department:** Sanitation
- **Issue:** "Water is bubbling up from a crack in the street." -> **Department:** Water

**Citizen's Report to Analyze:**
- **Title:** "${title}"
- **Description:** "${description}"
- **Category:** "${category}"

Based on this information, which department should handle this issue?
Respond with ONLY the name of the department from the list. If you are uncertain or the issue doesn't fit, respond with "unknown".`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    const suggestedDept = response.text.trim();

    // Check for an exact match first
    if (Object.values(Department).includes(suggestedDept as Department)) {
      return suggestedDept as Department;
    }
    
    // If no exact match, check if the response contains a department name.
    // This handles cases where the model might be verbose (e.g., "The department is Roads.")
    for (const dept of DEPARTMENTS) {
        if (suggestedDept.includes(dept)) {
            return dept;
        }
    }
    
    return 'unknown';

  } catch (error) {
    console.error("Error calling Gemini API for department suggestion:", error);
    return 'unknown'; // Return 'unknown' on API error to allow manual fallback
  }
};

export const getReportInsights = async (report: DepartmentReport, departmentName: string): Promise<string> => {
  const ai = getAi();

  const topCategory = Object.entries(report.categoryDistribution).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
  const msToDays = (ms: number): number => (ms > 0 ? ms / (1000 * 60 * 60 * 24) : 0);

  const simplifiedReport = {
      totalRequests: report.totalRequests,
      resolvedRequests: report.resolvedRequests,
      avgResolutionTimeDays: msToDays(report.avgResolutionTimeMs).toFixed(1),
      slaComplianceRate: report.slaComplianceRate.toFixed(1),
      avgSatisfaction: report.avgSatisfaction.toFixed(2),
      topCategory: topCategory
  };

  const prompt = `You are a data analyst for a city government. Analyze the following performance data for the "${departmentName}" department and provide 2-3 concise, insightful, and actionable bullet points for the department head. Focus on performance, recent trends, and citizen feedback.
  
  Data:
  - Total Issues: ${simplifiedReport.totalRequests}
  - Resolved Issues: ${simplifiedReport.resolvedRequests}
  - Average Resolution Time: ${simplifiedReport.avgResolutionTimeDays} days
  - SLA Compliance (target <3 days): ${simplifiedReport.slaComplianceRate}%
  - Average Citizen Satisfaction: ${simplifiedReport.avgSatisfaction} / 5 stars
  - Most Common Issue Type: ${simplifiedReport.topCategory}
  - Resolution time trend over the last 8 weeks (in days): ${report.weeklyTrends.map(t => t.avgResolutionTimeDays.toFixed(1)).join(', ')}
  
  Generate the insights in a friendly but professional tone. Start each bullet point with an emoji.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API for insights:", error);
    return "Could not generate insights at this time.";
  }
};


export const summarizeIssue = async (description: string): Promise<string> => {
  if (!description.trim()) {
    return "No description provided.";
  }
  const ai = getAi();
  const prompt = `Summarize the following civic issue description into one clear and concise sentence for a busy city official. The summary should capture the core problem. Description: "${description}"`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API for summarization:", error);
    throw new Error("Could not generate summary.");
  }
};
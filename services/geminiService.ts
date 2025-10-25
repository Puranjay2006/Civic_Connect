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

  if (issue) {
    prompt = `You are a friendly and helpful city service chatbot. A citizen is asking for the status of their complaint with ID "${issueId}". The complaint is about "${issue.title}" and its current status is "${issue.status}". Please provide a helpful and reassuring response. If the status is 'Pending', mention it has been received and is in the queue. If 'In Progress', say that our team is actively working on it. If 'Resolved', thank them for their patience and confirm the issue is fixed. Keep the response concise and positive.`;
  } else {
    prompt = `You are a friendly and helpful city service chatbot. A citizen is asking for the status of their complaint with ID "${issueId}", but this ID was not found in our system. Please provide a polite response informing them that the complaint ID is invalid. Ask them to double-check the ID and try again. Suggest they can report a new issue if they can't find their ID.`;
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
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
  
  const departmentList = DEPARTMENTS.join(', ');

  const prompt = `You are an intelligent routing agent for a city's civic issue reporting system.
  Based on the title, description, and category of the issue below, determine the most appropriate city department to handle it.
  The available departments are: ${departmentList}.
  
  Issue Title: "${title}"
  Issue Description: "${description}"
  Issue Category: "${category}"

  Respond with ONLY the name of the single most appropriate department from the list. For example, if the issue is about a broken water pipe, respond with "Water".
  If you are not confident or the issue does not clearly fit into any of the listed departments, respond with "unknown".`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    const suggestedDept = response.text.trim();

    // Check if the response is a valid department
    if (Object.values(Department).includes(suggestedDept as Department)) {
      return suggestedDept as Department;
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
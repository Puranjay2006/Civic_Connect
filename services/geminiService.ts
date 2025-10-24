
import { GoogleGenAI } from '@google/genai';
import { CivicIssue } from '../types';

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

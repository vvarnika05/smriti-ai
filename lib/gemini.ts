import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

/**
 * A helper function to call the Gemini AI model.
 * @param prompt The prompt to send to the AI.
 * @returns The AI's text response.
 */
export async function askGemini(prompt: string): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}

/**
 * Extracts a JSON array from a string.
 * @param text The string to search for JSON.
 * @returns The parsed JSON object.
 */
export function extractJSON(text: string): any {
  const match = text.match(/\[.*\]/s);
  if (!match) throw new Error("No JSON array found in the provided text.");
  return JSON.parse(match[0]);
}
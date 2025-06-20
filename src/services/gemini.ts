import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.REACT_APP_GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("REACT_APP_GEMINI_API_KEY is not set");
}

const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function sendMessage(message: string) {
  try {
    console.log('📤 Sending request to Gemini...');
    const result = await model.generateContent(message);
    const response = await result.response;
    const text = response.text();
    console.log('📥 Received response from Gemini');
    return text;
  } catch (error) {
    console.error("Error sending message to Gemini:", error);
    return "Sorry, I encountered an error. Please try again.";
  }
} 
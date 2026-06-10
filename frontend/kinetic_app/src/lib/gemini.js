import { GoogleGenerativeAI } from "@google/generative-ai";

// Ensure your VITE_GEMINI_KEY is set in your .env file
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_KEY);


export const getCoachInsights = async (history, profile) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `
      ROLE: KINETIC AI PERFORMANCE COACH
      OBJECTIVE: PROVIDE TECHNICAL, DATA-DRIVEN ATHLETIC ADVICE.
      
      USER DATA:
      Current Weight: ${profile.weight}kg
      Recent History: ${JSON.stringify(history.slice(0, 3))}
      
      INSTRUCTIONS:
      1. Use a technical, professional, and slightly aggressive tone (athlete-focused).
      2. Analyze their volume trend if history exists.
      3. Provide one specific "Optimization Tip" for their next session.
      4. Keep the response under 100 words and use ALL CAPS for key headings.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("AI Link Failure:", error);
    return "SYSTEM ERROR: UNABLE TO ACCESS NEURAL NETWORK. ENSURE API KEY IS VALID.";
  }
};
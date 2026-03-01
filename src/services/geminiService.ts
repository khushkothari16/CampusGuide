import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface ChatMessage {
  role: "user" | "model";
  text: string;
}

export async function getCampusInfo(query: string) {
  try {
    const response = await fetch(`/api/knowledge?q=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error("Failed to fetch knowledge");
    return await response.json();
  } catch (error) {
    console.error("Error fetching knowledge:", error);
    return null;
  }
}

export async function generateCampusResponse(
  message: string,
  history: ChatMessage[],
  userContext: "fresher" | "student" | "visitor" = "student"
) {
  // 1. Fetch relevant knowledge
  const knowledge = await getCampusInfo(message);
  
  // 2. Format knowledge for the prompt
  let knowledgeContext = "No specific information found in the database for this query.";
  if (knowledge) {
    const parts = [];
    if (knowledge.facilities.length > 0) {
      parts.push("Facilities: " + knowledge.facilities.map((f: any) => `${f.name} at ${f.location} (${f.hours}). ${f.description}`).join("; "));
    }
    if (knowledge.events.length > 0) {
      parts.push("Events: " + knowledge.events.map((e: any) => `${e.name} on ${e.date} at ${e.location}. ${e.description}`).join("; "));
    }
    if (knowledge.clubs.length > 0) {
      parts.push("Clubs: " + knowledge.clubs.map((c: any) => `${c.name}: ${c.description}. Procedure: ${c.procedure}`).join("; "));
    }
    if (knowledge.rules.length > 0) {
      parts.push("Rules: " + knowledge.rules.map((r: any) => `[${r.category}] ${r.rule_text}`).join("; "));
    }
    if (knowledge.admission && knowledge.admission.length > 0) {
      parts.push("Admission & Fees: " + knowledge.admission.map((a: any) => `${a.title} (${a.category}): ${a.content}`).join("; "));
    }
    if (parts.length > 0) {
      knowledgeContext = parts.join("\n");
    }
  }

  const systemInstruction = `You are CampusGuide AI, a helpful and friendly assistant for Techno NJR (Techno India NJR Institute of Technology).
Your goal is to assist ${userContext}s with accurate information about the campus, admissions, and facilities.
Use the following knowledge base information AND the provided college website (https://www.technonjr.org/admission/) to answer the user's query. 
If the information is not in the knowledge base or on the website, politely inform the user and suggest they contact the admission cell.
Be concise, informative, and maintain a professional yet approachable tone.

KNOWLEDGE BASE:
${knowledgeContext}

USER CONTEXT: The user is a ${userContext}.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: history.map(h => ({ role: h.role, parts: [{ text: h.text }] })).concat([{ role: "user", parts: [{ text: message }] }]),
      config: {
        systemInstruction,
        tools: [{ urlContext: {} }]
      },
    });

    return response.text || "I'm sorry, I couldn't process that request.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I'm having trouble connecting to my brain right now. Please try again later.";
  }
}

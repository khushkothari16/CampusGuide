import { GoogleGenAI } from "@google/genai";

// Still keep the interface for type compatibility
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
  let knowledgeContext = "No specific information found in the database. General campus info mode.";
  if (knowledge) {
    const sections = [];
    if (knowledge.facilities?.length > 0) {
      sections.push("### Facilities\n" + knowledge.facilities.map((f: any) => `- **${f.name}**: ${f.description}`).join("\n"));
    }
    if (knowledge.rules?.length > 0) {
      sections.push("### Rules\n" + knowledge.rules.map((r: any) => `- ${r.rule_text}`).join("\n"));
    }
    if (sections.length > 0) knowledgeContext = sections.join("\n\n");
  }

  const systemPreamble = `You are CampusGuide AI for Techno India NJR (Techno NJR), Udaipur. Helpful, concise, student-focused.

BASE KNOWLEDGE:
${knowledgeContext}

USER TYPE: ${userContext}`;

  try {
    // Calling our OWN backend proxy
    const response = await fetch('/api/chat', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        history,
        systemPreamble
      })
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.text || "I'm sorry, I couldn't generate a response.";
  } catch (error: any) {
    console.error("Chatbot Proxy Error:", error);
    return "I'm having trouble connecting to my brain right now. Please try again later.";
  }
}

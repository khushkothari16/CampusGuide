import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

const apiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
const genAI = new GoogleGenAI({ apiKey });

async function listAllModels() {
    try {
        console.log("Gemini API Key:", apiKey?.substring(0, 4) + "****");

        // The @google/genai SDK often has individual model methods
        // We'll try to fetch the list via REST directly if the SDK doesn't expose it easily
        const url = `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.models) {
            console.log("AVAILABLE MODELS:");
            data.models.forEach(m => console.log(`- ${m.name} (supports: ${m.supportedGenerationMethods.join(", ")})`));
        } else {
            console.log("No models found or error:", JSON.stringify(data));
        }
    } catch (error) {
        console.error("Error fetching models:", error);
    }
}

listAllModels();

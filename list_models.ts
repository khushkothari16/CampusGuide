import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

const apiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
const genAI = new GoogleGenAI({ apiKey });

async function listModels() {
    try {
        // Note: The @google/genai SDK might have a different way to list models
        // If it doesn't support listing directly, we'll try a common model name
        console.log("Checking models for API key starting with:", apiKey?.substring(0, 4));

        // Attempting a simple generation with a few common names
        const models = ["gemini-1.5-flash", "gemini-1.5-flash-8b", "gemini-2.0-flash", "gemini-1.0-pro"];

        for (const modelName of models) {
            try {
                const response = await genAI.models.generateContent({
                    model: modelName,
                    contents: [{ role: "user", parts: [{ text: "hi" }] }]
                });
                console.log(`✅ Model ${modelName} is AVAILABLE`);
            } catch (e) {
                console.log(`❌ Model ${modelName} failed: ${e.message}`);
            }
        }
    } catch (error) {
        console.error("Error listing models:", error);
    }
}

listModels();

import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import path from "path";

function getApiKey() {
    try {
        const envPath = path.resolve(".env.local");
        if (fs.existsSync(envPath)) {
            const content = fs.readFileSync(envPath, 'utf8');
            const match = content.match(/VITE_API_KEY=(.*)/);
            if (match) return match[1].trim().replace(/['"]/g, '');
        }
    } catch (e) { }
    return null;
}

const apiKey = getApiKey();

if (!apiKey) {
    console.error("API Key not found in .env.local");
    process.exit(1);
}

const genAI = new GoogleGenAI({ apiKey });

async function listModels() {
    try {
        const response = await genAI.models.list();
        console.log("Available Models:");
        response.models.forEach((m) => {
            console.log(`- ${m.name} | Methods: ${m.supportedGenerationMethods.join(", ")}`);
        });
    } catch (error) {
        console.error("Error listing models:", error);
    }
}

listModels();

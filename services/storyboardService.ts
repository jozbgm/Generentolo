import { getAiClient } from './geminiService';

export interface StoryboardPrompt {
    id: string;
    title: string;
    prompt: string;
}

const STORYBOARD_SYSTEM_PROMPT = `
You are an expert Director of Photography and Storyboard Artist. Your task: Analyze ONE reference image and create 9 cinematic variations of the same scene.

# NON-NEGOTIABLE RULES - CONTINUITY
1) Carefully analyze the image: identify ALL key subjects (people/objects/vehicles/animals/props/environment) and their spatial relationships.
2) DO NOT invent real identities, specific locations, or brands. Stick to visible facts.
3) Rigorous continuity in ALL variations: same subjects, same clothing/appearance, same environment, same lighting and color palette. ONLY change: framing, angle, camera movement, expression, minor action.
4) Realistic Depth of Field: deeper in wide shots, shallower in close-ups. Maintain ONE consistent cinematic color grade.
5) DO NOT introduce new characters/objects not present in the reference image.

# OBJECTIVE
Create 9 cinematic variations of the image that explore the scene from different angles, frames, and visual approaches, while maintaining perfect continuity.

# PROCESS
STEP 1 - QUICK ANALYSIS (non-output):
- Identify main subjects and their visual characteristics
- Detect environment, lighting, mood
- Identify 3-5 visual elements that must remain constant

STEP 2 - CINEMATIC STRATEGY (non-output):
Plan 9 variations including:
- 2-3 Wide shots (ELS/LS/MLS)
- 3-4 Medium/Close shots (MS/MCU/CU)
- 1-2 Extreme details (ECU/Insert)
- 1-2 Power angles (Low angle/High angle/POV)

Vary:
- Camera height (eye-level, low, high, worm's-eye, bird's-eye)
- Camera movement (static, push-in, pull-out, pan, dolly, orbit, handheld)
- Focal length (18mm, 24mm, 35mm, 50mm, 85mm, 135mm)
- Depth of Field (shallow, medium, deep)

# FINAL OUTPUT - 9 CINEMATIC PROMPTS
Generate EXACTLY 9 prompts. Use the following format for EACH prompt:

### [SHOT TYPE NAME]
[Full prompt here]

DO NOT include Titles inside the prompt boxes. The title must be ABOVE the prompt.
Prompt structure: [Shot type], [subject description with clothing/features], [action/pose], [environment details], [foreground/background elements], [lighting description], [camera angle/height], [focal length]mm, [DoF], [color grade/mood keywords], [atmospheric elements], cinematic, photorealistic, 8K.

Return ONLY the titles and prompts. No extra text.
`;

export const generateCinematicStoryboard = async (
    referenceImage: File,
    userApiKey: string | null,
    language: 'en' | 'it' = 'en'
): Promise<StoryboardPrompt[]> => {
    try {
        const ai = getAiClient(userApiKey);

        // Convert file to generative part
        const imageData = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(referenceImage);
        });

        const base64Data = imageData.split(',')[1];

        const result = await (ai as any).models.generateContent({
            model: "gemini-3-flash-preview",
            contents: [
                {
                    role: "user",
                    parts: [
                        { text: STORYBOARD_SYSTEM_PROMPT },
                        {
                            inlineData: {
                                data: base64Data,
                                mimeType: referenceImage.type
                            }
                        },
                        { text: language === 'it' ? "Analizza questa immagine e crea lo storyboard di 9 inquadrature." : "Analyze this image and create the 9-shot storyboard." }
                    ]
                }
            ]
        });

        const responseText = result.candidates?.[0]?.content?.parts?.[0]?.text || "";
        return parseStoryboardResponse(responseText);
    } catch (error) {
        console.error("Storyboard generation error:", error);
        throw error;
    }
};

const parseStoryboardResponse = (text: string): StoryboardPrompt[] => {
    const prompts: StoryboardPrompt[] = [];
    // Looking for ### [Title] followed by text
    const blocks = text.split(/###\s+/).filter(b => b.trim().length > 0);

    blocks.forEach((block) => {
        const lines = block.split('\n');
        const title = lines[0].trim();
        const prompt = lines.slice(1).join('\n').trim();

        if (title && prompt) {
            prompts.push({
                id: crypto.randomUUID(),
                title,
                prompt
            });
        }
    });

    return prompts.slice(0, 9);
};

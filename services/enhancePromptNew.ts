/**
 * 🚀 REVOLUTIONARY PROMPT ENHANCEMENT SYSTEM v2.7 "God-Mode Awareness"
 * 
 * MASTER BRAIN: High-speed, vision-aware, advertising-focused Art Direction.
 * v2.7: Absolute integration with EVERY user selection (Presets, Studio, Technicals, Negative).
 */

import { getAiClient, fileToGenerativePart, SAFETY_SETTINGS_PERMISSIVE } from './geminiService';

export interface EnhancementResult {
    enhancedPrompt: string;
    artDirectorPlan: string;
    method: 'vision-aware' | 'standard' | 'fallback';
}

/**
 * MASTER BRAIN ENHANCEMENT
 * Single-pass combined Vision Analysis & Prompt Enhancement with Full Application State
 */
export async function enhancePromptV2(
    currentPrompt: string,
    imageFiles: File[],
    styleFile: File | null,
    structureFile: File | null,
    userApiKey: string | null | undefined,
    language: 'en' | 'it',
    characterDna: string | undefined,
    studioConfig: any,
    classicPresets: {
        style?: string | null;
        lighting?: string | null;
        camera?: string | null;
        focus?: string | null;
    },
    technical: {
        aspectRatio: string;
        resolution: string;
        negativePrompt: string;
        model: string;
    }
): Promise<EnhancementResult> {
    try {
        const ai = getAiClient(userApiKey || undefined);

        const allImages: File[] = [];
        if (imageFiles.length > 0) allImages.push(...imageFiles);
        if (styleFile) allImages.push(styleFile);
        if (structureFile) allImages.push(structureFile);

        const visionParts = [];
        for (const file of allImages) {
            visionParts.push(await fileToGenerativePart(file));
        }

        // Build THE TOTAL CONTEXT (God-Mode)
        let contextParts: string[] = [];

        // 1. Production Framework
        if (studioConfig?.kit) contextParts.push(`PRODUCTION KIT: ${studioConfig.kit} (Core Aesthetic)`);
        if (classicPresets?.style) contextParts.push(`VISUAL STYLE: ${classicPresets.style}`);

        // 2. Camera & Composition (Aware of Aspect Ratio)
        const isVertical = technical.aspectRatio.includes('9:16') || technical.aspectRatio.includes('3:4');
        const isWide = technical.aspectRatio.includes('21:9') || technical.aspectRatio.includes('16:9');
        contextParts.push(`ASPECT RATIO: ${technical.aspectRatio} (${isVertical ? 'Vertical Portrait' : isWide ? 'Cinematic Wide' : 'Standard Square'})`);

        if (studioConfig?.camera || classicPresets?.camera) contextParts.push(`CAMERA BODY: ${studioConfig?.camera || classicPresets?.camera}`);
        if (studioConfig?.lens) contextParts.push(`LENS: ${studioConfig.lens}`);
        if (studioConfig?.focal) contextParts.push(`FOCAL LENGTH: ${studioConfig.focal}`);
        if (classicPresets?.focus) contextParts.push(`OPTICAL DEPTH: ${classicPresets.focus}`);
        if (studioConfig?.shot) contextParts.push(`SHOT ANGLE/TYPE: ${studioConfig.shot}`);

        // 3. Lighting & Environment
        if (studioConfig?.lightQuality || classicPresets?.lighting) contextParts.push(`LIGHTING QUALITY: ${studioConfig?.lightQuality || classicPresets?.lighting}`);
        if (studioConfig?.lightColor) contextParts.push(`LIGHT COLOR: ${studioConfig.lightColor}`);
        if (studioConfig?.lightDir) contextParts.push(`LIGHT DIRECTION: ${studioConfig.lightDir}`);
        if (studioConfig?.wardrobeSet) contextParts.push(`WARDROBE/STYLING: ${studioConfig.wardrobeSet}`);

        // 4. Technical Constraints
        contextParts.push(`TARGET RESOLUTION: ${technical.resolution.toUpperCase()}`);
        if (technical.negativePrompt && technical.negativePrompt.trim().length > 2) {
            contextParts.push(`STRICTLY AVOID (Negative Prompt): ${technical.negativePrompt}`);
        }

        const fullStudioContext = contextParts.map(p => `- ${p}`).join('\n');

        const systemInstruction = `# ROLE
You are the Supreme Art Director of Generentolo, an expert in prompt engineering for the Nano Banana 2 model (based on Gemini 3.1 Flash). Your goal is to translate the user's ideas into hyper-detailed visual narratives written in NATURAL LANGUAGE.

# AESTHETIC VISION & BEST PRACTICES FOR NANO BANANA 2 (CRITICAL)
- **No keyword lists**: Nano Banana 2 hates Stable Diffusion/Midjourney style tag lists (e.g., "4k, masterpiece, cinematic lighting, sharp focus").
- **Use natural language**: Write fluid, descriptive paragraphs. Tell a coherent visual story.
- **Be hyper-specific**: Describe the subject, action, expression, context, environment, materials, and textures in detail.
- **Narrative photography**: If the user wants realism, use photographic terminology narratively (e.g., "The scene is captured with a wide-angle lens during golden hour, with soft, diffused light illuminating the subject...").
- **Consistency**: Analyze reference images and respect DNA traits if present.
- **Total Integration**: You MUST elegantly integrate every single technical choice (Kit, Camera, Aspect Ratio, etc.) INTO the narrative, not as a list.

# TOTAL APPLICATION STATE (TECHNICAL CONTEXT)
${fullStudioContext}

# CHARACTER DNA
${characterDna ? `CHARACTER DNA REFERENCE: ${characterDna}.` : "No DNA reference."}

# OBJECTIVE (JSON Output)
1. **enhancedPrompt**: A fluid, organic, hyper-detailed ENGLISH description (100-150 words). Write a *narrative paragraph*, not a list of tags. Incorporate technical choices (lenses, lighting, mood) by naturally blending them into the scene description.
2. **artDirectorPlan**: Creative commentary in ${language === 'it' ? 'ITALIAN' : 'ENGLISH'} (max 2 sentences) explaining how you merged user desires and technique into this descriptive vision.

# RULES
- If there are reference images, integrate them organically (e.g., "The character from Image 1 is wearing the jacket from Image 2...").
- NO ISOLATED TAGS. Write complete, meaningful sentences.
- Return ONLY the JSON.`;

        const result = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: {
                parts: [
                    ...visionParts,
                    { text: `Enhance this prompt by masterfully merging the original idea with ALL current technical settings: "${currentPrompt}"` }
                ]
            },
            config: {
                systemInstruction,
                temperature: 0.7,
                safetySettings: SAFETY_SETTINGS_PERMISSIVE
            }
        });

        const responseText = result.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!responseText) {
            throw new Error("Empty response from Master Brain");
        }

        let cleanedText = responseText.trim();
        if (cleanedText.startsWith('```')) {
            cleanedText = cleanedText.replace(/^```(json)?/, '').replace(/```$/, '').trim();
        }

        try {
            let data;
            if (cleanedText.includes('{')) {
                const start = cleanedText.indexOf('{');
                const end = cleanedText.lastIndexOf('}') + 1;
                data = JSON.parse(cleanedText.substring(start, end));
            } else {
                data = { enhancedPrompt: cleanedText, artDirectorPlan: "" };
            }

            return {
                enhancedPrompt: data.enhancedPrompt || currentPrompt,
                artDirectorPlan: data.artDirectorPlan || "",
                method: visionParts.length > 0 ? 'vision-aware' : 'standard'
            };
        } catch (parseError) {
            console.error('❌ Failed to parse Master Brain JSON:', cleanedText);
            throw parseError;
        }
    } catch (error) {
        console.error('❌ Master Brain Single-Pass failed:', error);
    }

    return {
        enhancedPrompt: currentPrompt,
        artDirectorPlan: "",
        method: 'fallback'
    };
}

export default enhancePromptV2;

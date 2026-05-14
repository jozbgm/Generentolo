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
You are the Supreme Art Director of Generentolo — a specialist in prompt engineering
for Nano Banana 2 (Gemini 3.1 Flash Image Preview, gemini-3.1-flash-image-preview).
You translate creative ideas into precision-crafted visual narratives
that maximize this model's native capabilities.

# NANO BANANA 2 — WHAT THIS MODEL RESPONDS TO (CRITICAL KNOWLEDGE)
- **Natural language narrative**: Write fluid, descriptive prose.
  The model applies deep reasoning to understand scene intent — reward it with rich context.
- **Never use tag lists**: Comma-separated keyword strings (SD/MJ style) degrade output quality.
- **Positive framing always**: Describe what IS in the image.
  "Empty marble counter" not "no clutter". "Clean studio backdrop" not "no background".
- **Photographic hardware specificity unlocks visual DNA**: Naming exact hardware changes the image's character.
  "Shot on Fujifilm GFX 100S" → medium format compression + Fujifilm color rendering.
  "Shot on Sony A7R V" → clinical digital sharpness.
  "Disposable film camera" → raw nostalgic flash aesthetic.
  "Hasselblad H6D" → creamy medium-format bokeh with neutral color science.
- **Lighting by name**: "Three-point softbox setup", "Chiaroscuro with harsh high contrast",
  "Golden hour backlighting with long shadows", "Rembrandt from camera-left at 45°",
  "Butterfly lighting for beauty portrait", "Overcast outdoor fill light".
- **Resolution awareness**: This model natively outputs up to 4K.
  If high-fidelity detail matters, specify "hyper-detailed surface rendering"
  or "4K upscaled texture resolution".
- **Up to 14 reference images**: When images are provided, reference them by position
  (Image 1, Image 2...) and specify exactly which element to borrow from each.
- **Real-world knowledge grounding**: The model has live web search access.
  For specific real-world subjects (brands, locations, materials), name them precisely.

# TOTAL APPLICATION STATE (TECHNICAL CONTEXT)
${fullStudioContext}

# CHARACTER DNA
${characterDna ? `CHARACTER DNA REFERENCE: ${characterDna}. Maintain ALL described traits with zero deviation.` : "No DNA reference provided."}

# OBJECTIVE (JSON Output)
Generate a JSON object with exactly two fields:

1. **enhancedPrompt**: A single, fluid, hyper-detailed English narrative (120-180 words).
   Structure it as:
   [Subject + appearance/DNA] [Action/pose/interaction]
   [Location/environment with material and texture detail]
   [Lighting setup by name + quality + direction]
   [Camera hardware + focal length + aperture]
   [Color grade / film stock / color science]
   [Atmospheric or surface texture elements]

   Every technical choice from the Studio Context MUST be woven organically into the prose.
   NEVER use tags, lists, or isolated keywords.
   POSITIVE FRAMING ONLY throughout.

2. **artDirectorPlan**: 2-sentence creative commentary in ${language === 'it' ? 'ITALIAN' : 'ENGLISH'}
   explaining the directorial vision: what you prioritized and why
   this configuration serves the user's intent.

# REFERENCE IMAGE INTEGRATION
If reference images are provided:
- Cite them explicitly: "The character from Image 1, wearing the jacket visible in Image 2..."
- Specify texture/material extraction: "adopting the warm terracotta surface texture from Image 3..."
- Do NOT generalize — be surgically precise about what you take from each image.

# OUTPUT
Return ONLY valid JSON. No markdown, no preamble, no commentary outside the JSON.`;

        const result = await ai.models.generateContent({
            model: 'gemini-3.1-pro-preview',
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

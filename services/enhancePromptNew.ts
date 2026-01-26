/**
 * 🚀 REVOLUTIONARY PROMPT ENHANCEMENT SYSTEM v2.7 "God-Mode Awareness"
 * 
 * MASTER BRAIN: High-speed, vision-aware, advertising-focused Art Direction.
 * v2.7: Absolute integration with EVERY user selection (Presets, Studio, Technicals, Negative).
 */

import { getAiClient, fileToGenerativePart } from './geminiService';

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

        const systemInstruction = language === 'it'
            ? `# RUOLO
Sei l'Art Director Supremo di Generentolo. Hai un occhio infallibile per la bellezza naturale e la perfezione tecnica.

# VISIONE ESTETICA (CRITICA)
- **NO over-processing**: Evita look "AI finta", contrasti bruciati o sharpening eccessivo.
- **Sì Naturalezza**: Punta su "soft light", "organic textures", "natural skin", "cinematic depth".
- **Coerenza**: Analizza le reference images e integra i tratti del DNA se presenti.
- **Rispetto Totale**: DEVI integrare ogni singola scelta tecnica dell'utente (Kit, Camera, Luci, Formato, Negativo). Il prompt deve essere il risultato armonico di TUTTI questi settaggi.

# STATO TOTALE DELL'APPLICAZIONE (CONTESTO)
${fullStudioContext}

# DNA PERSONAGGIO
${characterDna ? `RIFERIMENTO DNA: ${characterDna}.` : "Nessun DNA specifico."}

# OBIETTIVO (JSON Output)
1. **enhancedPrompt**: Descrizione magistrale (90-130 parole) in INGLESE. Non elencare i settaggi, ma USALI per descrivere la scena (es. se la lente è 85mm, descrivi la compressione dello sfondo).
2. **artDirectorPlan**: Commento in ITALIANO (max 2 frasi) che spiega come hai fuso i desideri dell'utente in questa visione.

# REGOLE
- Se ci sono reference images, integrali con "from Image 1", etc.
- Restituisci SOLO il JSON.`
            : `# ROLE
You are the Supreme Art Director of Generentolo. You have an infallible eye for natural beauty and technical perfection.

# AESTHETIC VISION (CRITICAL)
- **NO over-processing**: Avoid that "fake AI" look, blown-out contrast, or excessive sharpening.
- **YES Natural**: Focus on "soft light", "organic textures", "natural skin", "cinematic depth".
- **Consistency**: Analyze reference images and respect DNA traits if present.
- **Total Respect**: You MUST integrate every single technical choice made by the user (Kit, Camera, Lights, Aspect Ratio, Negative). The prompt must be the harmonic result of ALL these settings.

# TOTAL APPLICATION STATE (CONTEXT)
${fullStudioContext}

# CHARACTER DNA
${characterDna ? `CHARACTER DNA REFERENCE: ${characterDna}.` : "No DNA reference."}

# OBJECTIVE (JSON Output)
1. **enhancedPrompt**: Masterful description (90-130 words) in ENGLISH. Do not list settings; USE them to describe the scene (e.g., if the lens is 85mm, describe the background compression).
2. **artDirectorPlan**: Creative commentary in ENGLISH (max 2 sentences) explaining how you merged all user choices into this vision.

# RULES
- Use "from Image 1", etc. if references are present.
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
                temperature: 0.7
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

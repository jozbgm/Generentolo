/**
 * 🚀 REVOLUTIONARY PROMPT ENHANCEMENT SYSTEM v2.2 "Super-Light"
 * 
 * MASTER BRAIN: High-speed, vision-aware, advertising-focused Art Direction.
 * v2.2: Single-pass multi-modal optimization for maximum speed.
 */

import { getAiClient, fileToGenerativePart } from './geminiService';

export interface EnhancementResult {
    enhancedPrompt: string;
    artDirectorPlan: string;
    method: 'vision-aware' | 'standard' | 'fallback';
}

/**
 * MASTER BRAIN ENHANCEMENT
 * Single-pass combined Vision Analysis & Prompt Enhancement
 */
export async function enhancePromptV2(
    currentPrompt: string,
    imageFiles: File[],
    styleFile: File | null,
    structureFile: File | null,
    userApiKey?: string | null,
    language: 'en' | 'it' = 'en',
    characterDna?: string // v1.9.5: Support for Character Consistency
): Promise<EnhancementResult> {
    try {
        const ai = getAiClient(userApiKey);

        const allImages: File[] = [];
        if (imageFiles.length > 0) allImages.push(...imageFiles);
        if (styleFile) allImages.push(styleFile);
        if (structureFile) allImages.push(structureFile);

        const visionParts = [];
        for (const file of allImages) {
            visionParts.push(await fileToGenerativePart(file));
        }

        const systemInstruction = language === 'it'
            ? `# RUOLO
Sei l'Art Director Supremo di Generentolo. Hai un occhio infallibile per la bellezza naturale e l'armonia fotografica.

# VISIONE ESTETICA (CRITICA)
- **NO over-processing**: Evita contrasti estremi, sharpening artificiale o look "finto".
- **Sì Naturalezza**: Punta su "soft diffused light", "organic textures", "natural skin tones", "dreamy bokeh".
- **Analisi Visiva**: Analizza attentamente le immagini fornite (Image 1, Image 2, ecc.) per catturare soggetti, colori e stili. Se è presente un DNA, rispettalo rigorosamente.
- **Equilibrio**: L'immagine deve sembrare scattata con pellicola professionale o sensore high-end, con una gamma dinamica bilanciata.

# OBIETTIVO (JSON Output)
1. **enhancedPrompt**: Descrizione iper-dettagliata (80-120 parole) in INGLESE. Usa un linguaggio sensoriale e tecnico (es. "subtle rim light", "shallow depth of field", "rich highlights").
2. **artDirectorPlan**: Commento creativo in ITALIANO (max 2 frasi) che descriva l'atmosfera e la luce scelta.

# REGOLE
- Se ci sono reference images, integrali con "from Image 1", etc.
- ${characterDna ? `RIFERIMENTO DNA PERSONAGGIO: ${characterDna}. Rispetta questi tratti nel prompt.` : ""}
- Restituisci SOLO il JSON.`
            : `# ROLE
You are the Supreme Art Director of Generentolo. You have an infallible eye for natural beauty and photographic harmony.

# AESTHETIC VISION (CRITICAL)
- **NO over-processing**: Avoid extreme contrast, artificial sharpening, or that "fake AI" look.
- **YES Natural**: Focus on "soft diffused light", "organic textures", "natural skin tones", "dreamy bokeh".
- **Visual Analysis**: Carefully analyze all provided images (Image 1, Image 2, etc.) to capture subjects, colors, and styles. If DNA is present, respect it rigorously.
- **Balance**: The image should look like it was shot with professional film or a high-end sensor, with a balanced dynamic range.

# OBJECTIVE (JSON Output)
1. **enhancedPrompt**: Hyper-detailed description (80-120 words) in ENGLISH. Use sensory and technical language (e.g., "subtle rim light", "shallow depth of field", "rich highlights").
2. **artDirectorPlan**: Creative commentary in ENGLISH (max 2 sentences) describing the atmosphere and light you've chosen.

# RULES
- Use "from Image 1", etc. if references are present.
- ${characterDna ? `CHARACTER DNA REFERENCE: ${characterDna}. Respect these traits in the prompt.` : ""}
- Return ONLY the JSON.`;

        const result = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: {
                parts: [
                    ...visionParts,
                    { text: `Transform this prompt into a photographic masterpiece: "${currentPrompt}"` }
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

        // Remove markdown code blocks if present
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

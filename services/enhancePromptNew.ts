/**
 * 🚀 REVOLUTIONARY PROMPT ENHANCEMENT SYSTEM v2.5 "Full-Awareness"
 * 
 * MASTER BRAIN: High-speed, vision-aware, advertising-focused Art Direction.
 * v2.5: Deep integration with Studio Config, Production Kits, and Image DNA.
 */

import { getAiClient, fileToGenerativePart } from './geminiService';

export interface EnhancementResult {
    enhancedPrompt: string;
    artDirectorPlan: string;
    method: 'vision-aware' | 'standard' | 'fallback';
}

/**
 * MASTER BRAIN ENHANCEMENT
 * Single-pass combined Vision Analysis & Prompt Enhancement with Studio Context
 */
export async function enhancePromptV2(
    currentPrompt: string,
    imageFiles: File[],
    styleFile: File | null,
    structureFile: File | null,
    userApiKey?: string | null,
    language: 'en' | 'it' = 'en',
    characterDna?: string, // v1.9.5: Support for Character Consistency
    studioConfig?: any // v1.9.6: Full Studio Integration
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

        // v1.9.6: Build Studio Context for AI
        let studioContext = "";
        if (studioConfig) {
            if (studioConfig.kit) studioContext += `- PRODUCTION KIT: ${studioConfig.kit} (This is the primary stylistic framework)\n`;
            if (studioConfig.camera) studioContext += `- CAMERA: ${studioConfig.camera}\n`;
            if (studioConfig.lens) studioContext += `- LENS: ${studioConfig.lens}\n`;
            if (studioConfig.focal) studioContext += `- FOCAL: ${studioConfig.focal}\n`;
            if (studioConfig.lightDir) studioContext += `- LIGHT DIRECTION: ${studioConfig.lightDir}\n`;
            if (studioConfig.lightQuality) studioContext += `- LIGHT QUALITY: ${studioConfig.lightQuality}\n`;
            if (studioConfig.lightColor) studioContext += `- LIGHT COLOR: ${studioConfig.lightColor}\n`;
            if (studioConfig.shot) studioContext += `- SHOT TYPE: ${studioConfig.shot}\n`;
            if (studioConfig.wardrobeSet) studioContext += `- WARDROBE: ${studioConfig.wardrobeSet}\n`;
        }

        const systemInstruction = language === 'it'
            ? `# RUOLO
Sei l'Art Director Supremo di Generentolo. Hai un occhio infallibile per la bellezza naturale e l'armonia fotografica high-end.

# VISIONE ESTETICA (CRITICA)
- **NO over-processing**: Evita contrasti estremi, sharpening artificiale o look "finto AI".
- **Sì Naturalezza**: Punta su "soft diffused light", "organic textures", "natural skin tones", "dreamy bokeh".
- **Analisi Visiva**: Analizza attentamente le immagini fornite (Image 1, Image 2, ecc.) per catturare soggetti, colori e stili. Se è presente un DNA, rispettalo rigorosamente.
- **Integrazione Studio**: RISPETTA MANDATORIAMENTE le impostazioni dello Studio fornite (Camera, Luci, Kit). Se un Kit è selezionato, deve essere l'anima della composizione.

# CONTESTO STUDIO SELEZIONATO
${studioContext || "Nessuna impostazione specifica."}

# PERSONAGGIO DNA
${characterDna ? `RIFERIMENTO DNA PERSONAGGIO: ${characterDna}. Il soggetto deve avere queste caratteristiche.` : "Nessun riferimento DNA."}

# OBIETTIVO (JSON Output)
1. **enhancedPrompt**: Descrizione iper-dettagliata (80-120 parole) in INGLESE. Usa un linguaggio sensoriale e tecnico. Integra il contesto dello Studio e del Kit in modo fluido, non come una lista.
2. **artDirectorPlan**: Commento creativo in ITALIANO (max 2 frasi) che descriva l'atmosfera e la luce scelta in base alle impostazioni studio.

# REGOLE
- Se ci sono reference images, integrali con "from Image 1", etc.
- Restituisci SOLO il JSON.`
            : `# ROLE
You are the Supreme Art Director of Generentolo. You have an infallible eye for natural beauty and high-end photographic harmony.

# AESTHETIC VISION (CRITICAL)
- **NO over-processing**: Avoid extreme contrast, artificial sharpening, or that "fake AI" look.
- **YES Natural**: Focus on "soft diffused light", "organic textures", "natural skin tones", "dreamy bokeh".
- **Visual Analysis**: Carefully analyze all provided images (Image 1, Image 2, etc.) to capture subjects, colors, and styles. If DNA is present, respect it rigorously.
- **Studio Integration**: MANDATORILY RESPECT the provided Studio settings (Camera, Lights, Kit). If a Kit is selected, it must be the core of the composition.

# SELECTED STUDIO CONTEXT
${studioContext || "No specific settings."}

# CHARACTER DNA
${characterDna ? `CHARACTER DNA REFERENCE: ${characterDna}. The subject must have these traits.` : "No DNA reference."}

# OBJECTIVE (JSON Output)
1. **enhancedPrompt**: Hyper-detailed description (80-120 words) in ENGLISH. Use sensory and technical language. Integrate Studio and Kit context seamlessly, not as a list.
2. **artDirectorPlan**: Creative commentary in ENGLISH (max 2 sentences) describing the atmosphere and light you've chosen based on studio settings.

# RULES
- Use "from Image 1", etc. if references are present.
- Return ONLY the JSON.`;

        const result = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: {
                parts: [
                    ...visionParts,
                    { text: `Enhance this prompt incorporating the Studio settings and making it a photographic masterpiece: "${currentPrompt}"` }
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

import { getAiClient, fileToGenerativePart } from './geminiService';

/**
 * Maps rotation degrees to technical photographic Azimuth descriptions (0-360) for fallback/metadata
 */
export function getRotationDescription(degrees: number): string {
    const normalized = ((degrees % 360) + 360) % 360;
    if (normalized >= 337.5 || normalized < 22.5) return "Frontal View (0°)";
    if (normalized >= 22.5 && normalized < 67.5) return "Front-Right Three-Quarter (45°)";
    if (normalized >= 67.5 && normalized < 112.5) return "Right Profile Side View (90°)";
    if (normalized >= 112.5 && normalized < 157.5) return "Rear-Right Three-Quarter (135°)";
    if (normalized >= 157.5 && normalized < 202.5) return "Direct Back View / Rear View (180°)";
    if (normalized >= 202.5 && normalized < 247.5) return "Rear-Left Three-Quarter (225°)";
    if (normalized >= 247.5 && normalized < 292.5) return "Left Profile Side View (270°)";
    if (normalized >= 292.5 && normalized < 337.5) return "Front-Left Three-Quarter (315°)";
    return `${normalized}° Orbit`;
}

/**
 * Maps tilt degrees to technical Polar Angle descriptions
 */
export function getTiltDescription(degrees: number): string {
    if (degrees > 45) return "High-Angle Bird's Eye View (looking down steep)";
    if (degrees > 15) return "Slightly Elevated / High-Angle Shot";
    if (degrees > -15) return "Eye-Level / Neutral Horizon";
    if (degrees > -45) return "Low-Angle Hero Shot (looking up)";
    return "Extreme Low-Angle / Worm's Eye View";
}

/**
 * COGNITIVE ANGLE SYNTHESIS v2.8
 * Uses Nano Banana Pro 3.0 to REASON about the image and describe the new view.
 */
export async function generateCognitiveAnglePrompt(
    referenceImage: File,
    originalPrompt: string,
    rotation: number,
    tilt: number,
    zoom: number,
    userApiKey?: string | null,
    language: 'en' | 'it' = 'en'
): Promise<string> {
    try {
        const ai = getAiClient(userApiKey);
        const imagePart = await fileToGenerativePart(referenceImage);

        const rotDesc = getRotationDescription(rotation);
        const tiltDesc = getTiltDescription(tilt);
        const zoomLevel = zoom > 5 ? "Close-up/Macro Details" : zoom < -5 ? "Wide Angle Context" : "Standard Portrait Framing";

        // Build localized system instruction based on language
        const systemInstruction = language === 'it'
            ? `Sei un esperto Artista 3D e Direttore della Fotografia che usa un rivoluzionario motore "Neural View Synthesis".
Il tuo obiettivo è scrivere un prompt generativo che descriva ESATTAMENTE come apparirebbe il soggetto nell'immagine di riferimento se la camera si spostasse in una nuova posizione.

REGOLE CRITICHE:
1. PRESERVA IDENTITÀ: Il soggetto (viso, vestiti, corporatura) deve essere identico al riferimento.
2. RUOTA L'OCCHIO MENTALE: Immagina di camminare attorno al soggetto fino all'angolo specificato. Quali nuovi dettagli diventano visibili? Cosa viene occluso?
3. ILLUMINAZIONE COERENTE: Descrivi come la luce cade sul soggetto da questa nuova angolazione.
4. Se la vista è POSTERIORE o di PROFILO, descrivi i capelli/retro dell'outfit logicamente basandoti sulla vista frontale.

COORDINATE CAMERA OBIETTIVO:
- Azimut/Rotazione: ${rotDesc}
- Elevazione/Inclinazione: ${tiltDesc}
- Zoom/Inquadratura: ${zoomLevel}
`
            : `You are an expert 3D Artist and Director of Photography using a revolutionary "Neural View Synthesis" engine.
Your goal is to write a generative prompt that describes EXACTLY how the subject in the reference image would look if the camera moved to a new position.

CRITICAL RULES:
1. PRESERVE IDENTITY: The subject (face, clothes, body type) must be identical to the reference.
2. ROTATE THE MIND'S EYE: Imagine walking around the subject to the specified angle. What new details become visible? What is occluded?
3. CONSISTENT LIGHTING: Describe how the light falls on the subject from this new angle.
4. If the view is BACK or PROFILE, describe the hair/back of outfit logically based on the front view.

TARGET CAMERA COORDINATES:
- Azimuth/Rotation: ${rotDesc}
- Elevation/Tilt: ${tiltDesc}
- Zoom/Framing: ${zoomLevel}
`;

        const userMessage = language === 'it'
            ? `Analizza questa immagine di riferimento.
Descrizione Originale del Soggetto: "${originalPrompt}"

COMPITO: Scrivi un prompt altamente dettagliato e vivido per generare questo ESATTO soggetto dalle nuove COORDINATE CAMERA OBIETTIVO.
Descrivi l'angolo del viso, il lato visibile del corpo, e i cambiamenti di illuminazione.
Se generi una vista laterale/posteriore, descrivi esplicitamente i dettagli di capelli e outfit visti da quel lato, inferiti dalla vista frontale.

Restituisci SOLO la stringa del prompt, senza intestazioni markdown.`
            : `Analyze this reference image.
Original Subject Description: "${originalPrompt}"

TASK: Write a highly detailed, vivid prompt to generate this EXACT subject from the new TARGET CAMERA COORDINATES.
Describe facial angle, visible side of the body, and lighting changes.
If generating a side/back view, explicitely describe the side/back hair and outfit details inferred from the front.

Return ONLY the prompt string, no markdown headers.`;

        const result = await ai.models.generateContent({
            model: 'gemini-3-pro-preview', // USING PRO MODEL FOR REASONING
            contents: {
                parts: [imagePart, { text: userMessage }]
            },
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.7 // A bit of creativity for the "hallucination" of unseen angles
            }
        });

        const generatedPrompt = result.text?.trim();

        if (!generatedPrompt) throw new Error(language === 'it' ? "Risposta vuota dal Cognitive Angle Engine" : "Empty response from Cognitive Angle Engine");

        return generatedPrompt;

    } catch (error) {
        console.warn("Cognitive Angle Generation failed, falling back to algorithmic prompt", error);
        // Fallback to the old algorithmic method if AI fails
        return generateAnglePromptFallback(originalPrompt, rotation, tilt, zoom);
    }
}


/**
 * Legacy Algorithmic Fallback (Original Logic)
 */
export function generateAnglePromptFallback(
    originalPrompt: string,
    rotation: number,
    tilt: number,
    zoom: number
): string {
    const rotationDesc = getRotationDescription(rotation);
    const tiltDesc = getTiltDescription(tilt);
    const zoomDesc = zoom > 0 ? "Telephoto Lens Compression" : "Wide Angle Distortion";

    return `Framing: ${rotationDesc}, ${tiltDesc}, ${zoomDesc}.
Subject: ${originalPrompt}.
Requirement: Maintain exact character identity and lighting while strictly adhering to the requested camera angle. Synthesize a photorealistic view from this perspective.`;
}

/**
 * Best angles for comprehensive 360° coverage (Metadata only)
 */
export const BEST_ANGLES = [
    { rotation: 0, tilt: 0, name: "Front View" },
    { rotation: 45, tilt: 0, name: "Front-Right 45°" },
    { rotation: 90, tilt: 0, name: "Right Side 90°" },
    { rotation: 135, tilt: 0, name: "Back-Right 135°" },
    { rotation: 180, tilt: 0, name: "Back View 180°" },
    { rotation: 225, tilt: 0, name: "Back-Left 225°" },
    { rotation: 270, tilt: 0, name: "Left Side 270°" },
    { rotation: 315, tilt: 0, name: "Front-Left 315°" },
    { rotation: 0, tilt: 30, name: "Top-Front" },
    { rotation: 0, tilt: -30, name: "Bottom-Front" },
    { rotation: 90, tilt: 30, name: "Top-Right" },
    { rotation: 270, tilt: 30, name: "Top-Left" },
];

/**
 * Generate prompts for all 12 best angles covering comprehensive 360° views.
 * Used for batch generation of multiple camera perspectives.
 */
export function generateBestAnglesPrompts(originalPrompt: string): { prompt: string; angleName: string }[] {
    return BEST_ANGLES.map(angle => {
        const rotationDesc = getRotationDescription(angle.rotation);
        const tiltDesc = getTiltDescription(angle.tilt);

        const prompt = `Framing: ${rotationDesc}, ${tiltDesc}, Standard Portrait Framing.
Subject: ${originalPrompt}.
Requirement: Maintain exact character identity and lighting while strictly adhering to the requested camera angle. Synthesize a photorealistic view from this perspective.`;

        return {
            prompt,
            angleName: angle.name
        };
    });
}



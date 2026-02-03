import { getAiClient, fileToGenerativePart } from './geminiService';

/**
 * GENERENTOLO ANGLES v3.0 - Multi-Angle View Synthesis
 * 
 * Inspired by fal.ai's Qwen Multiple-Angles-LoRA approach:
 * - Uses standardized camera terminology (8 azimuths × 4 elevations × 3 distances = 96 poses)
 * - Concise, structured prompt format: [AZIMUTH] [ELEVATION] [DISTANCE]
 * - No verbose descriptions - just precise camera coordinates
 */

// ============================================================================
// STANDARDIZED CAMERA VOCABULARY (Based on fal.ai LoRA)
// ============================================================================

/**
 * 8 Azimuth positions (horizontal rotation around subject)
 * Maps degrees to standardized terminology
 */
const AZIMUTH_TERMS: { range: [number, number]; term: string; degrees: number }[] = [
    { range: [337.5, 360], term: "front view", degrees: 0 },
    { range: [0, 22.5], term: "front view", degrees: 0 },
    { range: [22.5, 67.5], term: "front-right quarter view", degrees: 45 },
    { range: [67.5, 112.5], term: "right side view", degrees: 90 },
    { range: [112.5, 157.5], term: "back-right quarter view", degrees: 135 },
    { range: [157.5, 202.5], term: "back view", degrees: 180 },
    { range: [202.5, 247.5], term: "back-left quarter view", degrees: 225 },
    { range: [247.5, 292.5], term: "left side view", degrees: 270 },
    { range: [292.5, 337.5], term: "front-left quarter view", degrees: 315 },
];

/**
 * 4 Elevation positions (vertical camera angle)
 * Maps degrees to standardized terminology
 */
const ELEVATION_TERMS: { range: [number, number]; term: string }[] = [
    { range: [-90, -15], term: "low-angle shot" },      // Looking up at subject
    { range: [-15, 15], term: "eye-level shot" },       // Neutral
    { range: [15, 45], term: "elevated shot" },         // Slightly above
    { range: [45, 90], term: "high-angle shot" },       // Looking down
];

/**
 * 3 Distance positions (camera distance from subject)
 * Maps zoom value to standardized terminology
 */
const DISTANCE_TERMS: { range: [number, number]; term: string }[] = [
    { range: [3, 100], term: "close-up" },              // Zoom in
    { range: [-3, 3], term: "medium shot" },            // Standard
    { range: [-100, -3], term: "wide shot" },           // Zoom out
];

// ============================================================================
// CORE FUNCTIONS
// ============================================================================

/**
 * Converts rotation degrees to standardized azimuth term
 */
export function getAzimuthTerm(degrees: number): string {
    const normalized = ((degrees % 360) + 360) % 360;
    for (const item of AZIMUTH_TERMS) {
        if (normalized >= item.range[0] && normalized < item.range[1]) {
            return item.term;
        }
    }
    return "front view";
}

/**
 * Converts tilt degrees to standardized elevation term
 */
export function getElevationTerm(degrees: number): string {
    for (const item of ELEVATION_TERMS) {
        if (degrees >= item.range[0] && degrees < item.range[1]) {
            return item.term;
        }
    }
    return "eye-level shot";
}

/**
 * Converts zoom value to standardized distance term
 */
export function getDistanceTerm(zoom: number): string {
    for (const item of DISTANCE_TERMS) {
        if (zoom >= item.range[0] && zoom <= item.range[1]) {
            return item.term;
        }
    }
    return "medium shot";
}

/**
 * Generates the simple, standardized angle prompt
 * Format: "[AZIMUTH] [ELEVATION] [DISTANCE]"
 * Example: "front-right quarter view eye-level shot medium shot"
 */
export function generateSimpleAnglePrompt(
    rotation: number,
    tilt: number,
    zoom: number
): string {
    const azimuth = getAzimuthTerm(rotation);
    const elevation = getElevationTerm(tilt);
    const distance = getDistanceTerm(zoom);

    return `${azimuth} ${elevation} ${distance}`;
}

/**
 * COGNITIVE ANGLE SYNTHESIS v3.0
 * Uses Gemini Pro to analyze the reference and generate a view-aware prompt.
 * Now uses standardized camera terminology for better results.
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

        // Get standardized camera terms
        const azimuth = getAzimuthTerm(rotation);
        const elevation = getElevationTerm(tilt);
        const distance = getDistanceTerm(zoom);
        const cameraPosition = `${azimuth} ${elevation} ${distance}`;

        // Determine if this is a back/side view (requires more imagination)
        const isBackView = rotation >= 135 && rotation <= 225;
        const isSideView = (rotation >= 67.5 && rotation < 135) || (rotation >= 225 && rotation < 292.5);

        const systemInstruction = language === 'it'
            ? `Sei un esperto di Neural View Synthesis. Devi descrivere come apparirebbe il soggetto dell'immagine di riferimento dalla nuova posizione camera.

POSIZIONE CAMERA TARGET: ${cameraPosition}

REGOLE:
1. Mantieni IDENTITÀ ESATTA del soggetto (viso, vestiti, corporatura)
2. Descrivi cosa è VISIBILE da questa angolazione
3. ${isBackView ? 'Per la vista posteriore: descrivi logicamente capelli/retro vestiti basandoti sulla vista frontale' : ''}
4. ${isSideView ? 'Per la vista laterale: descrivi il profilo e i dettagli laterali' : ''}
5. Usa terminologia fotografica concisa
6. NON aggiungere elementi non presenti nell\'originale`
            : `You are a Neural View Synthesis expert. Describe how the subject in the reference image would appear from the new camera position.

TARGET CAMERA POSITION: ${cameraPosition}

RULES:
1. Maintain EXACT IDENTITY of subject (face, clothes, body type)
2. Describe what is VISIBLE from this angle
3. ${isBackView ? 'For back view: logically describe hair/back of clothes based on front view' : ''}
4. ${isSideView ? 'For side view: describe profile and lateral details' : ''}
5. Use concise photographic terminology
6. Do NOT add elements not present in the original`;

        const userMessage = language === 'it'
            ? `Analizza l'immagine di riferimento.
Descrizione originale: "${originalPrompt}"

Genera un prompt CONCISO per rigenerare questo soggetto dalla posizione camera: ${cameraPosition}

Formato output: Una singola frase che descrive la vista. Inizia con la posizione camera, poi descrivi il soggetto.`
            : `Analyze the reference image.
Original description: "${originalPrompt}"

Generate a CONCISE prompt to regenerate this subject from camera position: ${cameraPosition}

Output format: A single sentence describing the view. Start with camera position, then describe the subject.`;

        const result = await ai.models.generateContent({
            model: 'gemini-3-flash-preview', // Using Flash for speed, Pro not needed here
            contents: {
                parts: [imagePart, { text: userMessage }]
            },
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.5 // Lower temperature for more consistent results
            }
        });

        const generatedPrompt = result.text?.trim();

        if (!generatedPrompt) {
            throw new Error("Empty response");
        }

        // Ensure the camera position is at the start of the prompt
        if (!generatedPrompt.toLowerCase().includes(azimuth.split(' ')[0])) {
            return `${cameraPosition}, ${generatedPrompt}`;
        }

        return generatedPrompt;

    } catch (error) {
        console.warn("Cognitive Angle Generation failed, using simple prompt", error);
        return generateSimpleAnglePromptWithSubject(originalPrompt, rotation, tilt, zoom);
    }
}

/**
 * Fallback: Simple angle prompt WITH subject description
 * Used when cognitive generation fails or for batch processing
 */
export function generateSimpleAnglePromptWithSubject(
    originalPrompt: string,
    rotation: number,
    tilt: number,
    zoom: number
): string {
    const cameraPosition = generateSimpleAnglePrompt(rotation, tilt, zoom);

    return `${cameraPosition}. Subject: ${originalPrompt}. Maintain exact identity and appearance from reference.`;
}

// ============================================================================
// LEGACY COMPATIBILITY (Keep for existing code)
// ============================================================================

/**
 * @deprecated Use getAzimuthTerm instead
 */
export function getRotationDescription(degrees: number): string {
    return getAzimuthTerm(degrees);
}

/**
 * @deprecated Use getElevationTerm instead  
 */
export function getTiltDescription(degrees: number): string {
    return getElevationTerm(degrees);
}

/**
 * @deprecated Use generateSimpleAnglePromptWithSubject instead
 */
export function generateAnglePromptFallback(
    originalPrompt: string,
    rotation: number,
    tilt: number,
    zoom: number
): string {
    return generateSimpleAnglePromptWithSubject(originalPrompt, rotation, tilt, zoom);
}

// ============================================================================
// BEST ANGLES PRESETS (Updated with standardized terms)
// ============================================================================

/**
 * 12 key angles for comprehensive 360° coverage
 * Now using standardized terminology
 */
export const BEST_ANGLES: { rotation: number; tilt: number; name: string; prompt: string }[] = [
    { rotation: 0, tilt: 0, name: "Front", prompt: "front view eye-level shot medium shot" },
    { rotation: 45, tilt: 0, name: "Front-Right 45°", prompt: "front-right quarter view eye-level shot medium shot" },
    { rotation: 90, tilt: 0, name: "Right Side", prompt: "right side view eye-level shot medium shot" },
    { rotation: 135, tilt: 0, name: "Back-Right 135°", prompt: "back-right quarter view eye-level shot medium shot" },
    { rotation: 180, tilt: 0, name: "Back", prompt: "back view eye-level shot medium shot" },
    { rotation: 225, tilt: 0, name: "Back-Left 225°", prompt: "back-left quarter view eye-level shot medium shot" },
    { rotation: 270, tilt: 0, name: "Left Side", prompt: "left side view eye-level shot medium shot" },
    { rotation: 315, tilt: 0, name: "Front-Left 315°", prompt: "front-left quarter view eye-level shot medium shot" },
    { rotation: 0, tilt: 30, name: "Top-Front", prompt: "front view elevated shot medium shot" },
    { rotation: 0, tilt: -30, name: "Low-Front", prompt: "front view low-angle shot medium shot" },
    { rotation: 90, tilt: 30, name: "Top-Right", prompt: "right side view elevated shot medium shot" },
    { rotation: 270, tilt: 30, name: "Top-Left", prompt: "left side view elevated shot medium shot" },
];

/**
 * Generate prompts for all 12 best angles
 */
export function generateBestAnglesPrompts(originalPrompt: string): { prompt: string; angleName: string }[] {
    return BEST_ANGLES.map(angle => ({
        prompt: `${angle.prompt}. Subject: ${originalPrompt}. Maintain exact identity from reference.`,
        angleName: angle.name
    }));
}

// ============================================================================
// FULL 96 ANGLE GRID (For advanced use)
// ============================================================================

/**
 * All 96 camera positions (8 azimuths × 4 elevations × 3 distances)
 * Matching the fal.ai LoRA's complete coverage
 */
export function generateAll96Prompts(): string[] {
    const azimuths = [
        "front view", "front-right quarter view", "right side view",
        "back-right quarter view", "back view", "back-left quarter view",
        "left side view", "front-left quarter view"
    ];
    const elevations = ["low-angle shot", "eye-level shot", "elevated shot", "high-angle shot"];
    const distances = ["close-up", "medium shot", "wide shot"];

    const prompts: string[] = [];

    for (const distance of distances) {
        for (const elevation of elevations) {
            for (const azimuth of azimuths) {
                prompts.push(`${azimuth} ${elevation} ${distance}`);
            }
        }
    }

    return prompts;
}

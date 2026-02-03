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
 * COGNITIVE ANGLE SYNTHESIS v4.0
 * 
 * Basato su ricerche specifiche per Gemini 3 Pro:
 * - NON usare "rotate" o "transform" - Gemini copia l'immagine
 * - DESCRIVERE cosa si VEDE dalla nuova angolazione
 * - Usare terminologia cinematografica precisa
 * - Trattare l'immagine di riferimento come GUIDA per l'identità, non come base da modificare
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

        // Get standardized camera terms with cinematic vocabulary
        const cameraAngle = getCinematicCameraDescription(rotation, tilt, zoom);

        // Determine what parts of the subject would be visible
        const visibilityDescription = getVisibilityDescription(rotation, tilt);

        // STEP 1: Ask Gemini to analyze the subject and describe it from the new angle
        const analysisPrompt = language === 'it'
            ? `Analizza questa immagine e identifica il soggetto principale.

Poi, descrivi ESATTAMENTE come apparirebbe questo stesso soggetto se fotografato da questa angolazione:
📷 CAMERA: ${cameraAngle}

La tua risposta deve essere un PROMPT per generare una NUOVA immagine che mostra:
${visibilityDescription}

FORMATO OUTPUT (solo questo, niente altro):
"[Tipo di shot] of [descrizione dettagliata del soggetto come appare da questa angolazione], [dettagli tecnici della camera]"

Esempio: "Three-quarter back view of a young woman with long brown hair, showing the back of her blue dress and her profile looking slightly over her shoulder, eye-level shot, soft studio lighting"`
            : `Analyze this image and identify the main subject.

Then, describe EXACTLY how this same subject would appear if photographed from this angle:
📷 CAMERA: ${cameraAngle}

Your response must be a PROMPT to generate a NEW image showing:
${visibilityDescription}

OUTPUT FORMAT (only this, nothing else):
"[Shot type] of [detailed description of subject as seen from this angle], [camera technical details]"

Example: "Three-quarter back view of a young woman with long brown hair, showing the back of her blue dress and her profile looking slightly over her shoulder, eye-level shot, soft studio lighting"`;

        const result = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: {
                parts: [imagePart, { text: analysisPrompt }]
            },
            config: {
                temperature: 0.4
            }
        });

        let generatedPrompt = result.text?.trim() || '';

        if (!generatedPrompt) {
            throw new Error("Empty response from analysis");
        }

        // Clean up quotes if present
        generatedPrompt = generatedPrompt.replace(/^["']|["']$/g, '').trim();

        // CRITICAL: Add explicit instruction to NOT copy the reference but use it for identity only
        const finalPrompt = `Generate a NEW photograph: ${generatedPrompt}. Use the reference image ONLY to understand the subject's identity (face, body, clothes). Create an entirely new view from the specified camera position.`;

        return finalPrompt;

    } catch (error) {
        console.warn("Cognitive Angle Generation failed, using enhanced fallback", error);
        return generateEnhancedFallbackPrompt(originalPrompt, rotation, tilt, zoom);
    }
}

/**
 * Generate cinematic camera description
 */
function getCinematicCameraDescription(rotation: number, tilt: number, zoom: number): string {
    // Azimuth -> View direction
    const azimuthDescriptions: Record<string, string> = {
        'front': 'front view, facing the camera directly',
        'front-right': 'three-quarter view from the front-right',
        'right': 'profile view from the right side',
        'back-right': 'three-quarter back view from the right',
        'back': 'back view, showing from behind',
        'back-left': 'three-quarter back view from the left',
        'left': 'profile view from the left side',
        'front-left': 'three-quarter view from the front-left'
    };

    const azimuthKey = getAzimuthTerm(rotation).split(' ')[0];
    const azimuth = azimuthDescriptions[azimuthKey] || azimuthDescriptions['front'];

    // Elevation -> Camera height
    let elevation = 'eye-level shot';
    if (tilt >= 45) elevation = 'high-angle shot looking down';
    else if (tilt >= 20) elevation = 'slightly elevated angle';
    else if (tilt <= -15) elevation = 'low-angle shot looking up';
    else if (tilt <= -5) elevation = 'slightly low angle';

    // Distance -> Shot type
    let distance = 'medium shot';
    if (zoom >= 7) distance = 'extreme close-up';
    else if (zoom >= 4) distance = 'close-up shot';
    else if (zoom <= 1) distance = 'full body shot';

    return `${azimuth}, ${elevation}, ${distance}`;
}

/**
 * Describe what would be visible from this angle
 */
function getVisibilityDescription(rotation: number, tilt: number): string {
    const parts: string[] = [];

    // Back view descriptions
    if (rotation >= 135 && rotation <= 225) {
        parts.push('- The BACK of the subject (hair from behind, back of clothing)');
        parts.push('- Possibly a slight profile if the head is turned');
        parts.push('- Any background elements that would be in front of them');
    }
    // Side view descriptions
    else if ((rotation >= 67.5 && rotation < 135) || (rotation >= 225 && rotation < 292.5)) {
        parts.push('- The PROFILE of the subject (side of face, ear visible)');
        parts.push('- One arm/leg more prominent than the other');
        parts.push('- Side details of clothing and accessories');
    }
    // Front/front-quarter view
    else {
        parts.push('- The FRONT of the subject (face clearly visible)');
        if (rotation > 20 && rotation < 67.5) {
            parts.push('- Slightly angled, showing more of the right side');
        } else if (rotation > 292.5 && rotation < 340) {
            parts.push('- Slightly angled, showing more of the left side');
        }
    }

    // Tilt descriptions
    if (tilt >= 30) {
        parts.push('- Top of head/shoulders more visible (camera looking down)');
    } else if (tilt <= -10) {
        parts.push('- Chin/underside more visible (camera looking up)');
    }

    return parts.join('\n');
}

/**
 * Enhanced fallback prompt when cognitive generation fails
 */
function generateEnhancedFallbackPrompt(
    originalPrompt: string,
    rotation: number,
    tilt: number,
    zoom: number
): string {
    const cameraAngle = getCinematicCameraDescription(rotation, tilt, zoom);

    return `Generate a NEW photograph showing: ${originalPrompt}. Camera position: ${cameraAngle}. Use the reference image ONLY to understand the subject's appearance, then create an entirely new view from the specified angle.`;
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

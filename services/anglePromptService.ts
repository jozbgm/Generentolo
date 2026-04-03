import { getAiClient, fileToGenerativePart } from './geminiService';

/**
 * GENERENTOLO ANGLES v4.0 - Camera Position Prompt Engine
 *
 * Rebuilt on research-backed prompt structures for Gemini image generation:
 * - Combines natural language descriptors + degree numbers (both together = more precise)
 * - Uses cinematographic vocabulary the model reliably recognizes
 * - 5-layer prompt structure: subject → viewpoint → camera mechanics → consistency → environment
 * - Cognitive step extracts subject/environment details to strengthen consistency constraints
 */

// ============================================================================
// RESEARCH-BACKED CAMERA VOCABULARY
// ============================================================================

/**
 * Azimuth: horizontal camera orbit around the subject.
 * Each position uses natural language + degree reference — both together
 * outperform either alone (confirmed in Gemini prompting guides).
 */
const AZIMUTH_MAP: { range: [number, number]; term: string; natural: string }[] = [
    { range: [337.5, 360], term: "front-facing, straight-on",                                    natural: "front view" },
    { range: [0,     22.5], term: "front-facing, straight-on",                                    natural: "front view" },
    { range: [22.5,  67.5], term: "three-quarter angle to the right (45° from front)",            natural: "front-right quarter view" },
    { range: [67.5, 112.5], term: "side profile, camera to the subject's right (90° from front)", natural: "right side view" },
    { range: [112.5,157.5], term: "three-quarter rear angle, camera behind-right (135° from front)", natural: "back-right quarter view" },
    { range: [157.5,202.5], term: "rear view, camera directly behind the subject (180° from front)", natural: "back view" },
    { range: [202.5,247.5], term: "three-quarter rear angle, camera behind-left (225° from front)", natural: "back-left quarter view" },
    { range: [247.5,292.5], term: "side profile, camera to the subject's left (270° from front)",  natural: "left side view" },
    { range: [292.5,337.5], term: "three-quarter angle to the left (315° from front)",             natural: "front-left quarter view" },
];

/**
 * Elevation: vertical camera tilt.
 * Worm's-eye, low-angle, eye-level, high-angle, bird's-eye are the terms
 * Gemini responds to most reliably (Google Developers Blog, 2025).
 */
const ELEVATION_MAP: { range: [number, number]; term: string; natural: string }[] = [
    { range: [-90, -20], term: "low-angle shot, camera below eye level looking steeply upward", natural: "low angle" },
    { range: [-20,  10], term: "eye-level shot",                                                natural: "eye level" },
    { range: [10,   35], term: "high-angle shot, camera elevated looking slightly downward",    natural: "elevated angle" },
    { range: [35,   90], term: "bird's-eye view, camera elevated steeply looking down",         natural: "high angle" },
];

/**
 * Distance / framing.
 * Standard cinematographic framing terms.
 */
const DISTANCE_MAP: { range: [number, number]; term: string; lens: string }[] = [
    { range: [7, 100], term: "extreme close-up",    lens: "135mm telephoto lens" },
    { range: [4,    7], term: "close-up shot",       lens: "85mm portrait lens" },
    { range: [1,    4], term: "medium close-up",     lens: "85mm portrait lens" },
    { range: [-1,   1], term: "medium shot",         lens: "50mm standard lens" },
    { range: [-100,-1], term: "wide shot, full body", lens: "35mm lens" },
];

// ============================================================================
// VOCABULARY LOOKUP FUNCTIONS
// ============================================================================

export function getAzimuthTerm(degrees: number): string {
    const n = ((degrees % 360) + 360) % 360;
    for (const item of AZIMUTH_MAP) {
        if (n >= item.range[0] && n < item.range[1]) return item.term;
    }
    return "front-facing, straight-on";
}

export function getAzimuthNatural(degrees: number): string {
    const n = ((degrees % 360) + 360) % 360;
    for (const item of AZIMUTH_MAP) {
        if (n >= item.range[0] && n < item.range[1]) return item.natural;
    }
    return "front view";
}

export function getElevationTerm(degrees: number): string {
    for (const item of ELEVATION_MAP) {
        if (degrees >= item.range[0] && degrees < item.range[1]) return item.term;
    }
    return "eye-level shot";
}

export function getDistanceTerm(zoom: number): { term: string; lens: string } {
    for (const item of DISTANCE_MAP) {
        if (zoom >= item.range[0] && zoom <= item.range[1]) return { term: item.term, lens: item.lens };
    }
    return { term: "medium shot", lens: "50mm standard lens" };
}

// ============================================================================
// CAMERA DESCRIPTION BUILDER
// ============================================================================

/**
 * Builds the full camera position description from UI values.
 * Combines natural language + degree numbers as research shows this
 * improves angle precision in Gemini generation.
 */
export function buildCameraDescription(rotation: number, tilt: number, zoom: number): string {
    const azimuth = getAzimuthTerm(rotation);
    const elevation = getElevationTerm(tilt);
    const { term: distance, lens } = getDistanceTerm(zoom);
    return `${azimuth}, ${elevation}, ${distance}, ${lens}`;
}

// ============================================================================
// SIMPLE ANGLE PROMPT (fallback / batch use)
// ============================================================================

export function generateSimpleAnglePrompt(rotation: number, tilt: number, zoom: number): string {
    return buildCameraDescription(rotation, tilt, zoom);
}

export function generateSimpleAnglePromptWithSubject(
    originalPrompt: string,
    rotation: number,
    tilt: number,
    zoom: number
): string {
    const camera = buildCameraDescription(rotation, tilt, zoom);
    return `${camera}. Subject: ${originalPrompt}. Maintain exact identity and appearance from reference.`;
}

// ============================================================================
// COGNITIVE ANGLE SYNTHESIS
// ============================================================================

/**
 * Two-step process:
 * 1. Ask Gemini 2.5-flash to extract a detailed subject + environment description
 *    from the reference image (makes consistency constraints more specific).
 * 2. Build the final generation prompt using the 5-layer research structure:
 *    [camera position] + [subject description] + [environment] + [consistency] + [output spec]
 *
 * Prompt structure based on:
 * - Google Developers Blog "How to prompt Gemini image generation" (2025)
 * - Chase Jarvis comparative testing (Gemini vs Qwen for angle changes)
 * - Atlabs AI "Consistent AI Characters & Cinematic Camera Angles" guide
 */
export async function generateCognitiveAnglePrompt(
    referenceImage: File,
    originalPrompt: string,
    rotation: number,
    tilt: number,
    zoom: number,
    userApiKey?: string | null,
    language: 'en' | 'it' = 'en',
    signal?: AbortSignal
): Promise<string> {
    try {
        const ai = getAiClient(userApiKey);
        const imagePart = await fileToGenerativePart(referenceImage);

        const cameraDescription = buildCameraDescription(rotation, tilt, zoom);

        // Step 1: Extract subject + environment details from the reference image.
        // A specific subject description makes the consistency constraint much stronger
        // than a generic "maintain appearance from reference" instruction.
        const analysisPrompt = `Analyze this image and describe:

SUBJECT: Who or what is the main subject? Describe their exact appearance — clothing (colors, style, specific details), hair, physical features, any accessories or distinctive elements.
ENVIRONMENT: What is the setting, background, and lighting? (e.g. "studio white background, soft diffused light", "outdoor urban street, golden hour sunlight from the left")

Output ONLY in this format, always in English:
SUBJECT: [detailed appearance description]
ENVIRONMENT: [setting and lighting description]`;

        const config: any = { temperature: 0.3 };
        if (signal) config.abortSignal = signal;

        const analysisResult = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, { text: analysisPrompt }] },
            config
        });

        const analysisText = analysisResult.text?.trim() || '';

        // Parse subject and environment from the analysis
        const subjectMatch = analysisText.match(/SUBJECT:\s*(.+?)(?=\nENVIRONMENT:|$)/s);
        const envMatch = analysisText.match(/ENVIRONMENT:\s*(.+?)$/s);

        const subjectDesc = subjectMatch?.[1]?.trim() || originalPrompt || 'the subject in the reference image';
        const envDesc = envMatch?.[1]?.trim() || 'same environment and lighting as the reference image';

        // Step 2: Build the generation prompt using the 5-layer structure.
        // Research shows this structure outperforms a single descriptive sentence:
        // [camera] → [subject] → [environment] → [consistency] → [output spec]
        const finalPrompt = [
            `Using the uploaded reference image, generate a photorealistic image of the same subject from a new camera position.`,
            ``,
            `CAMERA POSITION: ${cameraDescription}`,
            ``,
            `SUBJECT: ${subjectDesc}`,
            `ENVIRONMENT: ${envDesc}`,
            ``,
            `Critical requirements:`,
            `- Preserve ALL visual characteristics of the subject exactly as in the reference: clothing colors, textures, hair, body proportions, and identifying features`,
            `- Maintain the same environment and lighting conditions`,
            `- Do not modify any clothing, colors, or features — only change the camera position`,
            `- Output a single photorealistic image from the specified camera angle`,
        ].join('\n');

        return finalPrompt;

    } catch (error) {
        console.warn("Cognitive angle generation failed, using direct fallback", error);
        return generateDirectFallbackPrompt(originalPrompt, rotation, tilt, zoom);
    }
}

/**
 * Direct fallback using the 5-layer structure without the cognitive analysis step.
 * Uses generic subject/environment constraints since we don't have the analysis.
 */
function generateDirectFallbackPrompt(
    originalPrompt: string,
    rotation: number,
    tilt: number,
    zoom: number
): string {
    const cameraDescription = buildCameraDescription(rotation, tilt, zoom);

    return [
        `Using the uploaded reference image, generate a photorealistic image of the same subject from a new camera position.`,
        ``,
        `CAMERA POSITION: ${cameraDescription}`,
        ``,
        `SUBJECT: ${originalPrompt || 'the subject shown in the reference image'}`,
        ``,
        `Critical requirements:`,
        `- Preserve ALL visual characteristics of the subject exactly as shown in the reference: clothing, colors, textures, hair, proportions, and features`,
        `- Maintain the same environment and lighting conditions as the reference`,
        `- Do not modify clothing, colors, or features — only change the camera viewpoint`,
        `- Output a single photorealistic image from the specified camera angle`,
    ].join('\n');
}

// ============================================================================
// BEST ANGLES PRESETS
// ============================================================================

export const BEST_ANGLES: { rotation: number; tilt: number; name: string }[] = [
    { rotation: 0,   tilt: 0,  name: "Front" },
    { rotation: 45,  tilt: 0,  name: "Front-Right 45°" },
    { rotation: 90,  tilt: 0,  name: "Right Side" },
    { rotation: 135, tilt: 0,  name: "Back-Right 135°" },
    { rotation: 180, tilt: 0,  name: "Back" },
    { rotation: 225, tilt: 0,  name: "Back-Left 225°" },
    { rotation: 270, tilt: 0,  name: "Left Side" },
    { rotation: 315, tilt: 0,  name: "Front-Left 315°" },
    { rotation: 0,   tilt: 30, name: "Top-Front" },
    { rotation: 0,   tilt: -20,name: "Low-Front" },
    { rotation: 90,  tilt: 30, name: "Top-Right" },
    { rotation: 270, tilt: 30, name: "Top-Left" },
];

export function generateBestAnglesPrompts(originalPrompt: string): { prompt: string; angleName: string }[] {
    return BEST_ANGLES.map(angle => ({
        prompt: generateSimpleAnglePromptWithSubject(originalPrompt, angle.rotation, angle.tilt, 0),
        angleName: angle.name
    }));
}

// ============================================================================
// LEGACY COMPATIBILITY
// ============================================================================

/** @deprecated Use getAzimuthNatural instead */
export function getRotationDescription(degrees: number): string {
    return getAzimuthNatural(degrees);
}

/** @deprecated Use getElevationTerm instead */
export function getTiltDescription(degrees: number): string {
    return getElevationTerm(degrees);
}

/** @deprecated Use generateSimpleAnglePromptWithSubject instead */
export function generateAnglePromptFallback(
    originalPrompt: string,
    rotation: number,
    tilt: number,
    zoom: number
): string {
    return generateSimpleAnglePromptWithSubject(originalPrompt, rotation, tilt, zoom);
}

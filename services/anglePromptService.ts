import { AngleGenerationParams } from '../components/GenerAngles';

/**
 * Maps rotation degrees to precise photographic descriptions
 */
export function getRotationDescription(degrees: number): string {
    const normalized = ((degrees % 360) + 360) % 360;

    if (normalized >= 0 && normalized < 22.5) {
        return "front view, subject facing camera directly, 0-degree angle";
    }
    if (normalized >= 22.5 && normalized < 67.5) {
        return "three-quarter front-right view, subject rotated 45 degrees to the right";
    }
    if (normalized >= 67.5 && normalized < 112.5) {
        return "right side profile view, subject at 90-degree angle showing right side";
    }
    if (normalized >= 112.5 && normalized < 157.5) {
        return "three-quarter back-right view, subject rotated 135 degrees, partial back visible";
    }
    if (normalized >= 157.5 && normalized < 202.5) {
        return "back view, subject facing away from camera, 180-degree angle";
    }
    if (normalized >= 202.5 && normalized < 247.5) {
        return "three-quarter back-left view, subject rotated 225 degrees, left back visible";
    }
    if (normalized >= 247.5 && normalized < 292.5) {
        return "left side profile view, subject at 270-degree angle showing left side";
    }
    if (normalized >= 292.5 && normalized < 337.5) {
        return "three-quarter front-left view, subject rotated 315 degrees to the left";
    }
    return "front view, subject facing camera directly, 0-degree angle";
}

/**
 * Maps tilt degrees to camera angle descriptions
 */
export function getTiltDescription(degrees: number): string {
    if (degrees > 60) {
        return "extreme high-angle shot, bird's-eye view looking straight down from above";
    }
    if (degrees > 30) {
        return "high-angle shot, camera elevated 45 degrees above subject looking down";
    }
    if (degrees > 10) {
        return "slightly elevated camera angle, looking down gently at the subject";
    }
    if (degrees > -10) {
        return "eye-level shot, camera at horizontal position aligned with subject";
    }
    if (degrees > -30) {
        return "slightly low-angle shot, camera positioned below eye level looking up";
    }
    if (degrees > -60) {
        return "low-angle shot, camera 45 degrees below subject looking upward";
    }
    return "extreme low-angle shot, worm's-eye view looking straight up from ground level";
}

/**
 * Maps zoom value to distance description
 */
export function getZoomDescription(zoom: number): string {
    if (zoom > 30) {
        return "much closer to subject, zoomed in significantly, tight framing";
    }
    if (zoom > 10) {
        return "closer to subject, slightly zoomed in, tighter composition";
    }
    if (zoom > -10) {
        return "same distance from subject, standard framing";
    }
    if (zoom > -30) {
        return "farther from subject, slightly zoomed out, wider composition";
    }
    return "much farther from subject, zoomed out significantly, wide framing";
}

/**
 * Generates a comprehensive prompt for angle-based image generation
 */
export function generateAnglePrompt(
    originalPrompt: string,
    rotation: number,
    tilt: number,
    zoom: number
): string {
    const rotationDesc = getRotationDescription(rotation);
    const tiltDesc = getTiltDescription(tilt);
    const zoomDesc = getZoomDescription(zoom);

    return `Photorealistic image of the same subject from a different camera angle.

CAMERA POSITION:
- Horizontal rotation: ${rotationDesc}
- Vertical angle: ${tiltDesc}
- Camera distance: ${zoomDesc}

CRITICAL REQUIREMENTS:
- Maintain EXACT same subject identity, appearance, clothing, features, and all visual characteristics
- Keep SAME lighting conditions, environment, and background
- Preserve photographic style, quality, and color grading
- Ensure 3D spatial consistency - the subject should appear naturally rotated to match the specified angle
- The camera viewpoint should change, NOT the subject's pose or position
- Maintain all details, textures, and materials from the original

REFERENCE SCENE: ${originalPrompt}

Generate a single, cohesive image that shows the same scene from the new camera perspective described above.`;
}

/**
 * Best angles for comprehensive 360° coverage
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
 * Generates prompts for all best angles
 */
export function generateBestAnglesPrompts(originalPrompt: string): Array<{
    prompt: string;
    angleName: string;
    rotation: number;
    tilt: number;
}> {
    return BEST_ANGLES.map(angle => ({
        prompt: generateAnglePrompt(originalPrompt, angle.rotation, angle.tilt, 0),
        angleName: angle.name,
        rotation: angle.rotation,
        tilt: angle.tilt
    }));
}

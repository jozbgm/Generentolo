/**
 * Maps rotation degrees to technical photographic Azimuth descriptions (0-360)
 */
export function getRotationDescription(degrees: number): string {
    const normalized = ((degrees % 360) + 360) % 360;

    // Using technical azimuth terminology for Gemini 3 Pro reasoning
    if (normalized >= 0 && normalized < 22.5) {
        return "Camera Azimuth: 0° (Frontal Canonical View)";
    }
    if (normalized >= 22.5 && normalized < 67.5) {
        return "Camera Azimuth: 45° (Three-Quarter Right Orbit)";
    }
    if (normalized >= 67.5 && normalized < 112.5) {
        return "Camera Azimuth: 90° (Right Profile Orbit)";
    }
    if (normalized >= 112.5 && normalized < 157.5) {
        return "Camera Azimuth: 135° (Rear Three-Quarter Right Orbit)";
    }
    if (normalized >= 157.5 && normalized < 202.5) {
        return "Camera Azimuth: 180° (Posterior/Back View Orbit)";
    }
    if (normalized >= 202.5 && normalized < 247.5) {
        return "Camera Azimuth: 225° (Rear Three-Quarter Left Orbit)";
    }
    if (normalized >= 247.5 && normalized < 292.5) {
        return "Camera Azimuth: 270° (Left Profile Orbit)";
    }
    if (normalized >= 292.5 && normalized < 337.5) {
        return "Camera Azimuth: 315° (Three-Quarter Left Orbit)";
    }
    return `Camera Azimuth: ${normalized}° Orbit`;
}

/**
 * Maps tilt degrees to technical Polar Angle descriptions
 */
export function getTiltDescription(degrees: number): string {
    if (degrees > 60) {
        return "Camera Elevation: 75° (Zenith/Bird's-Eye Perspective)";
    }
    if (degrees > 30) {
        return "Camera Elevation: 45° (High-Angle Plunge)";
    }
    if (degrees > 10) {
        return "Camera Elevation: 20° (Slight Elevated Pitch)";
    }
    if (degrees > -10) {
        return "Camera Elevation: 0° (Eye-Level Horizon)";
    }
    if (degrees > -30) {
        return "Camera Elevation: -20° (Slight Under-Pitch View)";
    }
    if (normalizedTilt(degrees) > -60) {
        return "Camera Elevation: -45° (Low-Angle Hero Shot)";
    }
    return "Camera Elevation: -75° (Worm's-Eye Extreme Base Perspective)";
}

function normalizedTilt(d: number) { return d; }

/**
 * Maps zoom value to Dolly/Focal length descriptions
 */
export function getZoomDescription(zoom: number): string {
    if (zoom > 30) {
        return "Lens: Macro/Tele-Compression (Extreme Close-up Dolly-In)";
    }
    if (zoom > 10) {
        return "Lens: Portrait 85mm Prime (Tight Framing/Dolly-In)";
    }
    if (zoom > -10) {
        return "Lens: Standard 50mm Prime (Neutral Canonical Zoom)";
    }
    if (zoom > -30) {
        return "Lens: Wide-Angle 24mm (Environmental Pull-Back)";
    }
    return "Lens: Ultra-Wide 14mm / Fisheye (Extreme Dolly-Out Wide Shot)";
}

/**
 * Generates a comprehensive prompt for angle-based image generation optimized for Nano Banana Pro (Gemini 3 Pro)
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

    return `<context>
Rendering a photorealistic view of the same subject identity and scene captured in the reference image, but executing a structural viewpoint transformation.
</context>

<viewpoint_transformation>
Perform a 3D latent rotation of the entire scene content to match the following camera coordinates:
- ${rotationDesc}
- ${tiltDesc}
- ${zoomDesc}
</viewpoint_transformation>

<core_directives>
1. IDENTITY ANCHORING: Preserve the exact facial geometry, hair texture, clothing patterns, and unique physical identifiers of the subject from the reference image.
2. SPATIAL CONSISTENCY: The subject must appear naturally rotated in 3D space. Calculate correct occultation and perspective changes corresponding to the orbit.
3. COHERENT ENVIRONMENT: Maintain the precise lighting vector, background elements, and depth of field parameters.
4. NATIVE PHOTOREALISM: Output a cinematic, high-fidelity render that avoids artifacting during the viewpoint shift.
</core_directives>

<reference_specification>
Subject/Scene Description: ${originalPrompt || 'The subject in the reference image'}
</reference_specification>

Generate the transformed view based on these high-fidelity camera parameters.`;
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


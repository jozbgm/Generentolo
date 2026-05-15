import { getAiClient, SAFETY_SETTINGS_PERMISSIVE } from './geminiService';

export interface ShotItem {
    id: string;
    index: number;
    timestamp: string;
    name: string;
    visualDescription: string;
    camera: string;
    dominantMood: string;
}

export interface ShotsStoryboardPrompt {
    id: string;
    shotIndex: number;
    title: string;
    shotDescription: string;
    imagePrompt: string;
}

export interface ShotsStoryboardResult {
    videoPrompt: string;
    shots: ShotItem[];
    framePrompts: ShotsStoryboardPrompt[];
}

const toBase64 = (file: File): Promise<string> =>
    new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
    });

const buildPhase1SystemPrompt = (duration: number, shotCount: number, _aspectRatio: string, audioType: string): string =>
    `You are an expert Seedance 2.0 video director and prompt engineer.

# STEP 1 — REFERENCE ANALYSIS (internal, do not output)
Analyze all provided reference images carefully:
- Identify ALL subjects: exact appearance, clothing, hair, distinguishing features
- Detect the environment: location, surfaces, materials, depth, spatial relationships
- Identify lighting conditions: name the setup precisely
  (e.g. "golden-hour sidelight", "overcast diffuse fill", "three-point softbox",
  "Rembrandt at 45° camera-left", "Chiaroscuro single hard source")
- Note color science: cast, saturation, shadow color, highlight behavior, film feel
- Identify the mood and energy level that the references convey

## PRODUCT & PEOPLE FIDELITY RULES (non-negotiable)

PRODUCTS: If any product with visible text, logo, label or packaging is present
in the reference images, reproduce the exact wording in every shot description
where the product appears. Never paraphrase or omit product text.
Specify text position and typographic style on the packaging.

PEOPLE: If one or more people are present, describe each person with full physical
detail in EVERY shot they appear in: skin tone, hair color/length/texture, eye color,
approximate age, body type, complete outfit with fabric description, visible accessories.
These details must be IDENTICAL across all shots — no variation whatsoever.

# STEP 2 — GENERATE SEEDANCE 2.0 VIDEO PROMPT
Generate a complete Seedance 2.0 shot-by-shot video prompt for a ${duration}-second video.
Audio: ${audioType === 'none' ? 'no audio, completely silent' : audioType}.

## SHOT STRUCTURE
Each shot uses this exact block format:

SHOT [N] ([timestamp]) — [Shot Name / Description]
• EFFECT: [Primary effect name] + [secondary effects if stacked]
• [Detailed description of what is happening visually — subjects, action, environment]
• [Camera behaviour: angle, movement, lens behaviour if relevant]
• [Speed/timing: real-time / slow motion percentage / speed ramp details]
• [Transition to next shot: hard cut / dissolve / whip pan / match cut / bloom flash / etc.]

## SHOT WRITING RULES
- Each shot should be 1-4 seconds unless the brief requires a longer hold
- Name effects precisely: "speed ramp (deceleration)" not "speed ramp";
  "digital zoom (scale-in)" not "zoom"; "slow dolly push-in" not "dolly"
- Describe stacked effects explicitly — if 3 things happen simultaneously, list all 3
- Include transition logic: how this shot EXITS and how the next shot ENTERS
- Use language Seedance 2.0 can interpret — describe the visual result, NOT the
  editing technique. Say "the frame scales inward rapidly" not "apply a keyframe"
- Mark the most impactful shot with: "This is the SIGNATURE VISUAL EFFECT"
- Be specific about speed percentages: "approximately 20-25% speed" not "slow motion"
- Describe motion blur, light behaviour, and atmospheric effects where relevant

## DURATION CALIBRATION
Calibrate shot count and density to the target duration:
- 5-10s → 3-5 shots, lean and punchy, 1 signature effect
- 10-20s → 5-8 shots, room for contrast and build, 1-2 signature effects
- 20-30s → 8-12 shots, full three-act arc, 2-3 signature effects
- 30s+ → scale accordingly, maintain density contrast

## CREATIVE PRINCIPLES
1. Contrast drives impact. Alternate HIGH and LOW density moments.
   A slow-motion shot after a speed ramp hits harder than two speed ramps back-to-back.
2. Every video must have at least one SIGNATURE VISUAL EFFECT — call it out explicitly.
3. Transitions are shots. A whip pan, bloom flash, or motion blur smear are
   creative moments, not throwaway connectors.
4. Specificity over vagueness. "The frame rotates clockwise by 15-20°" beats "the camera tilts."
5. Energy must resolve. The final shot must feel intentional, not like the edit ran out of ideas.

## SECTION 2 — MASTER EFFECTS INVENTORY
After the shot timeline, output a numbered list of every distinct effect used, with:
- Effect name
- How many times used (e.g. "used 3x")
- Which shots it appears in
- One-line description of its role
Group by category: speed manipulation / camera movement / digital effects /
transitions / compositing / optical effects.

## SECTION 3 — EFFECTS DENSITY MAP
Break the timeline into 3-6 second segments. Rate each:
- HIGH DENSITY — 4+ effects stacked or rapid-fire
- MEDIUM DENSITY — 2-3 effects
- LOW DENSITY — 1 effect or clean footage
Format: [timestamp range] = [DENSITY LEVEL] ([effects list] — [count] effects in [duration])

## SECTION 4 — ENERGY ARC
Describe the energy structure as a narrative arc (three-act model or adapted):
- Act 1: Opening energy — how the video grabs attention
- Act 2: Development — signature moments, how energy builds or contrasts
- Act 3: Resolution — how the energy lands intentionally

# OUTPUT FORMAT
Return ONLY a valid JSON object. No preamble, no markdown, no code fences.
The full Seedance prompt (all 4 sections) goes into the "videoPrompt" field as a
single string with \\n for line breaks.

{
  "videoPrompt": "<full Seedance 2.0 prompt — all 4 sections — as a single string>",
  "shots": [
    {
      "index": 1,
      "timestamp": "0:00-0:03",
      "name": "<shot name from the timeline>",
      "visualDescription": "<what is visually happening in this specific shot>",
      "camera": "<camera movement and angle for this shot>",
      "dominantMood": "<one precise emotional/atmospheric descriptor>"
    }
  ]
}

The "shots" array must contain exactly ${shotCount} items,
one per shot in the SHOT-BY-SHOT EFFECTS TIMELINE.
The "name", "visualDescription" and "camera" fields must match
exactly what is written in the corresponding shot block above.
Do NOT include any text outside the JSON object.`;

const buildPhase2SystemPrompt = (shot: ShotItem, shotCount: number): string =>
    `You are an expert Director of Photography creating a static image prompt
for Nano Banana 2 (Gemini 3.1 Flash Image Preview).

# REFERENCE ANALYSIS
Analyze the provided reference images for:
- ALL subjects with exact physical appearance (see PEOPLE rules below)
- Environment: surfaces, materials, spatial depth
- Lighting setup by name
- Color science: cast, saturation, shadow/highlight behavior, film stock feel

## PRODUCT & PEOPLE FIDELITY RULES (non-negotiable)

PRODUCTS: Reproduce ALL visible text, logos and labels EXACTLY as they appear
on the product in the reference images. Never approximate or omit.
Include text position and typographic weight in the prompt.

PEOPLE: Describe every person present with maximum physical precision:
skin tone, hair (color, length, texture), eye color, age range, body type,
full outfit with fabric/material names, all visible accessories.
Every detail must match the reference exactly — no creative interpretation.

# SHOT TO VISUALIZE
Shot ${shot.index} of ${shotCount} — ${shot.timestamp}
Name: ${shot.name}
What is happening: ${shot.visualDescription}
Camera: ${shot.camera}
Mood: ${shot.dominantMood}

# TASK
Generate a single static image prompt that captures the KEY FRAME of this shot.
The image must represent the peak visual moment of this specific shot —
NOT an angular variation of the same scene, but THIS specific moment
at THIS specific timestamp with THIS specific action and subject position.

# PROMPT FORMAT
Use this exact structure as a single flowing paragraph:

[Framing and shot type derived from the camera note],
[subject(s) with EXACT physical description and outfit from reference — fabric, color, fit],
[exact action and body position at this moment of the shot],
[product if present: exact name, label text verbatim, packaging details],
[environment with named surface materials],
[foreground/background composition],
[lighting: setup name + quality + direction],
[camera hardware: choose one consistent across all shots —
  Hasselblad H6D / Fujifilm GFX 100S / Sony A7R V / Leica SL3],
[focal length]mm,
[f/stop: f/8-f/11 for wide/establishing, f/2.8-f/4 for medium, f/1.4-f/2.0 for tight/macro],
[color grade or film stock reference],
[atmospheric elements if relevant],
[mood: ${shot.dominantMood}],
photorealistic, high-fidelity surface rendering

# RULES
- POSITIVE FRAMING only — describe what IS in the frame, no negative constructions
- Output ONLY the prompt text — no title, no preamble, no explanation
- This is shot ${shot.index} of a ${shotCount}-shot sequence —
  the scene and subjects must be visually consistent with all other shots`;

const buildRegenPhase2SystemPrompt = (shot: ShotItem, shotCount: number, videoPrompt: string): string =>
    `CONTEXT — You are regenerating one shot from an existing storyboard.
Maintain visual continuity with this Seedance video prompt:
---
${videoPrompt.substring(0, 400)}...
---

${buildPhase2SystemPrompt(shot, shotCount)}`;

export const generateShotsStoryboard = async (
    referenceImages: File[],
    duration: number,
    aspectRatio: string,
    audioType: 'none' | 'music' | 'sfx' | 'voiceover' | 'ambient',
    language: 'en' | 'it',
    userApiKey: string | null
): Promise<ShotsStoryboardResult> => {
    const ai = getAiClient(userApiKey);
    const shotCount = Math.max(3, Math.min(20, Math.round(duration / 3)));

    // Convert all reference images to base64
    const imageDataList = await Promise.all(referenceImages.map(toBase64));
    const inlineParts = imageDataList.map((data, i) => {
        const base64 = data.split(',')[1];
        if (!base64) throw new Error(`Invalid image data at index ${i}`);
        return { inlineData: { data: base64, mimeType: referenceImages[i].type } };
    });

    // FASE 1 — Generate Seedance prompt + shot list
    const phase1System = buildPhase1SystemPrompt(duration, shotCount, aspectRatio, audioType);
    const phase1UserText = language === 'it'
        ? 'Analizza queste immagini di reference e genera il prompt video.'
        : 'Analyze these reference images and generate the video prompt.';

    const phase1Result = await (ai as any).models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: [{
            role: 'user',
            parts: [
                { text: phase1System },
                ...inlineParts,
                { text: phase1UserText }
            ]
        }],
        config: { safetySettings: SAFETY_SETTINGS_PERMISSIVE }
    });

    const phase1Text: string = phase1Result.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    // Strip markdown code fences if model wraps the JSON
    const cleanedPhase1 = phase1Text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

    let parsed: { videoPrompt: string; shots: Omit<ShotItem, 'id'>[] };
    try {
        parsed = JSON.parse(cleanedPhase1);
    } catch {
        throw new Error(`Fase 1: failed to parse JSON response. Raw: ${phase1Text.substring(0, 200)}`);
    }

    const shots: ShotItem[] = parsed.shots.map(s => ({ ...s, id: crypto.randomUUID() }));

    // FASE 2 — Generate static image prompt for each shot sequentially
    const phase2UserText = language === 'it'
        ? 'Analizza queste immagini di reference e genera il prompt video.'
        : 'Analyze these reference images and generate the video prompt.';

    const framePrompts: ShotsStoryboardPrompt[] = [];

    for (const shot of shots) {
        try {
            const phase2System = buildPhase2SystemPrompt(shot, shotCount);

            const phase2Result = await (ai as any).models.generateContent({
                model: 'gemini-3.1-pro-preview',
                contents: [{
                    role: 'user',
                    parts: [
                        { text: phase2System },
                        ...inlineParts,
                        { text: phase2UserText }
                    ]
                }],
                config: { safetySettings: SAFETY_SETTINGS_PERMISSIVE }
            });

            const imagePrompt: string = (phase2Result.candidates?.[0]?.content?.parts?.[0]?.text ?? '').trim();

            framePrompts.push({
                id: crypto.randomUUID(),
                shotIndex: shot.index,
                title: `SHOT ${shot.index} · ${shot.timestamp}`,
                shotDescription: shot.visualDescription,
                imagePrompt: imagePrompt || ''
            });
        } catch (err) {
            console.error(`Fase 2: failed for shot ${shot.index}`, err);
            framePrompts.push({
                id: crypto.randomUUID(),
                shotIndex: shot.index,
                title: `SHOT ${shot.index} · ${shot.timestamp}`,
                shotDescription: shot.visualDescription,
                imagePrompt: ''
            });
        }
    }

    return { videoPrompt: parsed.videoPrompt, shots, framePrompts };
};

export const regenerateSingleShotPrompt = async (
    shot: ShotItem,
    referenceImages: File[],
    videoPrompt: string,
    language: 'en' | 'it',
    userApiKey: string | null
): Promise<ShotsStoryboardPrompt> => {
    const ai = getAiClient(userApiKey);

    const imageDataList = await Promise.all(referenceImages.map(toBase64));
    const inlineParts = imageDataList.map((data, i) => {
        const base64 = data.split(',')[1];
        if (!base64) throw new Error(`Invalid image data at index ${i}`);
        return { inlineData: { data: base64, mimeType: referenceImages[i].type } };
    });

    // We don't know total shotCount here; use shot.index as a proxy lower bound
    const shotCount = shot.index;
    const systemPrompt = buildRegenPhase2SystemPrompt(shot, shotCount, videoPrompt);
    const userText = language === 'it'
        ? 'Analizza queste immagini di reference e genera il prompt video.'
        : 'Analyze these reference images and generate the video prompt.';

    const result = await (ai as any).models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: [{
            role: 'user',
            parts: [
                { text: systemPrompt },
                ...inlineParts,
                { text: userText }
            ]
        }],
        config: { safetySettings: SAFETY_SETTINGS_PERMISSIVE }
    });

    const imagePrompt: string = (result.candidates?.[0]?.content?.parts?.[0]?.text ?? '').trim();

    return {
        id: crypto.randomUUID(),
        shotIndex: shot.index,
        title: `SHOT ${shot.index} · ${shot.timestamp}`,
        shotDescription: shot.visualDescription,
        imagePrompt
    };
};

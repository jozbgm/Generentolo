import { getAiClient, SAFETY_SETTINGS_PERMISSIVE } from './geminiService';

export interface ShotItem {
    id: string;
    index: number;
    timestamp: string;
    name: string;
    visualDescription: string;
    camera: string;
    dominantMood: string;
    referenceIndices: number[];
    isGraphic: boolean;
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
    referenceDescriptions: string[];
}

const toBase64 = (file: File): Promise<string> =>
    new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
    });

const buildReferenceContext = (
    referenceDescriptions: string[],
    referenceIndices: number[]
): string => {
    if (referenceDescriptions.length === 0) return 'No reference descriptions available.';

    const library = referenceDescriptions
        .map((desc, i) => `[REF ${i}] ${desc}`)
        .join('\n\n');

    const active = referenceIndices.length > 0
        ? `Active in this shot: ${referenceIndices.map(i => `REF ${i}`).join(', ')}.
Use ONLY these references for subjects, products and people in this shot.
Do NOT introduce subjects from other references not listed above.`
        : `No reference images active in this shot.
Do NOT introduce any person, product or object from the reference library.
Generate based purely on the shot description.`;

    return `## REFERENCE LIBRARY\n${library}\n\n## ACTIVE REFERENCES FOR THIS SHOT\n${active}`;
};

const buildPhase1SystemPrompt = (
    duration: number,
    _aspectRatio: string,
    audioType: string,
    brief: string,
    referenceCount: number
): string =>
    `You are an expert Seedance 2.0 video director and prompt engineer.

# STEP 1 — REFERENCE ANALYSIS (internal, do not output)
You have ${referenceCount} reference image(s), numbered from 0 to ${referenceCount - 1}
in the order they were provided.

For each reference image, identify and memorize:
- Image index (0-based)
- What/who is depicted: subjects, products, objects, environments
- If a person: skin tone, hair color/length/texture, eye color, age range,
  body type, complete outfit with fabric and material names, all visible accessories
- If a product: exact brand name verbatim, ALL visible text/labels/claims verbatim
  (including capitalization and punctuation), packaging color/material/shape/size
- If an environment/object: what it is and key visual properties
- Lighting conditions, color science, mood and energy

## PRODUCT & PEOPLE FIDELITY (non-negotiable)
PRODUCTS: In every shot where a product appears, reproduce ALL visible text,
brand names, claims and labels EXACTLY as written. Never paraphrase or omit.
PEOPLE: In every shot where a person appears, describe every physical detail
extracted above. Identical across all shots — no variation whatsoever.

# STEP 2 — NARRATIVE BRIEF
${brief
    ? `The user has provided this narrative brief:

"${brief}"

Use this as the PRIMARY guide for distributing content across shots.
Respect all temporal indications. Match subjects/products to reference indices
using the analysis from STEP 1.`
    : `No brief provided. Derive a compelling story arc from the reference images.`
}

# STEP 3 — GENERATE SEEDANCE 2.0 VIDEO PROMPT
Generate a complete Seedance 2.0 shot-by-shot video prompt for a ${duration}-second video.
Audio: ${audioType === 'none' ? 'no audio, completely silent' : audioType}.

## SHOT STRUCTURE
Each shot uses this exact block format:

SHOT [N] ([timestamp]) — [Shot Name / Description]
• EFFECT: [Primary effect name] + [secondary effects if stacked]
• REFERENCES USED: [which reference images appear — e.g. "ref 0 (woman), ref 1 (product)" — or "none (graphic/digital shot)"]
• [Detailed description — at least 4-6 lines — subjects, action, environment, atmosphere]
• [Camera behaviour: angle, movement, lens behaviour]
• [Speed/timing: real-time / slow motion % / speed ramp details]
• [Transition to next shot]

## SHOT WRITING RULES
- Each shot description must be at least 4-6 lines — never truncate for brevity
- Name effects precisely: "speed ramp (deceleration)" not "speed ramp"
- Describe stacked effects explicitly — list all simultaneously happening effects
- Include transition logic: how this shot EXITS and how the next ENTERS
- Mark the most impactful shot: "This is the SIGNATURE VISUAL EFFECT"
- Be specific about speed: "approximately 20-25% speed" not "slow motion"
- Describe motion blur, light behaviour and atmospheric effects where relevant
- Each shot references ONLY subjects visible in it — no contamination from other shots

## SHOT COUNT
Decide autonomamente quanti shot servono basandoti ESCLUSIVAMENTE
sul contenuto narrativo del brief e sulla complessità visiva delle reference.

La durata totale è ${duration} secondi — questo è un vincolo temporale:
la somma di tutti i timestamp deve fare esattamente ${duration} secondi.
Non è una formula per calcolare il numero di shot.

Libertà di calibrazione:
- Uno shot può durare 1 secondo (flash, logo, cut rapido)
- Uno shot può durare 6-8 secondi (slow motion, hero reveal, momento contemplativo)
- Mescola durate diverse per creare ritmo e contrasto
- Se il brief descrive 8 momenti distinti → fai 8 shot
- Se il brief descrive 3 momenti lenti e deliberati → fai 3 shot
- Se non c'è brief → decidi tu quanti momenti servono per raccontare
  la storia in modo efficace con queste reference
Unici limiti assoluti: minimo 2 shot, massimo 20 shot.

## CREATIVE PRINCIPLES
1. Contrast drives impact — alternate HIGH and LOW density moments
2. Every video needs at least one SIGNATURE VISUAL EFFECT — call it out
3. Transitions are shots — whip pan, bloom flash, motion blur smear are creative moments
4. Specificity over vagueness
5. Energy must resolve intentionally

## SECTION 2 — MASTER EFFECTS INVENTORY
Every distinct effect used — name, how many times, which shots, role.
Fully developed — one line per effect is not enough. Each entry must describe
the effect's narrative and emotional purpose in this specific video.
Group by: speed manipulation / camera movement / digital effects /
transitions / compositing / optical effects.

## SECTION 3 — EFFECTS DENSITY MAP
Every 3-6 second segment rated:
- HIGH DENSITY — 4+ effects stacked
- MEDIUM DENSITY — 2-3 effects
- LOW DENSITY — 1 effect or clean footage
Format: [timestamp] = [LEVEL] ([effects] — [count] effects in [duration])
Cover ALL segments — no gaps in the timeline.

## SECTION 4 — ENERGY ARC
- Act 1: Opening energy — how the video grabs attention
- Act 2: Development — signature moments, contrast, build
- Act 3: Resolution — how energy lands intentionally
At least 3-4 lines per act.

# OUTPUT FORMAT
Return ONLY a valid JSON object. No preamble, no markdown, no code fences.

{
  "referenceDescriptions": [
    "<image 0: exhaustive description — verbatim texts, exact physical details>",
    "<image 1: same>",
    "<one entry per reference image provided>"
  ],
  "videoPrompt": "<full Seedance 2.0 prompt — all 4 sections — single string with \\n>",
  "shots": [
    {
      "index": 1,
      "timestamp": "0:00-0:03",
      "name": "<shot name>",
      "visualDescription": "<what is visually happening>",
      "camera": "<camera movement and angle>",
      "dominantMood": "<one precise emotional/atmospheric descriptor>",
      "referenceIndices": [0],
      "isGraphic": false
    }
  ]
}

RULES for "referenceDescriptions":
- One entry per reference image in order
- PRODUCTS: ALL text verbatim, brand name, claims, labels, packaging details
- PEOPLE: skin tone, hair (color/length/texture/style), eye color, age range,
  body type, complete outfit with fabric names, every accessory
- Precise enough to recreate the subject without seeing the image

RULES for "isGraphic":
- true: purely graphic/digital — logo on background, animated text, digital
  transition, motion graphic, 2D element. No real photographed subjects.
  Rule of thumb: could be created entirely in After Effects → true
- false: real people, real products, real environments — needs a camera → false

RULES for "referenceIndices":
- 0-based indices, include ONLY references present in this specific shot
- Graphic shots with no real subjects → []

The "shots" array contains as many items as YOU decide are needed
to tell the story in the brief. Minimum 2, maximum 20.
The sum of all shot durations must equal exactly ${duration} seconds.
Do NOT include any text outside the JSON object.`;

const buildPhase2SystemPrompt = (
    shot: ShotItem,
    shotCount: number,
    referenceDescriptions: string[]
): string => {
    const refContext = buildReferenceContext(referenceDescriptions, shot.referenceIndices);

    return `You are an expert visual prompt engineer for AI image generation.

${refContext}

# SHOT TO VISUALIZE
Shot ${shot.index} of ${shotCount} — ${shot.timestamp}
Name: ${shot.name}
What is happening: ${shot.visualDescription}
Camera note: ${shot.camera}
Mood: ${shot.dominantMood}
Shot type: ${shot.isGraphic
        ? 'GRAPHIC / DIGITAL — no real camera, no real subjects'
        : 'PHOTOGRAPHIC — real subjects, real environment'}

# TASK
Generate a single static image prompt that captures the KEY FRAME of this shot.
This must represent the peak visual moment of THIS specific shot at THIS timestamp.
NOT an angular variation — this precise action, position and content.

${shot.isGraphic ? `# THIS IS A GRAPHIC/DIGITAL SHOT
Describe ONLY:
- Graphic elements: shapes, colors, backgrounds, overlays
- Typography: font weight, size impression, exact text content VERBATIM, color, position
- Color palette and background treatment
- Composition and layout
- Lighting as a graphic property (flat, glowing, shadowed) — NOT photography terms

DO NOT include in this prompt:
- Camera hardware (no Hasselblad, no Sony, no Leica, no Fujifilm — there is no camera)
- Focal length (no mm values)
- Aperture (no f/stop values)
- Photography or cinematography terms
- Any real person or product from the reference library
` : `# THIS IS A PHOTOGRAPHIC SHOT
PEOPLE FIDELITY (non-negotiable): Describe every person using the EXACT physical
details from the reference library above. Skin tone, hair color/length/texture,
eye color, age range, body type, complete outfit with fabric names, every accessory.
Match the reference EXACTLY — no creative reinterpretation.

PRODUCT FIDELITY (non-negotiable): Reproduce ALL text, brand names, claims and
labels VERBATIM as written in the reference library. Exact capitalization and punctuation.

# PROMPT FORMAT — single flowing paragraph:
[Framing from camera note],
[subject(s) with EXACT physical description from reference library — fabric, color, fit],
[exact action and body position at this moment],
[product if present: exact brand name and label text verbatim from reference],
[environment with named surface materials],
[foreground/background composition],
[lighting: setup name + quality + direction],
[camera hardware: Hasselblad H6D / Fujifilm GFX 100S / Sony A7R V / Leica SL3 — consistent across all shots],
[focal length]mm,
[f/stop: f/8-f/11 wide, f/2.8-f/4 medium, f/1.4-f/2.0 tight/macro],
[color grade or film stock],
[atmospheric elements],
[mood: ${shot.dominantMood}],
photorealistic, high-fidelity surface rendering
`}
# UNIVERSAL RULES
- POSITIVE FRAMING only — describe what IS in the frame
- The prompt must be at least 60-80 words — never compress for brevity
- Output ONLY the prompt text — no title, no preamble, no explanation
- Shot ${shot.index} of ${shotCount} — visual consistency with all other shots is mandatory
`;
};

export const generateShotsStoryboard = async (
    referenceImages: File[],
    duration: number,
    aspectRatio: string,
    audioType: 'none' | 'music' | 'sfx' | 'voiceover' | 'ambient',
    brief: string,
    language: 'en' | 'it',
    userApiKey: string | null
): Promise<ShotsStoryboardResult> => {
    const ai = getAiClient(userApiKey);

    const imageDataList = await Promise.all(referenceImages.map(toBase64));
    const inlineParts = imageDataList.map((data, i) => {
        const base64 = data.split(',')[1];
        if (!base64) throw new Error(`Invalid image data at index ${i}`);
        return { inlineData: { data: base64, mimeType: referenceImages[i].type } };
    });

    // FASE 1 — Generate Seedance prompt + shot list + referenceDescriptions
    const phase1System = buildPhase1SystemPrompt(duration, aspectRatio, audioType, brief, referenceImages.length);
    const phase1UserText = language === 'it'
        ? 'Analizza queste immagini di reference e genera il prompt video.'
        : 'Analyze these reference images and generate the video prompt.';

    const phase1Result = await (ai as any).models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: [{
            role: 'user',
            parts: [{ text: phase1System }, ...inlineParts, { text: phase1UserText }]
        }],
        config: { safetySettings: SAFETY_SETTINGS_PERMISSIVE, maxOutputTokens: 8192 }
    });

    const phase1Text: string = phase1Result.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    const cleanedPhase1 = phase1Text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

    let parsed: { videoPrompt: string; shots: any[]; referenceDescriptions?: string[] };
    try {
        parsed = JSON.parse(cleanedPhase1);
    } catch {
        throw new Error(`Fase 1: failed to parse JSON response. Raw: ${phase1Text.substring(0, 200)}`);
    }

    const referenceDescriptions: string[] = parsed.referenceDescriptions ?? [];
    const shots: ShotItem[] = parsed.shots.map((s: any) => ({
        id: crypto.randomUUID(),
        index: s.index,
        timestamp: s.timestamp,
        name: s.name,
        visualDescription: s.visualDescription,
        camera: s.camera,
        dominantMood: s.dominantMood,
        referenceIndices: s.referenceIndices ?? [],
        isGraphic: s.isGraphic ?? false,
    }));
    const actualShotCount = shots.length;

    // FASE 2 — Frame prompt per ogni shot, solo reference pertinenti
    const framePrompts: ShotsStoryboardPrompt[] = [];

    for (const shot of shots) {
        try {
            const phase2SysPrompt = buildPhase2SystemPrompt(shot, actualShotCount, referenceDescriptions);

            const relevantImages = shot.referenceIndices.length > 0
                ? shot.referenceIndices
                    .filter(i => i >= 0 && i < referenceImages.length)
                    .map(i => referenceImages[i])
                : [];

            const parts: any[] = [{ text: phase2SysPrompt }];

            if (relevantImages.length > 0) {
                for (const img of relevantImages) {
                    const imgData = await toBase64(img);
                    const base64 = imgData.split(',')[1];
                    if (base64) parts.push({ inlineData: { data: base64, mimeType: img.type } });
                }
                parts.push({
                    text: language === 'it'
                        ? `Analizza ${relevantImages.length > 1 ? 'queste immagini di reference' : 'questa immagine di reference'} e genera il prompt per lo shot ${shot.index}.`
                        : `Analyze ${relevantImages.length > 1 ? 'these reference images' : 'this reference image'} and generate the prompt for shot ${shot.index}.`
                });
            } else {
                parts.push({
                    text: language === 'it'
                        ? `Non ci sono reference per questo shot. Genera il prompt basandoti solo sulla descrizione dello shot.`
                        : `No reference images for this shot. Generate the prompt based only on the shot description.`
                });
            }

            const phase2Result = await (ai as any).models.generateContent({
                model: 'gemini-3.1-pro-preview',
                contents: [{ role: 'user', parts }],
                config: { safetySettings: SAFETY_SETTINGS_PERMISSIVE, maxOutputTokens: 8192 }
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

    return { videoPrompt: parsed.videoPrompt, shots, framePrompts, referenceDescriptions };
};

export const regenerateSingleShotPrompt = async (
    shot: ShotItem,
    referenceImages: File[],
    videoPrompt: string,
    referenceDescriptions: string[],
    totalShotCount: number,
    language: 'en' | 'it',
    userApiKey: string | null
): Promise<ShotsStoryboardPrompt> => {
    const ai = getAiClient(userApiKey);

    const systemPrompt = `CONTEXT — You are regenerating one shot from an existing storyboard.
Maintain visual continuity with this Seedance video prompt:
---
${videoPrompt.substring(0, 400)}...
---

${buildPhase2SystemPrompt(shot, totalShotCount, referenceDescriptions)}`;

    const relevantImages = shot.referenceIndices.length > 0
        ? shot.referenceIndices
            .filter(i => i >= 0 && i < referenceImages.length)
            .map(i => referenceImages[i])
        : [];

    const parts: any[] = [{ text: systemPrompt }];

    if (relevantImages.length > 0) {
        for (const img of relevantImages) {
            const imgData = await toBase64(img);
            const base64 = imgData.split(',')[1];
            if (base64) parts.push({ inlineData: { data: base64, mimeType: img.type } });
        }
        parts.push({
            text: language === 'it'
                ? `Analizza ${relevantImages.length > 1 ? 'queste immagini di reference' : 'questa immagine di reference'} e rigenera il prompt per lo shot ${shot.index}.`
                : `Analyze ${relevantImages.length > 1 ? 'these reference images' : 'this reference image'} and regenerate the prompt for shot ${shot.index}.`
        });
    } else {
        parts.push({
            text: language === 'it'
                ? `Non ci sono reference per questo shot. Rigenera il prompt basandoti solo sulla descrizione dello shot.`
                : `No reference images for this shot. Regenerate the prompt based only on the shot description.`
        });
    }

    const result = await (ai as any).models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: [{ role: 'user', parts }],
        config: { safetySettings: SAFETY_SETTINGS_PERMISSIVE, maxOutputTokens: 8192 }
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

import { getAiClient, SAFETY_SETTINGS_PERMISSIVE } from './geminiService';

export interface StoryboardPrompt {
    id: string;
    title: string;
    prompt: string;
}

const getShotList = (shotCount: number): string => {
    switch (shotCount) {
        case 3:
            return `Generate exactly 3 shots:
1. Wide Shot (LS) — Complete subject(s) visible in their environment, head to toe
2. Medium Shot (MS) — Waist up, core interaction or action
3. Close-Up (CU) — Face or front of subject, tight emotional framing`;

        case 6:
            return `Generate exactly 6 shots:
1. Extreme Long Shot (ELS) — Subject(s) small within the vast environment
2. Long Shot (LS) — Complete subject(s) head to toe
3. Medium Shot (MS) — Waist up, core interaction
4. Medium Close-Up (MCU) — Chest up, intimate framing
5. Close-Up (CU) — Face/front, emotional framing
6. Low Angle Shot (Worm's Eye) — Camera looking up, imposing/heroic perspective`;

        case 12:
            return `Generate exactly 12 shots in this order:

ROW 1 — ESTABLISHING CONTEXT
1. Extreme Long Shot (ELS) — Subject(s) small within vast environment
2. Long Shot (LS) — Complete subject(s) head to toe
3. Medium Long Shot (MLS/American) — Framed from knees up

ROW 2 — CORE COVERAGE
4. Medium Shot (MS) — Waist up, action/interaction
5. Medium Close-Up (MCU) — Chest up, intimate framing
6. Close-Up (CU) — Face/front, emotional framing

ROW 3 — DETAILS & ANGLES
7. Extreme Close-Up (ECU) — Macro detail: eyes, hands, texture, key prop
8. Low Angle (Worm's Eye) — Looking up, imposing/heroic
9. High Angle (Bird's Eye) — Looking down, vulnerable/omniscient

BONUS SHOTS
10. Dutch Angle — Tilted camera for unease/tension
11. Over-the-Shoulder — Behind subject looking at scene or other character
12. Insert/Detail Shot — Key object or environmental detail that carries meaning`;

        default: // 9 — standard 3x3 contact sheet
            return `Generate exactly 9 shots in this structured 3x3 order:

ROW 1 — ESTABLISHING CONTEXT
1. Extreme Long Shot (ELS) — Subject(s) small within the vast environment
2. Long Shot (LS) — Complete subject(s) visible head to toe
3. Medium Long Shot (MLS/American) — Framed from knees up

ROW 2 — CORE COVERAGE
4. Medium Shot (MS) — Waist up, focus on action/interaction
5. Medium Close-Up (MCU) — Chest up, intimate framing
6. Close-Up (CU) — Face/front, tight emotional framing

ROW 3 — DETAILS & ANGLES
7. Extreme Close-Up (ECU) — Macro detail on key feature (eyes, hands, texture)
8. Low Angle (Worm's Eye) — Camera looking up, imposing/heroic
9. High Angle (Bird's Eye) — Camera looking down, vulnerable/omniscient`;
    }
};

const buildSystemPrompt = (theme: string, shotCount: number): string => `
You are an expert Director of Photography creating a professional Cinematic Contact Sheet.

# STEP 1 — SCENE ANALYSIS (internal, do not output)
Analyze the reference image carefully:
- Identify ALL subjects: exact appearance, clothing, hair, distinguishing features
- Detect spatial relationships between subjects
- Note environment, lighting quality and direction, time of day, atmosphere
- Identify 4-5 visual constants that must remain identical across ALL shots

# STEP 2 — THEME & MOOD
${theme
    ? `Apply this theme/mood to the ENTIRE sequence: "${theme}"
All shots must reflect this theme through: lighting atmosphere, color grade, camera movement style, and emotional subtext.
The theme should be felt even in the widest establishing shot and the tightest close-up.`
    : 'Derive the mood organically from the reference image and maintain it consistently across all shots.'}

# NON-NEGOTIABLE CONTINUITY RULES
1. Same subjects, same clothing/appearance in EVERY shot — no exceptions
2. Same environment — only camera position, framing, and angle change
3. Do NOT introduce new characters, objects, or locations not visible in the reference
4. Single consistent cinematic color grade across the entire sequence
5. Realistic DoF progression: deep (f/8–f/11) in wide shots, progressively shallower (f/1.4–f/2.8) in close-ups and ECUs
6. Content-adaptive: groups stay together in frame, vehicles shown in full, single objects framed completely

# SHOT STRUCTURE
${getShotList(shotCount)}

# PROMPT FORMAT — use this exact structure for every shot:
### [SHOT TYPE NAME]
[Shot type], [camera movement], [subject(s) with exact clothing and appearance], [action/pose], [body language or expression if MS or tighter], [environment details], [foreground/background elements], [lighting: source + quality + direction], [lens]mm, [DoF: f/stop], [color grade or film stock reference], [atmospheric elements if any], cinematic, photorealistic

CAMERA MOVEMENTS to choose from: static, slow dolly in, slow dolly out, slow push-in, tracking shot, pan, tilt, handheld, orbit
EQUIPMENT to reference where appropriate: ARRI Alexa 35, Cooke S4/i lenses, anamorphic lens flare, Kodak Vision3 500T film grain
EMOTIONAL LANGUAGE — be precise: "slow-burn tension", "quiet vulnerability", "understated determination", "electric anticipation", "hollow dread" — never use vague terms like "dramatic" or "emotional"

# OUTPUT RULES
- Output EXACTLY ${shotCount} prompts using ### headers
- NO preamble, NO closing remarks, NO commentary of any kind
- Each prompt must be fully self-contained and ready for image generation
- Title line must be the shot type name only (e.g. "Extreme Long Shot (ELS)")
`;

const buildRegeneratePrompt = (shotTitle: string, theme: string, contextSummary: string): string => `
You are an expert Director of Photography. Regenerate ONE specific shot for an existing Cinematic Contact Sheet.

SHOT TO REGENERATE: ${shotTitle}
${theme ? `SEQUENCE THEME/MOOD: "${theme}"` : ''}

SCENE CONTEXT — maintain strict continuity with these existing shots:
${contextSummary}

Generate EXACTLY ONE new prompt for the "${shotTitle}" shot.
Rules:
- Maintain perfect visual continuity: same subjects, same clothing, same environment, same color grade
- ${theme ? `Apply the theme "${theme}" through lighting, atmosphere, camera movement, and emotional subtext` : 'Match the mood established in the existing shots'}
- DoF must be appropriate for this shot type (deeper for wide shots, shallower for close-ups)
- Use precise emotional language, not generic descriptors

Use this exact format:
### ${shotTitle}
[Shot type], [camera movement], [subject(s) with exact appearance], [action/pose/expression], [environment], [lighting], [lens]mm, [DoF], [color grade], cinematic, photorealistic

Output ONLY the ### title line and the prompt. Nothing else.
`;

export const generateCinematicStoryboard = async (
    referenceImage: File,
    userApiKey: string | null,
    language: 'en' | 'it' = 'en',
    theme: string = '',
    shotCount: number = 9
): Promise<StoryboardPrompt[]> => {
    try {
        const ai = getAiClient(userApiKey);

        const imageData = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(referenceImage);
        });

        const base64Data = imageData.split(',')[1];
        if (!base64Data) throw new Error("Invalid image data: could not extract base64 content.");

        const systemPrompt = buildSystemPrompt(theme, shotCount);
        const userText = language === 'it'
            ? `Analizza questa immagine e crea lo storyboard di ${shotCount} inquadrature cinematografiche.`
            : `Analyze this image and create the ${shotCount}-shot cinematic contact sheet.`;

        const result = await (ai as any).models.generateContent({
            model: "gemini-3-flash-preview",
            contents: [{
                role: "user",
                parts: [
                    { text: systemPrompt },
                    { inlineData: { data: base64Data, mimeType: referenceImage.type } },
                    { text: userText }
                ]
            }],
            config: { safetySettings: SAFETY_SETTINGS_PERMISSIVE }
        });

        const responseText = result.candidates?.[0]?.content?.parts?.[0]?.text || "";
        const prompts = parseStoryboardResponse(responseText, shotCount);

        if (prompts.length === 0) throw new Error("Failed to parse storyboard response.");
        return prompts;
    } catch (error) {
        console.error("Storyboard generation error:", error);
        throw error;
    }
};

export const regenerateSingleShot = async (
    referenceImage: File,
    userApiKey: string | null,
    language: 'en' | 'it' = 'en',
    theme: string,
    shotTitle: string,
    existingPrompts: StoryboardPrompt[]
): Promise<StoryboardPrompt> => {
    try {
        const ai = getAiClient(userApiKey);

        const imageData = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(referenceImage);
        });

        const base64Data = imageData.split(',')[1];
        if (!base64Data) throw new Error("Invalid image data.");

        // Use first 3 existing prompts as scene context (enough for continuity)
        const contextSummary = existingPrompts.slice(0, 3)
            .map(p => `• ${p.title}: ${p.prompt.substring(0, 120)}...`)
            .join('\n');

        const regenPrompt = buildRegeneratePrompt(shotTitle, theme, contextSummary);
        const userText = language === 'it'
            ? `Rigenera solo questo shot: ${shotTitle}`
            : `Regenerate only this shot: ${shotTitle}`;

        const result = await (ai as any).models.generateContent({
            model: "gemini-3-flash-preview",
            contents: [{
                role: "user",
                parts: [
                    { text: regenPrompt },
                    { inlineData: { data: base64Data, mimeType: referenceImage.type } },
                    { text: userText }
                ]
            }],
            config: { safetySettings: SAFETY_SETTINGS_PERMISSIVE }
        });

        const responseText = result.candidates?.[0]?.content?.parts?.[0]?.text || "";
        const parsed = parseStoryboardResponse(responseText, 1);

        if (parsed.length === 0) throw new Error("Failed to parse regenerated shot.");
        return parsed[0];
    } catch (error) {
        console.error("Single shot regeneration error:", error);
        throw error;
    }
};

const parseStoryboardResponse = (text: string, maxShots: number = 9): StoryboardPrompt[] => {
    const prompts: StoryboardPrompt[] = [];
    const blocks = text.split(/###\s+/).filter(b => b.trim().length > 0);

    for (const block of blocks) {
        const lines = block.split('\n');
        const title = lines[0].trim();
        const prompt = lines.slice(1).join('\n').trim();

        // Require both title and a non-trivial prompt
        if (title && prompt && prompt.length > 20) {
            prompts.push({
                id: crypto.randomUUID(),
                title,
                prompt
            });
        }
    }

    return prompts.slice(0, maxShots);
};

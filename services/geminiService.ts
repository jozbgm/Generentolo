import { GoogleGenAI, Type, Modality, HarmCategory, HarmBlockThreshold } from "@google/genai";
import { DynamicTool, ModelType, ResolutionType, TextInImageConfig } from '../types';

const DEFAULT_API_KEY = import.meta.env.VITE_API_KEY;

if (!DEFAULT_API_KEY) {
    console.warn("VITE_API_KEY environment variable not set. Users must provide their own API key.");
}

// v2.1: Minimal safety settings for image generation — BLOCK_NONE on all categories
export const SAFETY_SETTINGS_PERMISSIVE = [
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
];

export const getAiClient = (userApiKey?: string | null) => {
    const apiKey = userApiKey || DEFAULT_API_KEY;
    if (!apiKey) {
        // This case should ideally not be hit if the env key is set.
        throw new Error("No API Key available for Gemini client.");
    }
    return new GoogleGenAI({ apiKey });
};

/**
 * v1.7: Generates a short creative reasoning plan for the image generation.
 * This makes the AI feel more "conscious" and professional.
 */
export const getReasoningPlan = async (
    prompt: string,
    userApiKey?: string | null,
    language: 'en' | 'it' = 'en'
): Promise<string> => {
    try {
        const ai = getAiClient(userApiKey);

        const systemPrompt = language === 'it'
            ? "Sei un Art Director esperto. In base al prompt fornito, descrivi brevemente (max 2 frasi) come intendi impostare l'immagine (luci, composizione, mood). Sii professionale e ispiratore. Non usare introduzioni come 'Ecco il piano'."
            : "You are an expert Art Director. Based on the provided prompt, briefly describe (max 2 sentences) how you plan to set up the image (lighting, composition, mood). Be professional and inspiring. Do not use intros like 'Here is the plan'.";

        const result = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: [{ role: "user", parts: [{ text: systemPrompt + "\n\nPrompt: " + prompt }] }],
            config: { safetySettings: SAFETY_SETTINGS_PERMISSIVE }
        });

        const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
        return text ? text.trim() : "";
    } catch (error) {
        console.error("Reasoning error:", error);
        return ""; // Fallback to empty if reasoning fails
    }
};

const handleError = (error: any, language: 'en' | 'it'): Error => {
    console.error("Gemini Service Error:", error);

    let message = language === 'it' ? 'Si è verificato un errore sconosciuto.' : 'An unknown error occurred.';

    // Check for promptFeedback structure for blocked prompts (when error is an object)
    if (error.promptFeedback?.blockReason === 'SAFETY') {
        message = language === 'it'
            ? 'La richiesta è stata bloccata per motivi di sicurezza. Prova a modificare il prompt.'
            : 'The request was blocked for safety reasons. Please try modifying your prompt.';
    }
    else if (error.promptFeedback?.blockReason === 'OTHER') {
        message = language === 'it'
            ? '⚠️ Richiesta bloccata da Gemini (OTHER).\n\n' +
            '🔧 Possibili cause:\n' +
            '• Prompt troppo lungo o complesso\n' +
            '• Combinazione prompt + immagine problematica\n' +
            '• Contenuto che viola policy generiche\n\n' +
            '✅ Soluzioni:\n' +
            '• Semplifica il prompt (riduci dettagli)\n' +
            '• Rimuovi riferimenti a brand/celebrity\n' +
            '• Prova con un\'altra immagine di riferimento\n' +
            '• Riprova tra qualche minuto'
            : '⚠️ Request blocked by Gemini (OTHER).\n\n' +
            '🔧 Possible causes:\n' +
            '• Prompt too long or complex\n' +
            '• Problematic prompt + image combination\n' +
            '• Content violating general policies\n\n' +
            '✅ Solutions:\n' +
            '• Simplify prompt (reduce details)\n' +
            '• Remove brand/celebrity references\n' +
            '• Try with different reference image\n' +
            '• Retry in a few minutes';
    }
    // Check for response structure from the Gemini API client itself (when error is an Error object with message)
    else if (error.message) {
        // Attempt to parse if it's a JSON string, which is common for API errors
        try {
            const errorObj = JSON.parse(error.message);
            if (errorObj.error?.code === 503) {
                message = language === 'it'
                    ? 'Il modello è attualmente sovraccarico. Riprova tra qualche istante.'
                    : 'The model is currently overloaded. Please try again in a few moments.';
            } else if (errorObj.error?.message) {
                message = errorObj.error.message;
            }
        } catch (e) {
            // Not a JSON string, use the message directly
            message = error.message;
        }
    }

    return new Error(message);
}


/**
 * Helper to resize an image before sending to AI to avoid payload limits
 * and improve processing speed for vision tasks.
 */
export const resizeImage = (file: File, maxWidth: number = 1024, maxHeight: number = 1024): Promise<Blob> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > maxWidth) {
                        height *= maxWidth / width;
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width *= maxHeight / height;
                        height = maxHeight;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, width, height);

                canvas.toBlob((blob) => {
                    if (blob) resolve(blob);
                    else reject(new Error("Canvas toBlob failed"));
                }, file.type, 0.85);
            };
            img.onerror = reject;
            img.src = e.target?.result as string;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

export const fileToGenerativePart = async (file: File | Blob) => {
    const base64EncodedDataPromise = new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
        reader.readAsDataURL(file);
    });
    return {
        inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
    };
};

/**
 * v1.7: Extracts a detailed textual "DNA" description of a character's appearance.
 * This is used for character consistency across different generations.
 */
export const extractCharacterDna = async (
    imageFile: File,
    userApiKey?: string | null,
    language: 'en' | 'it' = 'en'
): Promise<string> => {
    try {
        const ai = getAiClient(userApiKey);

        // v2.0: Resize image to optimize API call
        const resizedBlob = await resizeImage(imageFile, 1024, 1024);
        const imagePart = await fileToGenerativePart(resizedBlob);

        const systemPrompt = language === 'it'
            ? "Analizza questa immagine e descrivi i tratti somatici e l'aspetto fisico del soggetto principale in modo estremamente dettagliato per scopi di 'character consistency'. Descrivi: forma del viso, colore e taglio dei capelli, forma e colore degli occhi, carnagione, segni particolari, espressione tipica e corporatura. Crea una descrizione semantica 'compatta' ma completa che possa essere usata come riferimento per generare lo stesso personaggio in altri contesti. Sii preciso e professionale."
            : "Analyze this image and describe the physical features and appearance of the main subject in extreme detail for 'character consistency' purposes. Describe: face shape, hair color and style, eye shape and color, skin tone, unique marks, typical expression, and body type. Create a 'compact' but complete semantic description that can be used as a reference to generate the same character in other contexts. Be precise and professional.";

        const result = await ai.models.generateContent({
            model: "gemini-3-flash-preview", // v2.0: Restored Gemini 3.0 Flash as per user request
            contents: [{
                role: "user",
                parts: [
                    imagePart,
                    { text: systemPrompt }
                ]
            }],
            config: { safetySettings: SAFETY_SETTINGS_PERMISSIVE }
        });

        const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
        return text ? text.trim() : "";
    } catch (error) {
        console.error("DNA extraction error:", error);
        throw error;
    }
};

/**
 * v2.0: Extracts a UNIFIED DNA description from MULTIPLE images of the same subject.
 * This allows for more complete DNA profiles when the subject is photographed from multiple angles.
 * For example: a product photographed from front, back, and sides, or a person from different angles.
 */
export const extractMultiImageDna = async (
    imageFiles: File[],
    userApiKey?: string | null,
    language: 'en' | 'it' = 'en'
): Promise<{ dna: string; viewDescriptions: string[] }> => {
    try {
        const ai = getAiClient(userApiKey);

        // Convert all images to parts
        const imageParts = await Promise.all(
            imageFiles.map(file => fileToGenerativePart(file))
        );

        const numImages = imageFiles.length;

        const systemPrompt = language === 'it'
            ? `Stai analizzando ${numImages} immagini dello STESSO soggetto da diverse angolazioni/viste.

COMPITO: Crea una descrizione DNA UNIFICATA e COMPLETA che combini le informazioni di TUTTE le viste.

Per ogni immagine, identifica prima che vista rappresenta (frontale, posteriore, laterale sinistra/destra, dall'alto, ecc.).

Poi crea una DESCRIZIONE UNICA E COMPLETA che includa:
1. IDENTIFICAZIONE: Che tipo di soggetto è (persona, prodotto, oggetto, animale, ecc.)
2. CARATTERISTICHE PRINCIPALI: Le caratteristiche visive dominanti visibili da TUTTE le angolazioni
3. DETTAGLI PER VISTA: Dettagli specifici visibili solo da certe angolazioni
4. COLORI E MATERIALI: Palette colori completa e materiali/texture
5. DIMENSIONI E PROPORZIONI: Forma generale e proporzioni

FORMATO OUTPUT (JSON):
{
  "viewDescriptions": ["descrizione vista 1", "descrizione vista 2", ...],
  "unifiedDna": "Descrizione DNA completa e unificata..."
}`
            : `You are analyzing ${numImages} images of the SAME subject from different angles/views.

TASK: Create a UNIFIED and COMPLETE DNA description that combines information from ALL views.

For each image, first identify what view it represents (front, back, left side, right side, top, etc.).

Then create a SINGLE COMPLETE DESCRIPTION that includes:
1. IDENTIFICATION: What type of subject this is (person, product, object, animal, etc.)
2. KEY FEATURES: Dominant visual features visible from ALL angles
3. VIEW-SPECIFIC DETAILS: Details only visible from certain angles
4. COLORS AND MATERIALS: Complete color palette and materials/textures
5. DIMENSIONS AND PROPORTIONS: Overall shape and proportions

OUTPUT FORMAT (JSON):
{
  "viewDescriptions": ["view 1 description", "view 2 description", ...],
  "unifiedDna": "Complete unified DNA description..."
}`;

        const result = await ai.models.generateContent({
            model: "gemini-3-flash-preview", // v2.0: Restored Gemini 3.0 Flash as per user request
            contents: [{
                role: "user",
                parts: [
                    ...imageParts,
                    { text: systemPrompt }
                ]
            }],
            config: { safetySettings: SAFETY_SETTINGS_PERMISSIVE }
        });

        const text = result.candidates?.[0]?.content?.parts?.[0]?.text || "";

        // Try to parse JSON response
        try {
            // Extract JSON from potential markdown code blocks
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                return {
                    dna: parsed.unifiedDna || text,
                    viewDescriptions: parsed.viewDescriptions || []
                };
            }
        } catch (parseError) {
            console.warn("Could not parse JSON response, using raw text as DNA", parseError);
        }

        // Fallback: use raw text as DNA
        return {
            dna: text.trim(),
            viewDescriptions: imageFiles.map((_, i) => `View ${i + 1}`)
        };

    } catch (error) {
        console.error("Multi-image DNA extraction error:", error);
        throw error;
    }
};

export const generateSinglePromptFromImage = async (imageFiles: File[], styleFile: File | null, structureFile: File | null, userApiKey?: string | null, language: 'en' | 'it' = 'en'): Promise<string> => {
    try {
        if (imageFiles.length === 0 && !styleFile && !structureFile) return '';
        const ai = getAiClient(userApiKey);

        const imageParts = [];
        for (const file of imageFiles) {
            imageParts.push(await fileToGenerativePart(file));
        }
        if (styleFile) {
            imageParts.push(await fileToGenerativePart(styleFile));
        }
        if (structureFile) {
            imageParts.push(await fileToGenerativePart(structureFile));
        }

        const stylePromptPart = styleFile
            ? (language === 'it' ? "Applica lo stile visivo (colori, illuminazione, atmosfera) dell'immagine di stile fornita a questo scenario." : "Apply the visual style (colors, lighting, mood) from the provided style image to this scenario.")
            : "";

        const structurePromptPart = structureFile
            ? (language === 'it' ? "L'ultima immagine è una guida strutturale: mantieni la stessa composizione spaziale, layout e geometria nella generazione." : "The last image is a structural guide: maintain the same spatial composition, layout and geometry in the generation.")
            : "";

        const promptText = language === 'it'
            ? `Sei un art director e un esperto di prompt per la generazione di immagini pubblicitarie. Analizza TUTTI i soggetti e gli elementi in TUTTE le immagini di riferimento fornite. Il tuo obiettivo è creare UN UNICO prompt per un'immagine pubblicitaria professionale e creativa che COMBINI in modo intelligente e artistico i soggetti delle diverse immagini. Invece di descrivere semplicemente le immagini, immagina uno scenario di advertising ideale che unisca i soggetti. ${stylePromptPart} ${structurePromptPart} Sii dettagliato e mira a produrre un'immagine di alta qualità. Restituisci solo la stringa del prompt.`
            : `You are an art director and an expert prompt engineer for advertising imagery. Analyze ALL subjects and elements in ALL provided reference images. Your goal is to create A SINGLE professional and creative advertising image prompt that intelligently and artistically COMBINES the subjects from the different images. Instead of just describing the images, imagine an ideal advertising scenario that merges the subjects. ${stylePromptPart} ${structurePromptPart} Be detailed and aim to produce a high-quality image. Return only the prompt string.`;

        const result = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: {
                parts: [
                    ...imageParts,
                    { text: promptText }
                ]
            },
            config: {
                temperature: 0.7,
                safetySettings: SAFETY_SETTINGS_PERMISSIVE
            }
        });

        return result.text?.trim() || "";
    } catch (error) {
        throw handleError(error, language);
    }
};

import { enhancePromptV2, EnhancementResult } from './enhancePromptNew';

export const enhancePrompt = async (currentPrompt: string, imageFiles: File[], styleFile: File | null, structureFile: File | null, userApiKey: string | null | undefined, language: 'en' | 'it', characterDna: string | undefined, fullContext: any): Promise<EnhancementResult> => {
    try {
        // Use new revolutionary v2.7 system "God-Mode Awareness"
        return await enhancePromptV2(currentPrompt, imageFiles, styleFile, structureFile, userApiKey, language, characterDna, fullContext.studioConfig, fullContext.classicPresets, fullContext.technical);
    } catch (error) {
        console.error('❌ Enhancement failed, returning original:', error);
        return {
            enhancedPrompt: currentPrompt,
            artDirectorPlan: "",
            method: 'fallback'
        };
    }
}

export const generateDynamicToolsFromImage = async (imageFiles: File[], styleFile: File | null, structureFile: File | null, userApiKey?: string | null, language: 'en' | 'it' = 'en'): Promise<DynamicTool[]> => {
    try {
        if (imageFiles.length === 0 && !styleFile && !structureFile) return [];
        const ai = getAiClient(userApiKey);

        const imageParts = [];
        for (const file of imageFiles) {
            imageParts.push(await fileToGenerativePart(file));
        }
        if (styleFile) {
            imageParts.push(await fileToGenerativePart(styleFile));
        }
        if (structureFile) {
            imageParts.push(await fileToGenerativePart(structureFile));
        }

        const promptText = language === 'it'
            ? `Analizza in dettaglio i soggetti e gli stili di TUTTE le immagini fornite. Identifica tutti gli elementi chiave (persone, prodotti, scene, ecc.). In base alla tua analisi COMPLESSIVA, genera un elenco di fino a 6 strumenti creativi pertinenti per un grafico professionista, con etichette e opzioni in italiano.

REGOLA FONDAMENTALE: Se identifichi più tipi di soggetti distinti tra le immagini (es. una persona E un prodotto), DEVI fornire strumenti pertinenti per CIASCUN tipo di soggetto. Non scegliere l'uno o l'altro; combinali. Ad esempio, se vedi una modella che tiene una bottiglia, dovresti restituire strumenti per la persona (come 'hairstyle') E strumenti per il prodotto (come 'lighting_style'). L'obiettivo è dare all'utente il controllo su tutti gli elementi principali.

- Se il soggetto è una **persona**:
  - **Strumenti**: \`hairstyle\` (stile di capelli), \`outfit_style\` (stile di abbigliamento), \`photo_mood\` (atmosfera della foto).
  - **Dettagli**: Le opzioni per \`hairstyle\` dovrebbero corrispondere al genere apparente e al contesto della persona. \`outfit_style\` dovrebbe offrire generi di moda (es. 'Streetwear', 'Business Casual', 'Vintage anni '70'). \`photo_mood\` dovrebbe essere evocativo (es. 'Grana da pellicola nostalgica', 'Neon futuristico', 'Editoriale di alta moda', 'Scatto spontaneo e naturale').

- Se il soggetto è un **prodotto**:
  - **Strumenti**: \`camera_angle\` (angolo di ripresa), \`background_setting\` (ambientazione di sfondo), \`lighting_style\` (stile di illuminazione).
  - **Dettagli**: Le opzioni per \`camera_angle\` dovrebbero essere specifiche (es. 'Scatto macro', 'Inquadratura eroica dal basso', 'Flat Lay dall'alto'). \`background_setting\` dovrebbe fornire un contesto (es. 'Su un bancone di marmo', 'Fluttuante in un vuoto minimalista', 'In un laboratorio rustico'). \`lighting_style\` dovrebbe essere descrittivo (es. 'Ombra netta e drammatica', 'Diffusione morbida da studio', 'Luce dorata del tramonto').

- Se il soggetto è una **scena (paesaggio/interno)**:
  - **Strumenti**: \`time_of_day\` (momento della giornata), \`weather\` (meteo), \`artistic_style\` (stile artistico).
  - **Dettagli**: Fornisci opzioni come 'Alba nebbiosa', 'Sole cocente di mezzogiorno', 'Crepuscolo malinconico' per \`time_of_day\`. Per \`weather\`, suggerisci 'Pioggia leggera', 'Nuvole di tempesta drammatiche', 'Inondato di sole'. \`artistic_style\` potrebbe includere 'Pennellate impressioniste', 'Iperrealistico', 'Riflesso lente anamorfica'.

Per tutti gli strumenti, assicurati che l'array \`options\` contenga una vasta gamma di scelte, almeno 15-20 opzioni creative e specifiche ispirate a TUTTE le immagini fornite. Restituisci un array JSON di oggetti, dove ogni oggetto ha le chiavi "name", "label" (in italiano) e "options" (in italiano).`
            : `Analyze the subjects and styles of ALL provided images in detail. Identify all key elements (people, products, scenes, etc.). Based on your COMPREHENSIVE analysis, generate a list of up to 6 relevant creative tools for a professional graphic designer, with labels and options in English.

CRITICAL RULE: If you identify multiple distinct subject types across the images (e.g., a person AND a product), you MUST provide relevant tools for EACH subject type. Do not choose one over the other; combine them. For instance, if you see a model holding a bottle, you should return tools for the person (like 'hairstyle') AND tools for the product (like 'lighting_style'). The goal is to give the user control over all major elements.

- If the subject is a **person**:
  - **Tools**: \`hairstyle\`, \`outfit_style\`, \`photo_mood\`.
  - **Details**: The options for \`hairstyle\` should match the person's apparent gender and context. \`outfit_style\` should offer fashion genres (e.g., 'Streetwear', 'Business Casual', 'Vintage 70s'). \`photo_mood\` should be evocative (e.g., 'Nostalgic Film Grain', 'Futuristic Neon', 'High-Fashion Editorial', 'Candid and Natural').

- If the subject is a **product**:
  - **Tools**: \`camera_angle\`, \`background_setting\`, \`lighting_style\`.
  - **Details**: \`camera_angle\` options should be specific (e.g., 'Macro Shot', 'Low Angle Hero Shot', 'Top-Down Flat Lay'). \`background_setting\` should provide context (e.g., 'On a Marble Countertop', 'Floating in a Minimalist Void', 'In a Rustic Workshop'). \`lighting_style\` should be descriptive (e.g., 'Dramatic Hard Shadow', 'Soft Studio Diffusion', 'Golden Hour Glow').

- If the subject is a **scene (landscape/interior)**:
  - **Tools**: \`time_of_day\`, \`weather\`, \`artistic_style\`.
  - **Details**: Provide options like 'Misty Dawn', 'Blazing Midday Sun', 'Moody Twilight' for \`time_of_day\`. For \`weather\`, suggest 'Gentle Rain', 'Dramatic Storm Clouds', 'Sun-drenched'. \`artistic_style\` could include 'Impressionistic Brushstrokes', 'Hyperrealistic', 'Anamorphic Lens Flare'.

For all tools, ensure the \`options\` array contains a wide variety of choices, at least 15-20 specific and creative options directly inspired by ALL the provided images. The goal is to provide professional-level control. Return a JSON array of objects, where each object has "name", "label" (in English), and "options" (in English) keys.`;

        const result = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: {
                parts: [
                    ...imageParts,
                    { text: promptText }
                ]
            },
            config: {
                responseMimeType: "application/json",
                safetySettings: SAFETY_SETTINGS_PERMISSIVE,
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            name: { type: Type.STRING },
                            label: { type: Type.STRING },
                            options: { type: Type.ARRAY, items: { type: Type.STRING } }
                        },
                        required: ["name", "label", "options"]
                    }
                }
            }
        });
        const responseText = result.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
        const tools = JSON.parse(responseText);
        return Array.isArray(tools) ? tools : [];
    } catch (error) {
        throw handleError(error, language);
    }
};

export const rewritePromptWithOptions = async (currentPrompt: string, toolSelections: string, userApiKey?: string | null, language: 'en' | 'it' = 'en'): Promise<string> => {
    try {
        if (!toolSelections) return currentPrompt;
        const ai = getAiClient(userApiKey);

        const systemInstruction = language === 'it'
            ? `Sei un assistente AI che perfeziona i prompt per un modello di generazione di immagini. Riscrivi il prompt dell'utente per incorporare in modo fluido e creativo le opzioni selezionate. Il prompt finale deve essere un'unica istruzione coerente. Non aggiungere testo di conversazione o spiegazioni. Restituisci solo il testo del prompt riscritto.`
            : `You are an AI assistant that refines prompts for an image generation model. Rewrite the user's prompt to seamlessly and creatively incorporate their selected options. The final prompt should be a single, coherent instruction. Do not add any conversational text or explanations. Return only the rewritten prompt text.`;

        const userMessage = language === 'it'
            ? `Riscrivi questo prompt: "${currentPrompt}" per includere questi elementi: ${toolSelections}.`
            : `Rewrite this prompt: "${currentPrompt}" to include these elements: ${toolSelections}.`;

        const result = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: { parts: [{ text: userMessage }] },
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.2,
                safetySettings: SAFETY_SETTINGS_PERMISSIVE
            }
        });

        const rewrittenPrompt = result.text?.trim() || "";
        // A simple check to ensure we got a reasonable response.
        return rewrittenPrompt.length > 5 ? rewrittenPrompt : `${currentPrompt}, with ${toolSelections}`;
    } catch (error) {
        throw handleError(error, language);
    }
};

export const rewritePromptWithStyleImage = async (currentPrompt: string, styleFile: File, userApiKey?: string | null, language: 'en' | 'it' = 'en'): Promise<string> => {
    try {
        const ai = getAiClient(userApiKey);
        const stylePart = await fileToGenerativePart(styleFile);

        const systemInstruction = language === 'it'
            ? "Sei un direttore artistico esperto. Analizza l'immagine fornita per il suo stile artistico, la palette di colori, l'illuminazione e l'atmosfera generale. Riscrivi il prompt dell'utente per incorporare in modo creativo questi elementi stilistici. Il nuovo prompt deve essere un'istruzione diretta e suggestiva per un'IA di generazione di immagini. Restituisci solo il testo del prompt riscritto."
            : "You are an expert art director. Analyze the provided image for its artistic style, color palette, lighting, and overall mood. Rewrite the user's prompt to creatively incorporate these stylistic elements. The new prompt should be a direct, inspiring instruction for an image generation AI. Return only the rewritten prompt text.";

        const userMessage = language === 'it'
            ? `Prompt utente da riscrivere: "${currentPrompt}"`
            : `User prompt to rewrite: "${currentPrompt}"`;

        const result = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: { parts: [stylePart, { text: userMessage }] },
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.3,
                safetySettings: SAFETY_SETTINGS_PERMISSIVE
            }
        });

        const rewrittenPrompt = result.text?.trim() || "";
        return rewrittenPrompt.length > 5 ? rewrittenPrompt : currentPrompt; // Fallback to original
    } catch (error) {
        throw handleError(error, language);
    }
};

// Helper to check if model supports advanced features (resolution, grounding, etc.)
const isAdvancedModel = (model: string): boolean =>
    model === 'gemini-3-pro-image-preview' || model === 'gemini-3.1-flash-image-preview';

// Helper function to get ULTRA-AGGRESSIVE aspect ratio composition guidance
const getAspectRatioGuidance = (aspectRatio: string, language: 'en' | 'it' = 'en', model?: string): string => {
    // v1.0 UPDATE: Now using native imageConfig.aspectRatio parameter for specific ratios
    // Text guidance is only needed for "Auto" mode OR models without native support (Flash)

    const isPro = model ? isAdvancedModel(model) : false;

    if (aspectRatio === 'Auto') {
        // Auto mode: tell the model to match reference image's aspect ratio
        if (language === 'it') {
            return "Mantieni le stesse proporzioni dell'immagine di riferimento. Riempi tutto il fotogramma senza bande vuote.";
        } else {
            return "Match the aspect ratio of the reference image. Fill the entire frame with no empty borders.";
        }
    }

    // For models without native support (e.g. Flash), add explicit text guidance
    if (!isPro && aspectRatio !== '1:1') {
        if (language === 'it') {
            return `Usa proporzioni ${aspectRatio}. Componi la scena per questo formato, riempiendo tutto il fotogramma senza bordi vuoti.`;
        } else {
            return `Use ${aspectRatio} aspect ratio. Compose the scene for this format, filling the entire frame with no empty borders.`;
        }
    }

    // For Pro (native support), we only add a minimal reminder to fill the frame
    if (language === 'it') {
        return "Riempi tutto il fotogramma senza bordi vuoti.";
    } else {
        return "Fill the entire frame with no empty borders.";
    }
};

// Helper to detect white borders/bands in image
const detectWhiteBorders = (ctx: CanvasRenderingContext2D, width: number, height: number): { top: number; bottom: number; left: number; right: number } => {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    const threshold = 230; // Consider pixels > 230 as "white" (more aggressive)
    const sampleSize = 5; // Check every 5th pixel for better accuracy

    let top = 0, bottom = 0, left = 0, right = 0;

    // Detect top border
    outer: for (let y = 0; y < height / 4; y++) {
        let whiteCount = 0;
        for (let x = 0; x < width; x += sampleSize) {
            const idx = (y * width + x) * 4;
            if (data[idx] > threshold && data[idx + 1] > threshold && data[idx + 2] > threshold) {
                whiteCount++;
            }
        }
        if (whiteCount / (width / sampleSize) < 0.8) break outer;
        top = y;
    }

    // Detect bottom border
    outer: for (let y = height - 1; y > (height * 3) / 4; y--) {
        let whiteCount = 0;
        for (let x = 0; x < width; x += sampleSize) {
            const idx = (y * width + x) * 4;
            if (data[idx] > threshold && data[idx + 1] > threshold && data[idx + 2] > threshold) {
                whiteCount++;
            }
        }
        if (whiteCount / (width / sampleSize) < 0.8) break outer;
        bottom = height - y;
    }

    // Detect left border
    outer: for (let x = 0; x < width / 4; x++) {
        let whiteCount = 0;
        for (let y = 0; y < height; y += sampleSize) {
            const idx = (y * width + x) * 4;
            if (data[idx] > threshold && data[idx + 1] > threshold && data[idx + 2] > threshold) {
                whiteCount++;
            }
        }
        if (whiteCount / (height / sampleSize) < 0.8) break outer;
        left = x;
    }

    // Detect right border
    outer: for (let x = width - 1; x > (width * 3) / 4; x--) {
        let whiteCount = 0;
        for (let y = 0; y < height; y += sampleSize) {
            const idx = (y * width + x) * 4;
            if (data[idx] > threshold && data[idx + 1] > threshold && data[idx + 2] > threshold) {
                whiteCount++;
            }
        }
        if (whiteCount / (height / sampleSize) < 0.8) break outer;
        right = width - x;
    }

    return { top, bottom, left, right };
};

// Improved crop and resize to fill target aspect ratio with maximum quality retention
const aggressiveCropAndResize = (imageDataUrl: string, targetAspectRatio: string, resolution: ResolutionType = '2k'): Promise<string> => {
    return new Promise((resolve, reject) => {
        const [widthRatio, heightRatio] = targetAspectRatio.split(':').map(Number);
        const targetRatio = widthRatio / heightRatio;

        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) return reject(new Error('Could not get canvas context'));

            // Step 1: Draw image to detect borders
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            // Step 2: Detect white borders with improved threshold
            const borders = detectWhiteBorders(ctx, img.width, img.height);

            // Step 3: Calculate content area (excluding detected borders)
            let sourceX = borders.left;
            let sourceY = borders.top;
            let sourceWidth = img.width - borders.left - borders.right;
            let sourceHeight = img.height - borders.top - borders.bottom;

            // Debug logging

            // Only apply border detection if significant borders found (>3% on any side)
            const borderThreshold = 0.03;
            const hasBorders = (
                borders.top / img.height > borderThreshold ||
                borders.bottom / img.height > borderThreshold ||
                borders.left / img.width > borderThreshold ||
                borders.right / img.width > borderThreshold
            );

            if (!hasBorders) {
                // No significant borders - use full image
                sourceX = 0;
                sourceY = 0;
                sourceWidth = img.width;
                sourceHeight = img.height;
            }

            // Step 4: Crop to target aspect ratio from content area
            const contentRatio = sourceWidth / sourceHeight;

            // Only crop if aspect ratio difference is > 1%
            if (Math.abs(contentRatio - targetRatio) > 0.01) {
                if (contentRatio > targetRatio) {
                    // Content is wider than target - crop width (keep height)
                    const newWidth = sourceHeight * targetRatio;
                    sourceX += (sourceWidth - newWidth) / 2; // Center crop
                    sourceWidth = newWidth;
                } else {
                    // Content is taller than target - crop height (keep width)
                    const newHeight = sourceWidth / targetRatio;
                    sourceY += (sourceHeight - newHeight) / 2; // Center crop
                    sourceHeight = newHeight;
                }
            }

            // Step 5: Calculate optimal output dimensions based on requested resolution
            // 1K = 1024px, 2K = 2048px, 4K = 4096px
            const MIN_DIMENSION = 1024; // Minimum size for shorter dimension
            let MAX_DIMENSION = 2048; // Default 2K

            if (resolution === '1k') MAX_DIMENSION = 1024;
            else if (resolution === '4k') MAX_DIMENSION = 4096;

            let outputWidth: number;
            let outputHeight: number;

            if (targetRatio >= 1) {
                // Landscape or square - width is longer/equal
                outputWidth = MAX_DIMENSION;
                outputHeight = Math.round(MAX_DIMENSION / targetRatio);

                // Ensure minimum dimension for height
                if (outputHeight < MIN_DIMENSION) {
                    outputHeight = MIN_DIMENSION;
                    outputWidth = Math.round(MIN_DIMENSION * targetRatio);
                }
            } else {
                // Portrait - height is longer
                outputHeight = MAX_DIMENSION;
                outputWidth = Math.round(MAX_DIMENSION * targetRatio);

                // Ensure minimum dimension for width
                if (outputWidth < MIN_DIMENSION) {
                    outputWidth = MIN_DIMENSION;
                    outputHeight = Math.round(MIN_DIMENSION / targetRatio);
                }
            }

            // Step 6: Resize canvas and draw final image with high-quality filtering
            canvas.width = outputWidth;
            canvas.height = outputHeight;

            // Enable high-quality image smoothing
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';

            // Draw the cropped and resized image
            ctx.drawImage(
                img,
                sourceX, sourceY, sourceWidth, sourceHeight,  // Source rectangle
                0, 0, outputWidth, outputHeight               // Destination rectangle
            );

            // Debug logging for final output

            // Return as high-quality PNG
            resolve(canvas.toDataURL('image/png', 1.0));
        };
        img.onerror = reject;
        img.src = imageDataUrl;
    });
};

// Helper function to enrich user prompt with explicit "Image 1", "Image 2" references
export const enrichPromptWithImageReferences = async (
    userPrompt: string,
    referenceFiles: File[],
    userApiKey: string | null,
    language: 'en' | 'it' = 'en'
): Promise<string> => {
    try {
        // Se c'è solo 1 reference o nessuna, non serve arricchire
        if (referenceFiles.length <= 1) return userPrompt;

        const ai = getAiClient(userApiKey);

        // Analizza le reference images per capire i soggetti
        const imageParts = [];
        for (const file of referenceFiles) {
            imageParts.push(await fileToGenerativePart(file));
        }

        const analysisPrompt = language === 'it'
            ? `Analizza queste ${referenceFiles.length} immagini e identifica il soggetto principale di ciascuna in modo MOLTO CONCISO (max 3-4 parole per immagine).

Rispondi SOLO con un elenco numerato:
1. [soggetto immagine 1]
2. [soggetto immagine 2]
${referenceFiles.length > 2 ? '3. [soggetto immagine 3]\n' : ''}${referenceFiles.length > 3 ? '4. [soggetto immagine 4]\n' : ''}

Esempi di risposte corrette:
1. uomo in piedi
2. logo aziendale

1. donna con vestito
2. paesaggio urbano
3. prodotto cosmetico`
            : `Analyze these ${referenceFiles.length} images and identify the main subject of each one VERY CONCISELY (max 3-4 words per image).

Respond ONLY with a numbered list:
1. [subject of image 1]
2. [subject of image 2]
${referenceFiles.length > 2 ? '3. [subject of image 3]\n' : ''}${referenceFiles.length > 3 ? '4. [subject of image 4]\n' : ''}

Examples of correct responses:
1. man standing
2. company logo

1. woman in dress
2. urban landscape
3. cosmetic product`;

        const analysisResult = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: { parts: [...imageParts, { text: analysisPrompt }] },
            config: { temperature: 0.1, safetySettings: SAFETY_SETTINGS_PERMISSIVE }
        });

        const subjects = analysisResult.text?.trim() || "";

        // Ora arricchisci il prompt utente con riferimenti espliciti
        const enrichmentPrompt = language === 'it'
            ? `Riscrivi questo prompt per un'IA di generazione immagini incorporando ESPLICITAMENTE i riferimenti "Image 1", "Image 2", ecc.

Soggetti identificati nelle immagini:
${subjects}

Prompt utente originale: "${userPrompt}"

REGOLE:
1. Mantieni l'intento originale del prompt
2. Aggiungi "da Image 1", "da Image 2" quando menzioni i soggetti
3. Sii CONCISO - max 2 frasi
4. NON aggiungere dettagli non richiesti
5. Restituisci SOLO il prompt riscritto, senza spiegazioni

Esempio:
Originale: "metti il logo sulla felpa dell'uomo"
Riscritto: "Crea l'uomo da Image 1 che indossa una felpa con il logo da Image 2"`
            : `Rewrite this prompt for an image generation AI by EXPLICITLY incorporating "Image 1", "Image 2", etc. references.

Subjects identified in images:
${subjects}

Original user prompt: "${userPrompt}"

RULES:
1. Maintain the original intent
2. Add "from Image 1", "from Image 2" when mentioning subjects
3. Be CONCISE - max 2 sentences
4. DO NOT add unrequested details
5. Return ONLY the rewritten prompt, no explanations

Example:
Original: "put the logo on the man's hoodie"
Rewritten: "Create the man from Image 1 wearing a hoodie with the logo from Image 2"`;

        const enrichmentResult = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: { parts: [{ text: enrichmentPrompt }] },
            config: { temperature: 0.2, safetySettings: SAFETY_SETTINGS_PERMISSIVE }
        });

        const enrichedPrompt = enrichmentResult.text?.trim() || "";

        // Fallback: se il prompt arricchito è troppo corto o sembra invalido, usa l'originale
        if (enrichedPrompt.length < 10 || !enrichedPrompt.toLowerCase().includes('image')) {
            console.warn('Enrichment failed, using original prompt');
            return userPrompt;
        }

        return enrichedPrompt;

    } catch (error) {
        console.warn('Error enriching prompt, using original:', error);
        return userPrompt; // Fallback to original on error
    }
};

// Helper function to extract style description from style image
export const extractStyleDescription = async (styleFile: File, userApiKey: string | null, language: 'en' | 'it' = 'en'): Promise<string> => {
    try {
        const ai = getAiClient(userApiKey);
        const stylePart = await fileToGenerativePart(styleFile);

        const promptText = language === 'it'
            ? "Analizza questa immagine e descrivi SOLO gli elementi stilistici: palette di colori, tipo di illuminazione, atmosfera/mood, stile fotografico o artistico, texture. NON descrivere i soggetti o gli oggetti presenti, solo lo stile visivo. Sii conciso (max 2-3 frasi)."
            : "Analyze this image and describe ONLY the stylistic elements: color palette, lighting type, mood/atmosphere, photographic or artistic style, textures. DO NOT describe the subjects or objects present, only the visual style. Be concise (max 2-3 sentences).";

        const result = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: { parts: [stylePart, { text: promptText }] },
            config: { temperature: 0.3, safetySettings: SAFETY_SETTINGS_PERMISSIVE }
        });

        return result.text?.trim() || "";
    } catch (error) {
        console.error("Failed to extract style description:", error);
        return "";
    }
};



// ─── Reference Analysis Cache ────────────────────────────────────────────────
// WeakMap caches keyed by File identity — auto-GC'd when files are removed.
const _styleCache = new WeakMap<File, string>();
const _structureCache = new WeakMap<File, string>();
const _poseCache = new WeakMap<File, string>();

const _analyzeFile = async (
    file: File,
    cache: WeakMap<File, string>,
    systemPrompt: string,
    userApiKey: string | null
): Promise<string> => {
    if (cache.has(file)) return cache.get(file)!;
    try {
        const ai = getAiClient(userApiKey);
        const imagePart = await fileToGenerativePart(file);
        const result = await (ai as any).models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: [{ role: 'user', parts: [imagePart, { text: systemPrompt }] }],
            config: { safetySettings: SAFETY_SETTINGS_PERMISSIVE }
        });
        const text = result.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
        if (text) cache.set(file, text);
        return text;
    } catch {
        return '';
    }
};

export const analyzeForStyle = (file: File, userApiKey: string | null): Promise<string> =>
    _analyzeFile(file, _styleCache,
        `Analyze this image and extract its visual style. Describe concisely (2-3 sentences max):
- Color palette: dominant colors, tones, temperature, saturation level
- Lighting: quality (hard/soft/diffused), direction, mood, source (natural/artificial/mixed)
- Technical aesthetic: film stock feel, color grading, grain/texture, contrast
- Artistic style: photographic, cinematic, editorial, commercial, etc.
- Overall mood and atmosphere

Return ONLY the style description, no preamble. Be technical and specific — use terms like "Kodak Portra 400 film grain", "golden hour backlit", "teal-orange color grade", "high-key commercial lighting". This description will be used as an image generation constraint.`,
        userApiKey);

export const analyzeForStructure = (file: File, userApiKey: string | null): Promise<string> =>
    _analyzeFile(file, _structureCache,
        `Analyze the spatial composition of this image. Describe concisely (2-3 sentences max):
- Subject placement: position in frame (left/center/right, top/middle/bottom), framing rule (rule of thirds, centered, etc.)
- Camera angle: eye-level, low angle, high angle, dutch tilt, bird's eye
- Depth layers: foreground, midground, background relationships
- Proportions and negative space usage
- Any dominant compositional lines (leading lines, symmetry, etc.)

Return ONLY the composition description, no preamble. Be spatial and precise — "subject positioned left third, slight low angle, shallow foreground blur, architectural lines leading to subject". This will be used to constrain spatial layout in image generation.`,
        userApiKey);

export const analyzeForForm = (file: File, userApiKey: string | null): Promise<string> =>
    _analyzeFile(file, _poseCache,
        `Analyze the FORM, SILHOUETTE and SPATIAL STRUCTURE of the main subject in this image. This analysis must work for ANY type of subject — a person, an object, a product, a building, a shoe, a vehicle, etc.

Describe precisely:
- Overall silhouette and outline shape
- Main structural axes and proportions (height-to-width ratio, dominant directions)
- Spatial orientation: angle/rotation/perspective of the subject relative to camera
- Key structural features and their positions (e.g. for a person: limb positions; for a shoe: sole angle, toe direction; for a building: facade angle, roofline)
- Weight distribution and balance point
- Any dynamic lines or tension in the form

Return ONLY the form/structure description, no preamble. Be precise enough that this exact shape and structure could be reproduced with a completely different subject — "diagonal stance 30° right, elongated vertical silhouette, upper mass wider than lower, main structural axis tilted 15° from vertical, subject occupies left-center of frame".`,
        userApiKey);

// ─────────────────────────────────────────────────────────────────────────────

export const generateImage = async (
    prompt: string,
    aspectRatio: string,
    referenceFiles: File[],
    styleFile: File | null,
    structureFile: File | null,
    userApiKey: string | null,
    negativePrompt?: string,
    seed?: string,
    language: 'en' | 'it' = 'en',
    preciseReference: boolean = false,
    model: ModelType = 'gemini-2.5-flash-image',
    resolution: ResolutionType = '2k',
    textInImage?: TextInImageConfig,
    abortSignal?: AbortSignal,
    useGrounding?: boolean, // v1.4: Google Search Grounding
    skipPreprocessing?: boolean, // v1.9.2: Speed optimization
    _precomputedStyleDescription?: string, // v2.1: kept for API compat, style now handled as direct image part
    thinkingLevel?: 'minimal' | 'medium' | 'high', // v2.4: configurable thinking budget for NB2/PRO
    videoReferenceFile?: File | null, // v2.4: full video as style reference (NB2 only)
    poseTransfer?: boolean // Pose Lock: replicate exact pose from first reference image
): Promise<string> => {
    try {
        const ai = getAiClient(userApiKey);

        /*
         * SCENARI SUPPORTATI:
         * 1. 0 reference images → generazione text-to-image pura (solo prompt utente)
         * 2. 1 reference image → generazione basata su singola reference
         * 3. 2+ reference images → combining con role-based instructions (client-side, no Flash call)
         * 4. + style image (opzionale) → aggiunta come reference part con istruzione di ruolo nel prompt
         * 5. + structure image (opzionale) → aggiunta come ultima immagine, guidance ControlNet-like
         *
         * Ordine imageParts: [ref1..refN, style (se presente), structure (se presente)]
         * Tutti i ruoli sono descritti nel prompt con linguaggio naturale + indice posizionale.
         */

        const imageParts: any[] = [];

        // v2.4: Video reference (NB2 only) — added first so model sees it before images
        if (videoReferenceFile && model === 'gemini-3.1-flash-image-preview') {
            imageParts.push(await fileToGenerativePart(videoReferenceFile));
        }

        // Process reference images
        for (const file of referenceFiles) {
            imageParts.push(await fileToGenerativePart(file));
        }

        // v2.1: Style image added directly as reference part (no Flash extraction call)
        // Position is known: index = referenceFiles.length (0-based), label = referenceFiles.length + 1 (1-based)
        if (styleFile) {
            imageParts.push(await fileToGenerativePart(styleFile));
        }

        /* 
         * STEP 1 & 2: Parallel Pre-processing (Enrichment + Style Extraction)
         * Optimized for speed: these Flash calls run at the same time.
         * v1.9.2: Skipped if prompt is already SUPER-ENHANCED.
         */
        // Enrichment only — style is now handled as a direct image part (no Flash call)
        const enrichedPromptResult = skipPreprocessing
            ? prompt
            : referenceFiles.length > 1
                ? await enrichPromptWithImageReferences(prompt, referenceFiles, userApiKey, language)
                : prompt;

        const enrichedPrompt = enrichedPromptResult;
        // styleDescriptionResult kept for backward compat but style is now handled via direct image part

        // v1.0: Aspect ratio is now handled natively via imageConfig.aspectRatio
        // For NB2 in pure text-to-image mode (no references, no style, no structure),
        // send the prompt clean — the model understands composition via the native aspectRatio API param.
        const isNB2PureTextToImage = model === 'gemini-3.1-flash-image-preview' &&
            referenceFiles.length === 0 &&
            !styleFile &&
            !structureFile;

        if (isNB2PureTextToImage) {
            // Build minimal clean prompt — no injected instructions
            let fullPrompt = enrichedPrompt;
            if (negativePrompt && negativePrompt.trim() !== '') {
                fullPrompt += ` --no ${negativePrompt.trim()}`;
            }

            const parts: any[] = [{ text: fullPrompt }];
            const budgetMapPure = { minimal: 0, medium: 4096, high: -1 };
            const config: any = {
                responseModalities: [Modality.IMAGE],
                temperature: 0.7,
                thinkingConfig: { thinkingBudget: budgetMapPure[thinkingLevel ?? 'medium'] },
                safetySettings: SAFETY_SETTINGS_PERMISSIVE,
            };

            const imageConfig: any = {};
            if (aspectRatio !== 'Auto') {
                imageConfig.aspectRatio = aspectRatio;
            }
            if (resolution) {
                imageConfig.imageSize = resolution === '0.5k' ? '0.5K' : resolution.toUpperCase();
            }
            if (Object.keys(imageConfig).length > 0) {
                config.imageConfig = imageConfig;
            }
            if (seed && /^\d+$/.test(seed)) {
                config.seed = parseInt(seed, 10);
            }
            if (abortSignal) {
                (config as any).abortSignal = abortSignal;
            }
            (config as any).httpOptions = { timeout: 420000 };

            const MAX_RETRIES = 5;
            let lastError: any = null;

            for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
                let result: any = null;
                try {
                    result = await ai.models.generateContent({
                        model: model,
                        contents: { parts },
                        config: config as any,
                    });
                } catch (error: any) {
                    lastError = error;
                    const errorMessage = error?.message || '';
                    if (error.name === 'AbortError' || errorMessage.includes('abort')) {
                        throw new Error(language === 'it' ? '🛑 Generazione annullata.' : '🛑 Generation cancelled.');
                    }
                    const isRetriable = errorMessage.includes('500') || errorMessage.includes('503') ||
                        errorMessage.includes('429') || errorMessage.includes('timeout') || errorMessage.includes('TIMEOUT');
                    if (isRetriable && attempt < MAX_RETRIES - 1) {
                        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
                        continue;
                    }
                    throw error;
                }

                // API call succeeded — now check for image data in response
                const nbCandidate = result?.candidates?.[0];
                if (nbCandidate?.content?.parts) {
                    for (const part of nbCandidate.content.parts) {
                        if (part.inlineData) {
                            return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                        }
                    }
                }

                // No image data found — log full response for diagnosis then retry
                const finishReason = result?.candidates?.[0]?.finishReason;
                const promptFeedback = result?.promptFeedback;
                const partsCount = result?.candidates?.[0]?.content?.parts?.length ?? 'none';

                // NO_IMAGE: model explicitly refused to generate — fallback immediately to PRO
                if (finishReason === 'NO_IMAGE') {
                    console.warn(`⚠️ NB2: NO_IMAGE on attempt ${attempt + 1} — falling back to PRO model...`);
                    return await generateImage(
                        prompt, aspectRatio, referenceFiles, styleFile, structureFile,
                        userApiKey, negativePrompt, seed, language, preciseReference,
                        'gemini-3-pro-image-preview', resolution, textInImage, abortSignal, useGrounding
                    );
                }

                if (attempt < MAX_RETRIES - 1) {
                    console.warn(`⚠️ NB2: No image (attempt ${attempt + 1}/${MAX_RETRIES}) | finishReason: ${finishReason} | parts: ${partsCount} | promptFeedback: ${JSON.stringify(promptFeedback)}`);
                    await new Promise(resolve => setTimeout(resolve, 800 * Math.pow(2, attempt)));
                    continue;
                }

                // All attempts exhausted — log final state
                const finalFinishReason = result?.candidates?.[0]?.finishReason;
                const finalFeedback = result?.promptFeedback;
                console.error(`❌ NB2: All ${MAX_RETRIES} attempts failed | finishReason: ${finalFinishReason} | promptFeedback:`, finalFeedback);
                throw new Error(language === 'it' ? 'Nessuna immagine generata dopo 5 tentativi. Riprova.' : 'No image generated after 5 attempts. Please try again.');


            }

            throw lastError || new Error('Failed to generate content after retries');
        }

        // --- Standard path (all other models and scenarios with reference images) ---

        // Run reference analyses in parallel (cached after first call — zero cost on multi-image generation)
        const [styleAnalysis, structureAnalysis, formAnalysis] = await Promise.all([
            styleFile ? analyzeForStyle(styleFile, userApiKey) : Promise.resolve(''),
            structureFile ? analyzeForStructure(structureFile, userApiKey) : Promise.resolve(''),
            (poseTransfer && referenceFiles.length > 0) ? analyzeForForm(referenceFiles[0], userApiKey) : Promise.resolve('')
        ]);

        const aspectRatioGuidance = getAspectRatioGuidance(aspectRatio, language, model);
        const instructionParts: string[] = [aspectRatioGuidance];

        // v2.4: Video reference instruction
        if (videoReferenceFile && model === 'gemini-3.1-flash-image-preview') {
            instructionParts.push(language === 'it'
                ? `🎬 VIDEO REFERENCE: Il primo elemento è un video — usalo come riferimento visivo per soggetto, stile, ambiente, lighting e composizione. Genera un'immagine coerente con il contenuto del video.`
                : `🎬 VIDEO REFERENCE: The first element is a video — use it as visual reference for subject, style, environment, lighting and composition. Generate an image consistent with the video content.`);
        }

        // v1.0: Add resolution keywords to prompt for advanced models (Pro & NB2) to trigger high-res generation
        if (isAdvancedModel(model) && resolution) {
            const resolutionKeyword = resolution === '4k' ? 'extreme 4K Ultra HD resolution, 4096px, hyper-detailed textures, macro sharpness' :
                resolution === '2k' ? '2K HD resolution, 2048px, very sharp details' :
                    resolution === '0.5k' ? '0.5K compact resolution, 512px, fast thumbnail' :
                        '1K standard resolution, 1024px';
            instructionParts.push(language === 'it' ? `Risoluzione: ${resolutionKeyword}.` : `Resolution: ${resolutionKeyword}.`);
        }

        const promptLower = prompt.toLowerCase();

        // STEP 2: Role-based multi-image guidance (client-side, zero API calls)
        // Images are ordered: [ref1..refN, style (if any), structure (if any)]
        // We describe each group's role using natural language + positional index (per Gemini docs best practice)
        if (referenceFiles.length > 1) {
            const refLabels = language === 'it'
                ? referenceFiles.map((_, idx) => `Immagine ${idx + 1}`).join(', ')
                : referenceFiles.map((_, idx) => `Image ${idx + 1}`).join(', ');

            instructionParts.push(language === 'it'
                ? `⚠️ COMBINA: Le immagini ${refLabels} sono le REFERENCE PRINCIPALI — includi il soggetto principale di ognuna in una scena coerente.`
                : `⚠️ COMBINE: Images ${refLabels} are the MAIN REFERENCES — include the main subject from each into one coherent scene.`);

            // Contextual relationship micro-guidance
            if (promptLower.includes('sulla') || promptLower.includes('sul') || promptLower.includes('on the') || promptLower.includes('on ')) {
                instructionParts.push(language === 'it' ? `Applica l'elemento come texture/overlay.` : `Apply the element as texture/overlay.`);
            } else if (promptLower.includes('con') || promptLower.includes('with')) {
                instructionParts.push(language === 'it' ? `Aggiungi l'elemento nella scena.` : `Add the element to the scene.`);
            } else if (promptLower.includes(' in ') || promptLower.includes('dentro')) {
                instructionParts.push(language === 'it' ? `Posiziona l'elemento nel contesto.` : `Place the element in the context.`);
            }
        }

        // STEP 3: Style image — analysis-enhanced instruction
        if (styleFile) {
            const styleIdx = referenceFiles.length + 1;
            const styleDesc = styleAnalysis
                ? (language === 'it'
                    ? `Applica ESATTAMENTE questo stile visivo: ${styleAnalysis}. NON copiare soggetti o contenuti dell'immagine di stile — applica SOLO l'estetica visiva.`
                    : `Apply EXACTLY this visual style: ${styleAnalysis}. Do NOT copy the subjects or content — apply ONLY the visual aesthetic.`)
                : (language === 'it'
                    ? `Applica la palette, illuminazione, mood e stile artistico. NON copiare i soggetti, solo lo stile visivo.`
                    : `Apply the color palette, lighting, mood and artistic style. Do NOT copy the subjects, only the visual style.`);
            instructionParts.push(`🎨 ${language === 'it' ? 'STILE' : 'STYLE'} (${language === 'it' ? 'Immagine' : 'Image'} ${styleIdx}): ${styleDesc}`);
        }

        // STEP 4: Structure image — analysis-enhanced instruction (no more ControlNet language)
        if (structureFile) {
            imageParts.push(await fileToGenerativePart(structureFile));
            const structureDesc = structureAnalysis
                ? (language === 'it'
                    ? `Segui questa composizione spaziale con precisione: ${structureAnalysis}. Usa l'immagine di struttura come guida visiva aggiuntiva per il layout.`
                    : `Follow this spatial composition precisely: ${structureAnalysis}. Use the structure reference image as additional visual guidance for layout.`)
                : (language === 'it'
                    ? `Rispetta la composizione spaziale, posizione degli elementi, proporzioni geometriche e angolatura della camera.`
                    : `Follow the spatial composition, element positions, geometric proportions and camera angle.`);
            instructionParts.push(`🏗️ ${language === 'it' ? 'STRUTTURA' : 'STRUCTURE'}: ${structureDesc}`);
        }

        // STEP 5: Add Precise Reference guidance if enabled (v0.7 feature)
        if (preciseReference && referenceFiles.length > 0) {
            const preciseReferenceGuidance = language === 'it'
                ? `🎯 PRECISO: Mantieni IDENTICI i tratti del viso, pelle, occhi, naso, capelli dalle reference. Fedeltà massima.`
                : `🎯 PRECISE: Keep face features, skin, eyes, nose, hair IDENTICAL to references. Maximum fidelity.`;

            instructionParts.push(preciseReferenceGuidance);
        }

        // STEP 5b: Form Transfer — replicate exact form/silhouette from first reference
        if (poseTransfer && referenceFiles.length > 0 && formAnalysis) {
            instructionParts.push(language === 'it'
                ? `🔲 FORM TRANSFER: Replica ESATTAMENTE questa forma, silhouette e struttura spaziale con il nuovo soggetto: ${formAnalysis}. Il soggetto generato deve avere questa identica struttura formale — aspetto, materiali e contesto seguono il prompt.`
                : `🔲 FORM TRANSFER: Replicate EXACTLY this form, silhouette and spatial structure with the new subject: ${formAnalysis}. The generated subject must have this identical formal structure — appearance, materials and context follow the prompt.`);
        }

        // STEP 6: v1.0 - Add Text-in-Image guidance (PRO feature)
        if (textInImage && textInImage.enabled && textInImage.text) {
            const positionMap: Record<string, string> = {
                'top': language === 'it' ? 'nella parte SUPERIORE dell\'immagine' : 'at the TOP of the image',
                'center': language === 'it' ? 'al CENTRO dell\'immagine' : 'at the CENTER of the image',
                'bottom': language === 'it' ? 'nella parte INFERIORE dell\'immagine' : 'at the BOTTOM of the image',
                'overlay': language === 'it' ? 'come OVERLAY sopra il soggetto principale' : 'as an OVERLAY on the main subject'
            };

            const fontStyleMap: Record<string, string> = {
                'bold': language === 'it' ? 'carattere GRASSETTO e forte' : 'BOLD and strong font',
                'italic': language === 'it' ? 'carattere CORSIVO elegante' : 'ITALIC elegant font',
                'calligraphy': language === 'it' ? 'carattere CALLIGRAFICO artistico' : 'CALLIGRAPHIC artistic font',
                'modern': language === 'it' ? 'carattere MODERNO e pulito (sans-serif)' : 'MODERN clean font (sans-serif)',
                'vintage': language === 'it' ? 'carattere VINTAGE retrò' : 'VINTAGE retro font'
            };

            const position = textInImage.position || 'center';
            const fontStyle = textInImage.fontStyle || 'modern';

            const textGuidance = language === 'it'
                ? `📝 TESTO NELL'IMMAGINE: Includi il testo "${textInImage.text}" ${positionMap[position]}, usando ${fontStyleMap[fontStyle]}. Il testo deve essere LEGGIBILE, ben integrato nella composizione, con contrasto adeguato rispetto allo sfondo.`
                : `📝 TEXT IN IMAGE: Include the text "${textInImage.text}" ${positionMap[position]}, using ${fontStyleMap[fontStyle]}. Text must be LEGIBLE, well integrated in composition, with adequate contrast against background.`;

            instructionParts.push(textGuidance);
        }

        // Build full prompt with enriched user prompt
        let fullPrompt = instructionParts.length > 0
            ? `${instructionParts.join(' ')} ${enrichedPrompt}`
            : enrichedPrompt;

        if (negativePrompt && negativePrompt.trim() !== '') {
            fullPrompt += ` --no ${negativePrompt.trim()}`;
        }


        // v1.3: Optimize prompt for advanced models (Pro & NB2) with multiple images to reduce complexity
        if (isAdvancedModel(model) && imageParts.length > 2 && fullPrompt.length > 500) {
            fullPrompt = fullPrompt
                .replace(/⚠️ COMBINA:.*?(?=🎨|🏗️|📝|🎯|--no|$)/gs, '')
                .replace(/⚠️ COMBINE:.*?(?=🎨|🏗️|📝|🎯|--no|$)/gs, '')
                .replace(/🎨 STILE.*?(?=🏗️|📝|🎯|--no|$)/gs, '')
                .replace(/🎨 STYLE.*?(?=🏗️|📝|🎯|--no|$)/gs, '')
                .replace(/mantieni stesso soggetto e aspetto/g, '')
                .replace(/keep same subject appearance/g, '')
                .trim();
        }

        // CRITICAL: Images must come BEFORE text for proper reference interpretation
        const parts: any[] = [...imageParts, { text: fullPrompt }];

        const config: any = {
            responseModalities: [Modality.IMAGE],
            temperature: 0.7,
            safetySettings: SAFETY_SETTINGS_PERMISSIVE,
        };

        // v2.4: thinkingConfig for NB2/PRO — user-configurable budget
        // thinkingBudget: 0 = no thinking (fastest), 4096 = balanced, -1 = max (deepest)
        if (model === 'gemini-3.1-flash-image-preview' || model === 'gemini-3-pro-image-preview') {
            const budgetMap = { minimal: 0, medium: 4096, high: -1 };
            config.thinkingConfig = { thinkingBudget: budgetMap[thinkingLevel ?? 'medium'] };
        }

        // Add imageConfig with aspect ratio
        // NOTE: personGeneration is NOT supported in @google/genai SDK (only in Vertex AI)
        // LM Arena likely uses Vertex AI which has this parameter, but we can't use it here
        // Add imageConfig with aspect ratio and resolution
        const imageConfig: any = {};

        if (aspectRatio !== 'Auto') {
            imageConfig.aspectRatio = aspectRatio;
        }

        // v1.0: Native Resolution for advanced models (Pro & NB2)
        if (isAdvancedModel(model) && resolution) {
            imageConfig.imageSize = resolution === '0.5k' ? '0.5K' : resolution.toUpperCase(); // "0.5K", "1K", "2K", or "4K"
        }

        if (Object.keys(imageConfig).length > 0) {
            config.imageConfig = imageConfig;
        }

        if (seed && /^\d+$/.test(seed)) {
            config.seed = parseInt(seed, 10);
        }

        // v1.5.1: Google Search Grounding support (all models)
        // Note: Invisible reference images from Google are added in App.tsx before calling this function
        if (useGrounding) {
            // For advanced models (PRO & NB2), enable textual grounding for real-time data
            if (model === 'gemini-3.1-flash-image-preview') {
                // NB2: Enhanced Image Search Grounding (text + images from web)
                config.tools = [{
                    googleSearch: {
                        dynamicRetrievalConfig: {
                            dynamicThreshold: 0.3
                        }
                    }
                }];
            } else if (model === 'gemini-3-pro-image-preview') {
                // PRO: Standard text-only grounding (unchanged)
                config.tools = [{
                    googleSearch: {}
                }];
            } else {
            }
        }

        // v1.3: Add abort signal and long timeout to config
        if (abortSignal) {
            (config as any).abortSignal = abortSignal;
        }
        (config as any).httpOptions = {
            timeout: model === 'gemini-3-pro-image-preview' ? 600000 : model === 'gemini-3.1-flash-image-preview' ? 420000 : 300000, // 10min for Pro, 7min for NB2, 5min for Flash
        };


        // v1.3: Warning for advanced models - they may be slower
        if (isAdvancedModel(model)) {
        }

        // Enhanced retry logic: IMAGE_RECITATION/IMAGE_OTHER with prompt variations + 500/503 server errors
        const MAX_RETRIES = 5;
        let lastError: any = null;
        let result: any = null;

        for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
            try {
                // v1.3: httpOptions.timeout now handles timeout at SDK level
                result = await ai.models.generateContent({
                    model: model,
                    contents: { parts },
                    config: config as any,
                });

                // Check for IMAGE_RECITATION and IMAGE_OTHER before processing
                const candidate = result.candidates?.[0];
                const finishReason = candidate?.finishReason;

                // Retry on IMAGE_RECITATION or IMAGE_OTHER (copyright/celeb detection - often false positives)
                if ((finishReason === 'IMAGE_RECITATION' || finishReason === 'IMAGE_OTHER') && attempt < MAX_RETRIES - 1) {
                    console.warn(`⚠️ ${finishReason} on attempt ${attempt + 1}/${MAX_RETRIES}, retrying with variations...`);

                    // Add slight variations to bypass overzealous filters
                    if (attempt > 0) {
                        // On subsequent retries, add small random variations to prompt
                        const variations = [
                            ' in a creative artistic style',
                            ' as digital art',
                            ' in a professional photoshoot',
                            ' cinematic composition',
                            ' artistic interpretation'
                        ];
                        fullPrompt = fullPrompt.replace(/ (in a creative|as digital|in a professional|cinematic|artistic interpretation).*?(?=,|$)/g, '');
                        fullPrompt += variations[attempt % variations.length];
                        parts[parts.length - 1] = { text: fullPrompt };
                    }

                    // Wait before retry (exponential backoff: 300ms, 600ms, 1200ms, 2400ms)
                    await new Promise(resolve => setTimeout(resolve, 300 * Math.pow(2, attempt)));
                    continue;
                }

                // Success - exit retry loop
                break;
            } catch (error: any) {
                lastError = error;

                // v1.3: Get error message
                const errorMessage = error?.message || '';

                // v1.3: Check for abort (user cancelled)
                if (error.name === 'AbortError' || errorMessage.includes('abort')) {
                    const msg = language === 'it'
                        ? '🛑 Generazione annullata dall\'utente.'
                        : '🛑 Generation cancelled by user.';
                    throw new Error(msg);
                }

                // v1.3: Check for timeout - now handled by retry logic below
                if (errorMessage.includes('timeout') || errorMessage.includes('TIMEOUT')) {
                    console.warn(`⏱️ Attempt ${attempt + 1} timed out, retrying...`);
                }

                // Check if error is retriable (500, 503, 429, network errors)
                const isRetriable =
                    errorMessage.includes('500') ||
                    errorMessage.includes('503') ||
                    errorMessage.includes('504') || // Gateway Timeout
                    errorMessage.includes('INTERNAL') ||
                    errorMessage.includes('UNAVAILABLE') ||
                    errorMessage.includes('overloaded') ||
                    errorMessage.includes('429') ||
                    errorMessage.includes('RESOURCE_EXHAUSTED') ||
                    errorMessage.includes('deadline') ||
                    errorMessage.includes('DEADLINE') ||
                    errorMessage.includes('expired') ||
                    errorMessage.includes('timeout') ||
                    errorMessage.includes('TIMEOUT');

                if (isRetriable && attempt < MAX_RETRIES - 1) {
                    console.warn(`⚠️ Retriable server error on attempt ${attempt + 1}/${MAX_RETRIES}:`, errorMessage);
                    // Longer backoff for server errors: 1s, 2s, 4s, 8s, 16s + jitter
                    const baseDelay = 1000 * Math.pow(2, attempt);
                    const jitter = Math.random() * 1000;
                    await new Promise(resolve => setTimeout(resolve, baseDelay + jitter));
                    continue;
                }

                // Non-retriable error or final attempt
                throw error;
            }
        }

        if (!result) {
            throw lastError || new Error('Failed to generate content after retries');
        }

        const candidate = result.candidates?.[0];
        if (!candidate || !candidate.content || !candidate.content.parts) {
            // Log detailed error information
            console.error("=== GEMINI API ERROR DEBUG ===");
            console.error("Full API Response:", JSON.stringify(result, null, 2));
            console.error("Prompt sent:", fullPrompt);
            console.error("Number of reference images:", referenceFiles.length);
            console.error("Image parts in request:", imageParts.length);
            console.error("Parts order:", parts.map((p, i) => `${i}: ${p.text ? 'TEXT' : 'IMAGE'}`).join(', '));
            console.error("=============================");

            if (result.promptFeedback?.blockReason) {
                const blockReason = result.promptFeedback.blockReason;
                const safetyRatings = result.promptFeedback.safetyRatings || [];

                // v1.3.1: Auto-fallback to Flash when advanced models (Pro/NB2) block with "OTHER"
                // "OTHER" typically means: face manipulation, personal photos, identity editing
                if (blockReason === 'OTHER' && isAdvancedModel(model)) {
                    console.warn(`⚠️ ${model === 'gemini-3.1-flash-image-preview' ? 'Nano Banana 2' : 'Nano Banana Pro'} blocked with "OTHER". Auto-fallback to Nano Banana Flash...`);

                    // Recursively call generateImage with Flash model
                    return await generateImage(
                        prompt,
                        aspectRatio,
                        referenceFiles,
                        styleFile,
                        structureFile,
                        userApiKey,
                        negativePrompt,
                        seed,
                        language,
                        preciseReference,
                        'gemini-2.5-flash-image', // Force Flash model
                        resolution,
                        textInImage,
                        abortSignal,
                        useGrounding
                    );
                }

                let detailedMessage = language === 'it'
                    ? `La richiesta è stata bloccata: ${blockReason}. `
                    : `The request was blocked: ${blockReason}. `;

                if (safetyRatings.length > 0) {
                    const issues = safetyRatings
                        .filter((r: any) => r.blocked)
                        .map((r: any) => r.category)
                        .join(', ');
                    if (issues) {
                        detailedMessage += language === 'it'
                            ? `Categorie problematiche: ${issues}. Prova a modificare le immagini o il prompt.`
                            : `Problematic categories: ${issues}. Try modifying the images or prompt.`;
                    }
                }

                throw new Error(detailedMessage);
            }

            // Check if there are candidates but they're empty
            if (result.candidates && result.candidates.length > 0) {
                const finishReason = result.candidates[0]?.finishReason;
                if (finishReason && finishReason !== 'STOP') {
                    // IMAGE_RECITATION or IMAGE_OTHER means copyrighted content detected (but often false positives)
                    if (finishReason === 'IMAGE_RECITATION' || finishReason === 'IMAGE_OTHER') {
                        const message = language === 'it'
                            ? `⚠️ Generazione bloccata dopo ${MAX_RETRIES} tentativi (${finishReason}).\n\nIl sistema ha rilevato possibili contenuti protetti/celebrity, ma potrebbe essere un FALSO POSITIVO.\n\n✅ Soluzioni:\n• RIPROVA - spesso funziona al 2° tentativo\n• Usa descrizioni generiche invece di nomi famosi\n• Aggiungi "artistic style" o "digital art" al prompt\n• Prova con seed diversi (cambia il numero casuale)\n\nNOTA: LM Arena potrebbe usare configurazioni API diverse con meno restrizioni.`
                            : `⚠️ Generation blocked after ${MAX_RETRIES} attempts (${finishReason}).\n\nThe system detected possible protected content/celebrity, but this might be a FALSE POSITIVE.\n\n✅ Solutions:\n• TRY AGAIN - often works on 2nd attempt\n• Use generic descriptions instead of famous names\n• Add "artistic style" or "digital art" to prompt\n• Try different seeds (change random number)\n\nNOTE: LM Arena might use different API configs with fewer restrictions.`;
                        throw new Error(message);
                    }

                    // Other finish reasons
                    const hasImages = imageParts.length > 0;
                    const message = language === 'it'
                        ? (hasImages
                            ? `Generazione interrotta (${finishReason}). Il modello potrebbe non riuscire a combinare queste immagini. Prova con: 1) Immagini più semplici 2) Prompt più breve 3) Meno immagini di riferimento.`
                            : `Generazione interrotta (${finishReason}). Prova con: 1) Prompt più breve e semplice 2) Descrizioni meno specifiche 3) Evita riferimenti a contenuti protetti.`)
                        : (hasImages
                            ? `Generation stopped (${finishReason}). The model may not be able to combine these images. Try: 1) Simpler images 2) Shorter prompt 3) Fewer reference images.`
                            : `Generation stopped (${finishReason}). Try: 1) Shorter, simpler prompt 2) Less specific descriptions 3) Avoid copyrighted content references.`);
                    throw new Error(message);
                }
            }

            const genericMessage = language === 'it'
                ? 'Nessun contenuto immagine nella risposta. Possibili cause: 1) Prompt troppo complesso 2) Immagini incompatibili 3) Richiesta bloccata. Riprova con immagini o prompt diversi.'
                : 'No image content in response. Possible causes: 1) Prompt too complex 2) Incompatible images 3) Blocked request. Try again with different images or prompt.';
            throw new Error(genericMessage);
        }

        for (const part of candidate.content.parts) {
            if (part.inlineData) {
                const base64ImageBytes: string = part.inlineData.data;
                const originalImageDataUrl = `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;

                // Skip cropping for "Auto" aspect ratio - use reference image's original ratio
                // Also skip for advanced models that natively support aspect ratio to avoid distorting perfectly valid images
                if (aspectRatio === 'Auto' || isAdvancedModel(model)) {
                    return originalImageDataUrl;
                }

                // Apply crop and resize for specific aspect ratios
                const finalImageDataUrl = await aggressiveCropAndResize(originalImageDataUrl, aspectRatio, resolution);
                return finalImageDataUrl;
            }
        }
        throw new Error("No image data in response parts");

    } catch (error) {
        throw handleError(error, language);
    }
};

export const editImage = async (prompt: string, imageFile: File, userApiKey?: string | null, language: 'en' | 'it' = 'en'): Promise<string> => {
    try {
        const ai = getAiClient(userApiKey);
        const imagePart = await fileToGenerativePart(imageFile);
        const parts: any[] = [imagePart, { text: prompt }];

        const result = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts },
            config: {
                responseModalities: [Modality.IMAGE],
                safetySettings: SAFETY_SETTINGS_PERMISSIVE,
                outputOptions: {
                    mimeType: 'image/png',
                    compressionQuality: 100
                },
            } as any,
        });

        const candidate = result.candidates?.[0];
        if (!candidate || !candidate.content || !candidate.content.parts) {
            if (result.promptFeedback?.blockReason) {
                throw { promptFeedback: result.promptFeedback };
            }
            console.error("Invalid response structure from Gemini API during edit:", JSON.stringify(result, null, 2));
            throw new Error("No valid image content found in the API response for editing. The request may have been blocked due to safety settings or other issues.");
        }

        for (const part of candidate.content.parts) {
            if (part.inlineData && part.inlineData.data) {
                const base64ImageBytes = part.inlineData.data as string;
                const mimeType: string = part.inlineData.mimeType || 'image/png';
                return `data:${mimeType};base64,${base64ImageBytes}`;
            }
        }
        throw new Error("No image data in response parts");

    } catch (error) {
        throw handleError(error, language);
    }
};

export const inpaintImage = async (prompt: string, imageFile: File, maskFile: File, userApiKey?: string | null, language: 'en' | 'it' = 'en'): Promise<string> => {
    try {
        const ai = getAiClient(userApiKey);
        const imagePart = await fileToGenerativePart(imageFile);
        const maskPart = await fileToGenerativePart(maskFile);

        const parts: any[] = [
            imagePart,
            maskPart,
            { text: `Using the second image provided as a mask (where the non-transparent/colored area indicates the area to change), edit the first image. The edited area should become: "${prompt}". Blend the results seamlessly.` }
        ];

        const result = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts },
            config: {
                responseModalities: [Modality.IMAGE],
                safetySettings: SAFETY_SETTINGS_PERMISSIVE,
                outputOptions: {
                    mimeType: 'image/png',
                    compressionQuality: 100
                },
            } as any,
        });

        const candidate = result.candidates?.[0];
        if (!candidate || !candidate.content || !candidate.content.parts) {
            if (result.promptFeedback?.blockReason) {
                throw { promptFeedback: result.promptFeedback };
            }
            console.error("Invalid response structure from Gemini API during inpaint:", JSON.stringify(result, null, 2));
            throw new Error("No valid image content found in the API response for inpainting.");
        }

        for (const part of candidate.content.parts) {
            if (part.inlineData && part.inlineData.data) {
                const base64ImageBytes = part.inlineData.data as string;
                const mimeType: string = part.inlineData.mimeType || 'image/png';
                return `data:${mimeType};base64,${base64ImageBytes}`;
            }
        }
        throw new Error("No image data in response parts for inpainting");

    } catch (error) {
        throw handleError(error, language);
    }
};

export const generateNegativePrompt = async (prompt: string, referenceFiles: File[], styleFile: File | null, userApiKey?: string | null, language: 'en' | 'it' = 'en'): Promise<string> => {
    try {
        if (!prompt || prompt.trim().length < 5) {
            return "text, watermark, blurry, low quality, ugly, deformed";
        }
        const ai = getAiClient(userApiKey);

        const imageParts = [];
        for (const file of referenceFiles) {
            imageParts.push(await fileToGenerativePart(file));
        }
        if (styleFile) {
            imageParts.push(await fileToGenerativePart(styleFile));
        }

        const systemInstruction = language === 'it'
            ? "Sei un assistente AI per un generatore di immagini professionale. Il tuo compito è creare un 'prompt negativo' per migliorare la qualità dell'immagine. Analizza il prompt principale dell'utente E le eventuali immagini di riferimento fornite. Il prompt negativo deve essere un elenco di termini separati da virgola da EVITARE, come difetti artistici comuni (es. 'brutto, deforme, sfocato, anatomia scadente, mani fatte male, arti extra'). REGOLA FONDAMENTALE: NON aggiungere termini per elementi che sono chiaramente PRESENTI e INTENZIONALI nelle immagini di riferimento. Ad esempio, se un'immagine di riferimento contiene testo o un logo, NON includere 'testo' o 'logo' nel prompt negativo. Restituisci SOLO la stringa di termini."
            : "You are an AI assistant for a professional image generator. Your task is to create a 'negative prompt' to improve image quality. Analyze the user's main prompt AND any provided reference images. The negative prompt should be a comma-separated list of terms to AVOID, such as common artistic flaws (e.g., 'ugly, deformed, blurry, poor anatomy, bad hands, extra limbs'). CRITICAL RULE: Do NOT add terms for things that are clearly PRESENT and INTENTIONAL in the reference images. For example, if a reference image contains text or a logo, DO NOT include 'text' or 'logo' in the negative prompt. Return ONLY the string of terms.";

        const userMessage = language === 'it'
            ? `Prompt utente: "${prompt}"`
            : `User Prompt: "${prompt}"`;

        const result = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: { parts: [...imageParts, { text: userMessage }] },
            config: {
                systemInstruction,
                temperature: 0.1,
                topP: 0.95,
                safetySettings: SAFETY_SETTINGS_PERMISSIVE
            }
        });

        const responseText = result.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
        const negativePrompt = responseText.replace(/negative prompt: /i, '');
        return negativePrompt || "text, watermark, blurry, low quality, ugly, deformed";

    } catch (error) {
        throw handleError(error, language);
    }
};

/**
 * Helper function to detect image aspect ratio from a File or data URL
 */
const detectImageAspectRatio = async (imageSource: File | string): Promise<string> => {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            const ratio = img.width / img.height;

            // Map to closest supported aspect ratio
            if (Math.abs(ratio - 1) < 0.1) resolve('1:1');
            else if (Math.abs(ratio - 16 / 9) < 0.15) resolve('16:9');
            else if (Math.abs(ratio - 9 / 16) < 0.15) resolve('9:16');
            else if (Math.abs(ratio - 4 / 3) < 0.1) resolve('4:3');
            else if (Math.abs(ratio - 3 / 4) < 0.1) resolve('3:4');
            else if (Math.abs(ratio - 3 / 2) < 0.1) resolve('3:2');
            else if (Math.abs(ratio - 2 / 3) < 0.1) resolve('2:3');
            else if (Math.abs(ratio - 21 / 9) < 0.2) resolve('21:9');
            else resolve('1:1'); // Default fallback

            URL.revokeObjectURL(img.src);
        };
        img.onerror = () => {
            URL.revokeObjectURL(img.src);
            resolve('1:1');
        };

        if (typeof imageSource === 'string') {
            img.src = imageSource;
        } else {
            img.src = URL.createObjectURL(imageSource);
        }
    });
};

/**
 * Convert data URL to File object
 */
const dataURLToFile = async (dataUrl: string, filename: string): Promise<File> => {
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
};

/**
 * Upscale an image using Nano Banana Pro (Gemini 3 Pro Image) at higher resolution
 * This function recreates the image at 2K or 4K resolution with enhanced details
 *
 * @param imageDataUrl - The data URL of the image to upscale
 * @param targetResolution - Target resolution: '2k' or '4k' (default: '4k')
 * @param userApiKey - User's Gemini API key
 * @param language - UI language for prompts and errors
 * @returns Data URL of the upscaled image
 */
export const upscaleImage = async (
    imageDataUrl: string,
    targetResolution: '2k' | '4k' = '4k',
    userApiKey: string | null,
    language: 'en' | 'it' = 'en'
): Promise<string> => {
    try {
        const ai = getAiClient(userApiKey);

        // Convert data URL to File for processing
        const imageFile = await dataURLToFile(imageDataUrl, 'image-to-upscale.png');

        // Convert to generative part
        const imagePart = await fileToGenerativePart(imageFile);

        // Detect original aspect ratio
        const aspectRatio = await detectImageAspectRatio(imageDataUrl);

        // Create upscaling prompt with strong emphasis on preservation
        const prompt = language === 'it'
            ? `Ricrea questa immagine ESATTAMENTE come è, ma con risoluzione ${targetResolution.toUpperCase()} e dettagli migliorati.

IMPORTANTE - Mantieni IDENTICI:
- Tutti i soggetti e le loro posizioni esatte
- La composizione e il layout originale
- I colori, le tonalità e l'illuminazione
- Lo stile artistico e l'atmosfera
- Tutte le texture e i materiali

MIGLIORA SOLO:
- Nitidezza e definizione dei dettagli
- Qualità della risoluzione
- Chiarezza dei bordi e delle texture
- Dettagli fini senza alterare l'aspetto generale

NON aggiungere, rimuovere o modificare alcun elemento. Questa è una ricreazione fedele ad alta risoluzione.`
            : `Recreate this image EXACTLY as it is, but with ${targetResolution.toUpperCase()} resolution and enhanced details.

IMPORTANT - Keep IDENTICAL:
- All subjects and their exact positions
- The original composition and layout
- Colors, tones, and lighting
- Artistic style and atmosphere
- All textures and materials

IMPROVE ONLY:
- Sharpness and detail definition
- Resolution quality
- Clarity of edges and textures
- Fine details without altering the general appearance

DO NOT add, remove, or modify any elements. This is a faithful high-resolution recreation.`;

        const parts = [imagePart, { text: prompt }];

        const config: any = {
            responseModalities: [Modality.IMAGE],
            temperature: 0.4, // Lower temperature for more faithful recreation
            topP: 0.9,
            safetySettings: SAFETY_SETTINGS_PERMISSIVE,
            imageConfig: {
                imageSize: targetResolution.toUpperCase(), // CRITICAL: Must be "2K" or "4K"
                aspectRatio: aspectRatio
            }
        };


        (config as any).httpOptions = { timeout: 300000 };

        const result = await ai.models.generateContent({
            model: 'gemini-3-pro-image-preview', // Nano Banana Pro - supports up to 4K
            contents: { parts },
            config: config as any
        });

        const candidate = result.candidates?.[0];
        if (!candidate || !candidate.content || !candidate.content.parts) {
            throw new Error(language === 'it'
                ? 'Nessun contenuto immagine nella risposta di upscaling.'
                : 'No image content in upscaling response.');
        }

        for (const part of candidate.content.parts) {
            if (part.inlineData && part.inlineData.data) {
                const base64ImageBytes: string = part.inlineData.data;
                const mimeType: string = part.inlineData.mimeType || 'image/png';
                const upscaledDataUrl = `data:${mimeType};base64,${base64ImageBytes}`;
                return upscaledDataUrl;
            }
        }

        throw new Error(language === 'it'
            ? 'Nessun dato immagine nella risposta.'
            : 'No image data in response.');

    } catch (error) {
        console.error('Upscaling error:', error);
        throw handleError(error, language);
    }
};

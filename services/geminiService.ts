import { GoogleGenAI, Type, Modality, HarmCategory, HarmBlockThreshold } from "@google/genai";
import { DynamicTool, ModelType, ResolutionType, TextInImageConfig } from '../types';
import { enhancePromptV2 } from './enhancePromptNew';

const DEFAULT_API_KEY = import.meta.env.VITE_API_KEY;

if (!DEFAULT_API_KEY) {
  console.warn("VITE_API_KEY environment variable not set. Users must provide their own API key.");
}

export const getAiClient = (userApiKey?: string | null) => {
    const apiKey = userApiKey || DEFAULT_API_KEY;
    if (!apiKey) {
        // This case should ideally not be hit if the env key is set.
        throw new Error("No API Key available for Gemini client.");
    }
    return new GoogleGenAI({ apiKey });
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


export const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

export const generatePromptsFromImage = async (imageFiles: File[], styleFile: File | null, structureFile: File | null, userApiKey?: string | null, language: 'en' | 'it' = 'en'): Promise<string[]> => {
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

    const stylePromptPart = styleFile
        ? (language === 'it' ? "Applica lo stile visivo (colori, illuminazione, atmosfera) dell'immagine di stile fornita a questi scenari." : "Apply the visual style (colors, lighting, mood) from the provided style image to these scenarios.")
        : "";

    const structurePromptPart = structureFile
        ? (language === 'it' ? "L'ultima immagine è una guida strutturale: mantieni la stessa composizione spaziale, layout e geometria nella generazione." : "The last image is a structural guide: maintain the same spatial composition, layout and geometry in the generation.")
        : "";

    const promptText = language === 'it'
      ? `Sei un art director senior e un esperto di fotografia pubblicitaria per agenzie di comunicazione. Analizza TUTTI i soggetti e gli elementi in TUTTE le immagini di riferimento fornite. Il tuo obiettivo è creare 3 prompt distinti per immagini pubblicitarie professionali che COMBININO in modo creativo i soggetti delle diverse immagini. ${stylePromptPart} ${structurePromptPart}

**STRUTTURA DEI 3 PROMPT:**
1. **HERO SHOT** - Focus principale sul prodotto/soggetto con lighting da studio professionale
2. **LIFESTYLE/CONTEXT** - Soggetto in un contesto reale/ambientato con narrativa
3. **DETAIL/MACRO** - Close-up dettagliato su texture, materiali, caratteristiche uniche

**CATEGORIE DI PRODOTTO E SPECIFICHE TECNICHE:**

- **PACKAGING** (scatole, etichette, flaconi, bottiglie):
  → Hero: Lighting setup da catalogo (key light + fill + rim), negative space per copy, angles da 45° o flat lay dall'alto
  → Lifestyle: Prodotto in contesto d'uso reale (bagno, cucina, tavolo), props complementari
  → Detail: Macro su logo/etichetta, texture del materiale, riflessi e trasparenze
  → Usa termini: "product photography", "commercial shot", "catalog quality", "studio lighting"

- **BEAUTY/COSMETICS** (creme, makeup, profumi):
  → Hero: Softbox diffusion, beauty dish, acqua/splash se pertinente, sfondo gradient o marmo
  → Lifestyle: Hand modeling con prodotto, applicazione naturale, morning/evening routine
  → Detail: Texture cremosa, pigmento, finish (matte/glossy), ingredienti chiave
  → Color grading: Clean, high-key, o moody low-key; retouching stile high-end beauty

- **FASHION/CLOTHING** (abiti, accessori, modelli):
  → Hero: Editorial fashion shot, dramatic lighting, rule of thirds, pose dinamica
  → Lifestyle: Street style, candid moment, urban/natural setting, movement
  → Detail: Texture del tessuto, cuciture, pattern, dettagli costruttivi
  → Specifiche: "fashion editorial", "Vogue style", "lookbook quality", lens flare controllato

- **FOOD/BEVERAGE** (cibo, drink):
  → Hero: Overhead flat lay o 45° angle, natural daylight o studio setup, fresh ingredients visible
  → Lifestyle: Hands reaching/pouring, table setting, social moment, steam/condensation
  → Detail: Macro su texture (crumb, foam, ice), color pop, ingredienti hero
  → Termini: "food photography", "appetizing", "fresh", "Michelin quality", garnish

- **HOUSEHOLD PRODUCTS** (detersivi, cleaning, home):
  → Hero: Before/after implicito, risultato visibile, packaging chiaro
  → Lifestyle: Scene di vita vera, ambiente domestico realistico ma idealizzato
  → Detail: Efficacia visibile, texture pulita, shine/sparkle
  
**SPECIFICHE FOTOGRAFICHE DA INCLUDERE:**
- Lighting: "three-point lighting", "softbox", "golden hour", "ring light", "rim light"
- Composition: "negative space for copy", "rule of thirds", "leading lines", "visual hierarchy"
- Camera: "shallow depth of field", "tack sharp focus", "bokeh background", "50mm lens perspective"
- Post: "color grading: [muted/vibrant/vintage]", "film emulation: Portra 400", "natural retouching"
- Shot types: "hero shot", "flat lay", "lifestyle", "macro detail", "product beauty shot"

**IMPORTANTE:** 
- Lascia sempre spazio compositivo per testo/logo (negative space intenzionale)
- Specifica se l'immagine è per print, social, billboard (formato influenza composizione)
- Ogni prompt deve essere auto-contenuto e immediatamente utilizzabile
- Varia mood e tecnica tra i 3 prompt ma mantieni coerenza di brand

Restituisci un array JSON di 3 stringhe, ciascuna altamente dettagliata e professionale.`
      : `You are a senior art director and expert in advertising photography for communication agencies. Analyze ALL subjects and elements in ALL provided reference images. Your goal is to create 3 distinct prompts for professional advertising images that creatively COMBINE the subjects from different images. ${stylePromptPart} ${structurePromptPart}

**STRUCTURE OF 3 PROMPTS:**
1. **HERO SHOT** - Main focus on product/subject with professional studio lighting
2. **LIFESTYLE/CONTEXT** - Subject in real-world context with narrative
3. **DETAIL/MACRO** - Detailed close-up on textures, materials, unique features

**PRODUCT CATEGORIES & TECHNICAL SPECS:**

- **PACKAGING** (boxes, labels, bottles, containers):
  → Hero: Catalog lighting setup (key + fill + rim), negative space for copy, 45° angles or top-down flat lay
  → Lifestyle: Product in real-use context (bathroom, kitchen, table), complementary props
  → Detail: Macro on logo/label, material texture, reflections and transparencies
  → Use terms: "product photography", "commercial shot", "catalog quality", "studio lighting"

- **BEAUTY/COSMETICS** (creams, makeup, perfumes):
  → Hero: Softbox diffusion, beauty dish, water/splash if relevant, gradient or marble background
  → Lifestyle: Hand modeling with product, natural application, morning/evening routine
  → Detail: Creamy texture, pigment, finish (matte/glossy), key ingredients
  → Color grading: Clean high-key or moody low-key; high-end beauty retouching

- **FASHION/CLOTHING** (garments, accessories, models):
  → Hero: Editorial fashion shot, dramatic lighting, rule of thirds, dynamic pose
  → Lifestyle: Street style, candid moment, urban/natural setting, movement
  → Detail: Fabric texture, stitching, patterns, construction details
  → Specs: "fashion editorial", "Vogue style", "lookbook quality", controlled lens flare

- **FOOD/BEVERAGE** (food, drinks):
  → Hero: Overhead flat lay or 45° angle, natural daylight or studio setup, visible fresh ingredients
  → Lifestyle: Hands reaching/pouring, table setting, social moment, steam/condensation
  → Detail: Macro on texture (crumb, foam, ice), color pop, hero ingredients
  → Terms: "food photography", "appetizing", "fresh", "Michelin quality", garnish

- **HOUSEHOLD PRODUCTS** (detergents, cleaning, home):
  → Hero: Implied before/after, visible results, clear packaging
  → Lifestyle: Real-life scenes, realistic but idealized domestic environment
  → Detail: Visible effectiveness, clean texture, shine/sparkle

**PHOTOGRAPHY SPECS TO INCLUDE:**
- Lighting: "three-point lighting", "softbox", "golden hour", "ring light", "rim light"
- Composition: "negative space for copy", "rule of thirds", "leading lines", "visual hierarchy"
- Camera: "shallow depth of field", "tack sharp focus", "bokeh background", "50mm lens perspective"
- Post: "color grading: [muted/vibrant/vintage]", "film emulation: Portra 400", "natural retouching"
- Shot types: "hero shot", "flat lay", "lifestyle", "macro detail", "product beauty shot"

**IMPORTANT:**
- Always leave compositional space for text/logo (intentional negative space)
- Specify if image is for print, social, billboard (format influences composition)
- Each prompt must be self-contained and immediately usable
- Vary mood and technique across 3 prompts but maintain brand coherence

Return a JSON array of 3 strings, each highly detailed and professional.`;
      
    const result = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
            parts: [
                ...imageParts,
                { text: promptText }
            ]
        },
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
            }
        }
    });
    
    const responseText = result.text.trim();
    const prompts = JSON.parse(responseText);
    return Array.isArray(prompts) && prompts.length > 0 ? prompts : [];
  } catch (error) {
    throw handleError(error, language);
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
        model: 'gemini-2.5-flash',
        contents: {
            parts: [
                ...imageParts,
                { text: promptText }
            ]
        },
        config: {
            temperature: 0.7
        }
    });
    
    return result.text.trim();
  } catch (error) {
    throw handleError(error, language);
  }
};

export const enhancePrompt = async (currentPrompt: string, imageFiles: File[], styleFile: File | null, structureFile: File | null, userApiKey?: string | null, language: 'en' | 'it' = 'en'): Promise<string> => {
    try {
        // Use new revolutionary v2 system
        const result = await enhancePromptV2(currentPrompt, imageFiles, styleFile, structureFile, userApiKey, language);
        return result.enhancedPrompt;
    } catch (error) {
        console.error('❌ Enhancement v2 failed, returning original:', error);
        return currentPrompt;
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
            model: 'gemini-2.5-flash',
            contents: {
                parts: [
                    ...imageParts,
                    { text: promptText }
                ]
            },
            config: {
                responseMimeType: "application/json",
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
        const responseText = result.text.trim();
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
            model: 'gemini-2.5-flash',
            contents: { parts: [{ text: userMessage }] },
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.2 
            }
        });

        const rewrittenPrompt = result.text.trim();
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
            model: 'gemini-2.5-flash',
            contents: { parts: [stylePart, { text: userMessage }] },
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.3
            }
        });

        const rewrittenPrompt = result.text.trim();
        return rewrittenPrompt.length > 5 ? rewrittenPrompt : currentPrompt; // Fallback to original
    } catch (error) {
        throw handleError(error, language);
    }
};

// Helper function to get ULTRA-AGGRESSIVE aspect ratio composition guidance
const getAspectRatioGuidance = (aspectRatio: string, language: 'en' | 'it' = 'en'): string => {
    // v1.0 UPDATE: Now using native imageConfig.aspectRatio parameter for specific ratios
    // Text guidance is only needed for "Auto" mode (to match reference image aspect ratio)
    // For specific ratios (1:1, 16:9, etc.) the API handles it natively - no text tricks needed!

    if (aspectRatio === 'Auto') {
        // Auto mode: tell the model to match reference image's aspect ratio
        if (language === 'it') {
            return "Mantieni le stesse proporzioni dell'immagine di riferimento. Riempi tutto il fotogramma senza bande vuote.";
        } else {
            return "Match the aspect ratio of the reference image. Fill the entire frame with no empty borders.";
        }
    }

    // For specific aspect ratios, the native imageConfig.aspectRatio handles it
    // We only add a minimal reminder to fill the frame (helps avoid white bars)
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
const aggressiveCropAndResize = (imageDataUrl: string, targetAspectRatio: string): Promise<string> => {
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
            console.log(`[Aspect Ratio Processing] Target: ${targetAspectRatio}, Original size: ${img.width}x${img.height}, Borders detected: T${borders.top} B${borders.bottom} L${borders.left} R${borders.right}`);

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

            // Step 5: Calculate optimal output dimensions (always maximize to 2048px on longest side)
            // This ensures we ALWAYS get maximum resolution regardless of aspect ratio
            const MIN_DIMENSION = 1024; // Minimum size for shorter dimension
            const MAX_DIMENSION = 2048; // Maximum size for longer dimension

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
            console.log(`[Aspect Ratio Processing] Final output: ${outputWidth}x${outputHeight} (ratio: ${(outputWidth/outputHeight).toFixed(3)}, target: ${targetRatio.toFixed(3)})`);

            // Return as high-quality PNG
            resolve(canvas.toDataURL('image/png', 1.0));
        };
        img.onerror = reject;
        img.src = imageDataUrl;
    });
};

// Helper function to enrich user prompt with explicit "Image 1", "Image 2" references
const enrichPromptWithImageReferences = async (
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
            model: 'gemini-2.5-flash',
            contents: { parts: [...imageParts, { text: analysisPrompt }] },
            config: { temperature: 0.1 }
        });

        const subjects = analysisResult.text.trim();

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
            model: 'gemini-2.5-flash',
            contents: { parts: [{ text: enrichmentPrompt }] },
            config: { temperature: 0.2 }
        });

        const enrichedPrompt = enrichmentResult.text.trim();

        // Fallback: se il prompt arricchito è troppo corto o sembra invalido, usa l'originale
        if (enrichedPrompt.length < 10 || !enrichedPrompt.toLowerCase().includes('image')) {
            console.warn('Enrichment failed, using original prompt');
            return userPrompt;
        }

        console.log('✅ Prompt enriched with explicit references:', enrichedPrompt);
        return enrichedPrompt;

    } catch (error) {
        console.warn('Error enriching prompt, using original:', error);
        return userPrompt; // Fallback to original on error
    }
};

// Helper function to extract style description from style image
const extractStyleDescription = async (styleFile: File, userApiKey: string | null, language: 'en' | 'it' = 'en'): Promise<string> => {
    try {
        const ai = getAiClient(userApiKey);
        const stylePart = await fileToGenerativePart(styleFile);
        
        const promptText = language === 'it'
            ? "Analizza questa immagine e descrivi SOLO gli elementi stilistici: palette di colori, tipo di illuminazione, atmosfera/mood, stile fotografico o artistico, texture. NON descrivere i soggetti o gli oggetti presenti, solo lo stile visivo. Sii conciso (max 2-3 frasi)."
            : "Analyze this image and describe ONLY the stylistic elements: color palette, lighting type, mood/atmosphere, photographic or artistic style, textures. DO NOT describe the subjects or objects present, only the visual style. Be concise (max 2-3 sentences).";
        
        const result = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [stylePart, { text: promptText }] },
            config: { temperature: 0.3 }
        });
        
        return result.text.trim();
    } catch (error) {
        console.error("Failed to extract style description:", error);
        return "";
    }
};

// v1.0: Cost calculator for PRO model
// Pricing from: https://ai.google.dev/gemini-api/docs/pricing#gemini-3-pro-image-preview
export const calculateEstimatedCost = (model: ModelType, resolution: ResolutionType, referenceCount: number): number => {
    if (model === 'gemini-2.5-flash-image') {
        return 0.039; // Flash is cheap and flat rate
    }

    // Nano Banana PRO pricing (Standard tier)
    const inputImageCost = referenceCount * 0.0011; // $0.0011 per reference image
    const promptCost = 0.002; // ~$2 per million tokens, estimate 1000 tokens = $0.002

    let outputCost = 0;
    if (resolution === '4k') {
        outputCost = 0.24; // $0.24 per 4K image
    } else {
        outputCost = 0.134; // $0.134 per 1K-2K image
    }

    return inputImageCost + promptCost + outputCost;
};

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
    textInImage?: TextInImageConfig
): Promise<string> => {
    try {
        const ai = getAiClient(userApiKey);

        /*
         * SCENARI SUPPORTATI:
         * 1. 0 reference images → generazione text-to-image pura (solo prompt utente)
         * 2. 1 reference image → generazione basata su singola reference
         * 3. 2+ reference images → combining con enrichment automatico "Image 1", "Image 2"
         * 4. + style image (opzionale) → estratta come descrizione testuale, aggiunta al prompt
         * 5. + structure image (opzionale) → aggiunta come ultima immagine, guidance ControlNet-like
         *
         * Nota: style image NON viene aggiunta a imageParts (solo descrizione testuale)
         *       structure image VIENE aggiunta a imageParts come ultima
         */

        const imageParts: any[] = [];

        // Process ONLY reference images (NOT style image)
        for (const file of referenceFiles) {
            imageParts.push(await fileToGenerativePart(file));
        }

        // STEP 1: Enrich user prompt with explicit "Image 1", "Image 2" references (if multiple references)
        let enrichedPrompt = prompt;
        if (referenceFiles.length > 1) {
            enrichedPrompt = await enrichPromptWithImageReferences(prompt, referenceFiles, userApiKey, language);
        }

        // v1.0: Aspect ratio is now handled natively via imageConfig.aspectRatio
        // Text guidance is minimal - just a reminder to fill the frame
        const aspectRatioGuidance = getAspectRatioGuidance(aspectRatio, language);
        const instructionParts: string[] = [aspectRatioGuidance];

        const promptLower = prompt.toLowerCase();

        // STEP 2: Optimized multi-image combining guidance (reduced from ~400 to ~150 chars)
        if (referenceFiles.length > 1) {
            const imageListText = language === 'it'
                ? referenceFiles.map((_, idx) => `Immagine ${idx + 1}`).join(', ')
                : referenceFiles.map((_, idx) => `Image ${idx + 1}`).join(', ');

            instructionParts.push(language === 'it'
                ? `⚠️ COMBINA tutti gli elementi da ${imageListText} in una scena coerente. Include il soggetto principale di ogni immagine.`
                : `⚠️ COMBINE all elements from ${imageListText} into one coherent scene. Include the main subject from each image.`);
        }

        // STEP 3: Detect contextual relationship keywords and add micro-guidance (only for multi-image)
        if (referenceFiles.length > 1) {
            // Italian keywords
            if (promptLower.includes('sulla') || promptLower.includes('sul') ||
                promptLower.includes('on the') || promptLower.includes('on ')) {
                instructionParts.push(language === 'it'
                    ? `Applica l'elemento come texture/overlay.`
                    : `Apply the element as texture/overlay.`);
            } else if (promptLower.includes('con') || promptLower.includes('with')) {
                instructionParts.push(language === 'it'
                    ? `Aggiungi l'elemento nella scena.`
                    : `Add the element to the scene.`);
            } else if (promptLower.includes(' in ') || promptLower.includes('dentro')) {
                instructionParts.push(language === 'it'
                    ? `Posiziona l'elemento nel contesto.`
                    : `Place the element in the context.`);
            }
        }

        // Extract style description from style image (if provided) and add to prompt text
        // v0.7.1 FIX: Make explicit that style should be APPLIED to reference subjects
        // v0.7.2 FIX: Log warning when style extraction fails
        let styleDescription = "";
        if (styleFile) {
            styleDescription = await extractStyleDescription(styleFile, userApiKey, language);
            if (styleDescription) {
                // If there are reference images, explicitly tell AI to apply style TO them
                if (referenceFiles.length > 0) {
                    instructionParts.push(language === 'it'
                        ? `🎨 APPLICA STILE: Usa i soggetti dalle immagini di riferimento MA con questo stile: ${styleDescription}. I prodotti/persone restano quelli delle reference, ma adotta palette, illuminazione e mood dello stile.`
                        : `🎨 APPLY STYLE: Use subjects from reference images BUT with this style: ${styleDescription}. Products/people remain from references, but adopt palette, lighting and mood from style.`);
                } else {
                    // No references, just apply the style to the prompt
                    instructionParts.push(language === 'it'
                        ? `🎨 Stile: ${styleDescription}`
                        : `🎨 Style: ${styleDescription}`);
                }
            } else {
                // Style extraction failed - log warning (user will still see style image in generation)
                console.warn('⚠️ Style extraction failed, style image will be used visually without text description');
            }
        }

        // STEP 4: Add structure guidance if structure image is provided
        // ControlNet-inspired: treat structure as spatial conditioning map
        if (structureFile) {
            // Add structure image to imageParts for visual reference
            imageParts.push(await fileToGenerativePart(structureFile));

            // Aggressive ControlNet-style guidance: lock spatial layout, depth, edges
            const structureGuidanceText = referenceFiles.length > 0
                ? (language === 'it'
                    ? `🏗️ CONTROLNET MODE: L'ultima immagine è una MAPPA DI CONDIZIONAMENTO SPAZIALE (come depth/edge map in ControlNet). Rispetta MILLIMETRICAMENTE: posizione di ogni elemento, profondità relativa, angolatura camera, linee di composizione, proporzioni geometriche. Sovrapposizione ESATTA degli elementi delle reference sulla struttura di questa mappa. IGNORA colori/stile della mappa, USA SOLO la sua geometria.`
                    : `🏗️ CONTROLNET MODE: Last image is a SPATIAL CONDITIONING MAP (like depth/edge map in ControlNet). Respect MILLIMETER-PRECISE: position of each element, relative depth, camera angle, composition lines, geometric proportions. EXACT overlay of reference elements onto this map's structure. IGNORE map's colors/style, USE ONLY its geometry.`)
                : (language === 'it'
                    ? `🏗️ CONTROLNET MODE: Immagine = MAPPA DI CONDIZIONAMENTO SPAZIALE. Rispetta ESATTAMENTE: layout, profondità, angolo, geometria. Sovrapposizione millimetrica.`
                    : `🏗️ CONTROLNET MODE: Image = SPATIAL CONDITIONING MAP. Respect EXACTLY: layout, depth, angle, geometry. Millimeter overlay.`);

            instructionParts.push(structureGuidanceText);
        }

        // STEP 5: Add Precise Reference guidance if enabled (v0.7 feature)
        if (preciseReference && referenceFiles.length > 0) {
            const preciseReferenceGuidance = language === 'it'
                ? `🎯 PRECISO: Mantieni IDENTICI i tratti del viso, pelle, occhi, naso, capelli dalle reference. Fedeltà massima.`
                : `🎯 PRECISE: Keep face features, skin, eyes, nose, hair IDENTICAL to references. Maximum fidelity.`;

            instructionParts.push(preciseReferenceGuidance);
            console.log('🎯 Precise Reference Mode: ACTIVE');
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
            console.log('📝 Text-in-Image Mode: ACTIVE -', textInImage.text);
        }

        // Build full prompt with enriched user prompt
        let fullPrompt = instructionParts.length > 0
            ? `${instructionParts.join(' ')} ${enrichedPrompt}`
            : enrichedPrompt;

        if (negativePrompt && negativePrompt.trim() !== '') {
            fullPrompt += ` --no ${negativePrompt.trim()}`;
        }

        console.log(`📏 Prompt length: ${fullPrompt.length} chars`);

        // CRITICAL: Images must come BEFORE text for proper reference interpretation
        const parts: any[] = [...imageParts, { text: fullPrompt }];

        const config: any = {
            responseModalities: [Modality.IMAGE],
            // NOTE: outputOptions/outputMimeType NOT supported in GenerateContentConfig
            // Gemini Image models return PNG by default (verified in SDK types)

            // v1.0.2: Commenting out safetySettings - testing if explicit BLOCK_NONE causes issues
            // Theory: LM Arena might NOT set safetySettings at all, using model defaults instead
            // safetySettings: [
            //     { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
            //     { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
            //     { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
            //     { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
            // ],
        };

        // Add imageConfig with aspect ratio
        // NOTE: personGeneration is NOT supported in @google/genai SDK (only in Vertex AI)
        // LM Arena likely uses Vertex AI which has this parameter, but we can't use it here
        if (aspectRatio !== 'Auto') {
            config.imageConfig = {
                aspectRatio: aspectRatio
            };
        }

        // v1.0: Resolution for PRO model
        // NOTE: imageSize is NOT supported in GenerateContentConfig.imageConfig (only in GenerateImagesConfig for Imagen)
        // For Gemini Image models, resolution may need to be controlled via prompt or is not yet configurable
        if (model === 'gemini-3-pro-image-preview' && resolution) {
            console.log(`🎨 PRO Mode: Target resolution ${resolution.toUpperCase()} (via model default, not API param)`);
        }

        if (seed && /^\d+$/.test(seed)) {
            config.seed = parseInt(seed, 10);
        }

        console.log(`🚀 Model: ${model} | Resolution: ${resolution} | References: ${referenceFiles.length}`);
        console.log(`🔧 Config:`, JSON.stringify(config, null, 2));

        // Retry logic for IMAGE_RECITATION and IMAGE_OTHER (often false positives)
        const MAX_RETRIES = 5; // Increased retries for better success rate
        let lastError: any = null;
        let result: any = null;

        for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
            try {
                result = await ai.models.generateContent({
                    model: model, // v1.0: Use selected model
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
                    continue; // Retry
                }

                // If we got here, either success or final attempt with error
                break;
            } catch (error) {
                lastError = error;
                if (attempt < MAX_RETRIES - 1) {
                    console.warn(`⚠️ Error on attempt ${attempt + 1}/${MAX_RETRIES}, retrying...`, error);
                    await new Promise(resolve => setTimeout(resolve, 500 * Math.pow(2, attempt)));
                    continue;
                }
                // Final attempt failed, throw error
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
                if (aspectRatio === 'Auto') {
                    return originalImageDataUrl;
                }

                // Apply crop and resize for specific aspect ratios
                const finalImageDataUrl = await aggressiveCropAndResize(originalImageDataUrl, aspectRatio);
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
            if (part.inlineData) {
                const base64ImageBytes: string = part.inlineData.data;
                return `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
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
            if (part.inlineData) {
                const base64ImageBytes: string = part.inlineData.data;
                return `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
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
            model: 'gemini-2.5-flash',
            contents: { parts: [...imageParts, { text: userMessage }] },
            config: {
                systemInstruction,
                temperature: 0.1,
                topP: 0.95
            }
        });
        
        const negativePrompt = result.text.trim().replace(/negative prompt: /i, '');
        return negativePrompt || "text, watermark, blurry, low quality, ugly, deformed";

    } catch (error) {
        throw handleError(error, language);
    }
};

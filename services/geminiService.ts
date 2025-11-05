import { GoogleGenAI, Type, Modality, HarmCategory, HarmBlockThreshold } from "@google/genai";
import { DynamicTool } from '../types';

const DEFAULT_API_KEY = import.meta.env.VITE_API_KEY;

if (!DEFAULT_API_KEY) {
  console.warn("VITE_API_KEY environment variable not set. Users must provide their own API key.");
}

const getAiClient = (userApiKey?: string | null) => {
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


const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

export const generatePromptsFromImage = async (imageFiles: File[], styleFile: File | null, userApiKey?: string | null, language: 'en' | 'it' = 'en'): Promise<string[]> => {
  try {
    if (imageFiles.length === 0 && !styleFile) return [];
    const ai = getAiClient(userApiKey);
    
    const imageParts = [];
    for (const file of imageFiles) {
        imageParts.push(await fileToGenerativePart(file));
    }
    if (styleFile) {
        imageParts.push(await fileToGenerativePart(styleFile));
    }
    
    const stylePromptPart = styleFile 
        ? (language === 'it' ? "Applica lo stile visivo (colori, illuminazione, atmosfera) dell'immagine di stile fornita a questi scenari." : "Apply the visual style (colors, lighting, mood) from the provided style image to these scenarios.")
        : "";

    const promptText = language === 'it'
      ? `Sei un art director senior e un esperto di fotografia pubblicitaria per agenzie di comunicazione. Analizza TUTTI i soggetti e gli elementi in TUTTE le immagini di riferimento fornite. Il tuo obiettivo è creare 3 prompt distinti per immagini pubblicitarie professionali che COMBININO in modo creativo i soggetti delle diverse immagini. ${stylePromptPart}

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
      : `You are a senior art director and expert in advertising photography for communication agencies. Analyze ALL subjects and elements in ALL provided reference images. Your goal is to create 3 distinct prompts for professional advertising images that creatively COMBINE the subjects from different images. ${stylePromptPart}

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

export const generateSinglePromptFromImage = async (imageFiles: File[], styleFile: File | null, userApiKey?: string | null, language: 'en' | 'it' = 'en'): Promise<string> => {
  try {
    if (imageFiles.length === 0 && !styleFile) return '';
    const ai = getAiClient(userApiKey);
    
    const imageParts = [];
    for (const file of imageFiles) {
        imageParts.push(await fileToGenerativePart(file));
    }
    if (styleFile) {
        imageParts.push(await fileToGenerativePart(styleFile));
    }

    const stylePromptPart = styleFile 
        ? (language === 'it' ? "Applica lo stile visivo (colori, illuminazione, atmosfera) dell'immagine di stile fornita a questo scenario." : "Apply the visual style (colors, lighting, mood) from the provided style image to this scenario.")
        : "";

    const promptText = language === 'it'
      ? `Sei un art director e un esperto di prompt per la generazione di immagini pubblicitarie. Analizza TUTTI i soggetti e gli elementi in TUTTE le immagini di riferimento fornite. Il tuo obiettivo è creare UN UNICO prompt per un'immagine pubblicitaria professionale e creativa che COMBINI in modo intelligente e artistico i soggetti delle diverse immagini. Invece di descrivere semplicemente le immagini, immagina uno scenario di advertising ideale che unisca i soggetti. ${stylePromptPart} Sii dettagliato e mira a produrre un'immagine di alta qualità. Restituisci solo la stringa del prompt.`
      : `You are an art director and an expert prompt engineer for advertising imagery. Analyze ALL subjects and elements in ALL provided reference images. Your goal is to create A SINGLE professional and creative advertising image prompt that intelligently and artistically COMBINES the subjects from the different images. Instead of just describing the images, imagine an ideal advertising scenario that merges the subjects. ${stylePromptPart} Be detailed and aim to produce a high-quality image. Return only the prompt string.`;
      
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

export const enhancePrompt = async (currentPrompt: string, imageFiles: File[], styleFile: File | null, userApiKey?: string | null, language: 'en' | 'it' = 'en'): Promise<string> => {
    try {
        const ai = getAiClient(userApiKey);
        const imageParts = [];
        for (const file of imageFiles) {
            imageParts.push(await fileToGenerativePart(file));
        }
        if (styleFile) {
            imageParts.push(await fileToGenerativePart(styleFile));
        }

        const systemInstruction = language === 'it'
            ? `Sei un esperto di prompt per la generazione di immagini pubblicitarie. Il tuo compito è migliorare il prompt dell'utente. REGOLA FONDAMENTALE: DEVI MANTENERE intatti tutti i soggetti principali, le azioni e le ambientazioni specificate dall'utente (es. se l'utente scrive "donna seduta su una panchina in palestra", la donna, la panchina e la palestra DEVONO rimanere nel prompt finale). Il tuo miglioramento deve AGGIUNGERE dettagli descrittivi, evocativi e professionali (come stile fotografico, illuminazione, angolo di ripresa, atmosfera) attorno alla richiesta originale, senza snaturarla. Analizza anche le immagini fornite per incorporare dettagli pertinenti di stile, soggetto e atmosfera. Restituisci solo il prompt migliorato.`
            : `You are an expert prompt engineer for advertising imagery. Your task is to enhance the user's prompt. CRITICAL RULE: You MUST KEEP all main subjects, actions, and settings specified by the user intact (e.g., if the user writes "woman sitting on a bench in a gym," the woman, the bench, and the gym MUST remain in the final prompt). Your enhancement should ADD descriptive, evocative, and professional details (like photographic style, lighting, camera angle, mood) around the original request, without distorting it. Also, analyze the provided images to incorporate relevant details of style, subject, and mood. Return only the improved prompt.`;

        const result = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [...imageParts, { text: `User prompt to enhance: "${currentPrompt}"` }] },
            config: { 
                systemInstruction, 
                temperature: 0.4 
            }
        });
        return result.text.trim();
    } catch (error) { throw handleError(error, language); }
}

export const generateDynamicToolsFromImage = async (imageFiles: File[], styleFile: File | null, userApiKey?: string | null, language: 'en' | 'it' = 'en'): Promise<DynamicTool[]> => {
    try {
        if (imageFiles.length === 0 && !styleFile) return [];
        const ai = getAiClient(userApiKey);
        
        const imageParts = [];
        for (const file of imageFiles) {
            imageParts.push(await fileToGenerativePart(file));
        }
        if (styleFile) {
            imageParts.push(await fileToGenerativePart(styleFile));
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
    const [w, h] = aspectRatio.split(':').map(Number);
    const ratio = w / h;
    
    if (language === 'it') {
        if (ratio >= 1.2) { // Landscape (4:3 = 1.333, 16:9 = 1.777, etc)
            return "⚠️ IMPORTANTE - RIEMPI TUTTO IL FOTOGRAMMA ORIZZONTALE: NO bande bianche, NO bordi vuoti, NO letterboxing! ESTENDI la scena da BORDO A BORDO orizzontalmente. Composizione PANORAMICA AMPIA che occupa TUTTA la larghezza. Crop stretto. Wall-to-wall. Edge-to-edge. ZERO spazio vuoto ai lati.";
        } else if (ratio <= 0.85) { // Portrait (3:4 = 0.75, 9:16 = 0.5625, etc)
            return "⚠️ IMPORTANTE - RIEMPI TUTTO IL FOTOGRAMMA VERTICALE: NO bande bianche, NO bordi vuoti, NO pillarboxing! ESTENDI la scena da ALTO A BASSO verticalmente. Composizione VERTICALE ALTA che occupa TUTTA l'altezza. Crop stretto. Top-to-bottom. Edge-to-edge. ZERO spazio vuoto sopra/sotto.";
        } else { // Square-ish (1:1 and close ratios)
            return "⚠️ IMPORTANTE - RIEMPI TUTTO IL FOTOGRAMMA QUADRATO: NO bande bianche, NO bordi vuoti! ESTENDI la scena da bordo a bordo in TUTTE le direzioni. Tight crop. Edge-to-edge. ZERO spazio vuoto.";
        }
    } else {
        if (ratio >= 1.2) { // Landscape (4:3 = 1.333, 16:9 = 1.777, etc)
            return "⚠️ CRITICAL - FILL ENTIRE HORIZONTAL FRAME: NO white bars, NO empty borders, NO letterboxing! EXTEND scene EDGE-TO-EDGE horizontally. WIDE PANORAMIC composition occupying FULL width. Tight crop. Wall-to-wall. ZERO empty space on sides.";
        } else if (ratio <= 0.85) { // Portrait (3:4 = 0.75, 9:16 = 0.5625, etc)
            return "⚠️ CRITICAL - FILL ENTIRE VERTICAL FRAME: NO white bars, NO empty borders, NO pillarboxing! EXTEND scene TOP-TO-BOTTOM vertically. TALL VERTICAL composition occupying FULL height. Tight crop. Edge-to-edge. ZERO empty space above/below.";
        } else { // Square (1:1 and close ratios)
            return "⚠️ CRITICAL - FILL ENTIRE SQUARE FRAME: NO white bars, NO empty borders! EXTEND scene edge-to-edge in ALL directions. Tight crop. ZERO empty space.";
        }
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

// Helper function to implement retry logic with exponential backoff
const retryWithBackoff = async <T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    initialDelay: number = 1000
): Promise<T> => {
    let lastError: any;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error: any) {
            lastError = error;
            
            // Don't retry if it's a safety block or authentication error
            if (error.promptFeedback?.blockReason === 'SAFETY' || 
                error.message?.includes('API Key') ||
                error.message?.includes('authentication')) {
                throw error;
            }
            
            // If this is not the last attempt, wait before retrying
            if (attempt < maxRetries - 1) {
                const delay = initialDelay * Math.pow(2, attempt);
                console.log(`Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }
    
    throw lastError;
};

export const generateImage = async (prompt: string, aspectRatio: string, referenceFiles: File[], styleFile: File | null, userApiKey: string | null, negativePrompt?: string, seed?: string, language: 'en' | 'it' = 'en'): Promise<string> => {
    try {
        const ai = getAiClient(userApiKey);
        
        const imageParts: any[] = [];
        
        // Process ONLY reference images (NOT style image)
        for (const file of referenceFiles) {
            imageParts.push(await fileToGenerativePart(file));
        }

        // Aspect ratio guidance (simplified)
        const aspectRatioGuidance = getAspectRatioGuidance(aspectRatio, language);
        
        const instructionParts: string[] = [aspectRatioGuidance];
        
        if (referenceFiles.length > 0) {
            const imageCountText = language === 'it'
                ? `Hai ricevuto ESATTAMENTE ${referenceFiles.length} ${referenceFiles.length === 1 ? 'immagine di riferimento' : 'immagini di riferimento'}.`
                : `You have received EXACTLY ${referenceFiles.length} reference ${referenceFiles.length === 1 ? 'image' : 'images'}.`;
            
            const imageListText = language === 'it'
                ? referenceFiles.map((_, idx) => `Immagine ${idx + 1}`).join(', ')
                : referenceFiles.map((_, idx) => `Image ${idx + 1}`).join(', ');
            
            instructionParts.push(language === 'it' 
                ? `⚠️ IMPERATIVO CRITICO - USA TUTTI I SOGGETTI DA TUTTE LE IMMAGINI: ${imageCountText} Le immagini sono: ${imageListText}. DEVI includere gli elementi principali da OGNI SINGOLA immagine nella composizione finale. NON ignorare nessuna immagine! NON concentrarti solo sulla prima! Analizza SEPARATAMENTE ogni immagine e identifica il suo soggetto principale, poi COMBINA tutti i soggetti in una scena coerente. Se vedi un personaggio in un'immagine E un oggetto in un'altra, ENTRAMBI devono apparire insieme. Le immagini NON sono alternative tra cui scegliere, ma elementi da COMBINARE obbligatoriamente. Tratta ogni immagine con uguale importanza!`
                : `⚠️ CRITICAL IMPERATIVE - USE ALL SUBJECTS FROM ALL IMAGES: ${imageCountText} The images are: ${imageListText}. You MUST include the main elements from EACH AND EVERY image in the final composition. DO NOT ignore any image! DO NOT focus only on the first one! Analyze EACH image SEPARATELY and identify its main subject, then COMBINE all subjects into a coherent scene. If you see a character in one image AND an object in another, BOTH must appear together. The images are NOT alternatives to choose from, but elements to MANDATORILY COMBINE. Treat each image with equal importance!`);
        }

        // Extract style description from style image (if provided) and add to prompt text
        let styleDescription = "";
        if (styleFile) {
            styleDescription = await extractStyleDescription(styleFile, userApiKey, language);
            if (styleDescription) {
                instructionParts.push(language === 'it' 
                    ? `Applica questo stile visivo: ${styleDescription}` 
                    : `Apply this visual style: ${styleDescription}`);
            }
        }
        
        // Build full prompt
        let fullPrompt = `${instructionParts.join(' ')} ${prompt}`;
       
        if (negativePrompt && negativePrompt.trim() !== '') {
            fullPrompt += ` --no ${negativePrompt.trim()}`;
        }

        // CRITICAL: Images must come BEFORE text for proper reference interpretation
        const parts: any[] = [...imageParts, { text: fullPrompt }];
        
        const config: any = {
            responseModalities: [Modality.IMAGE],
            outputOptions: {
                mimeType: 'image/png',
                compressionQuality: 100
            },
            safetySettings: [
                { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
            ],
        };

        if (seed && /^\d+$/.test(seed)) {
            config.seed = parseInt(seed, 10);
        }

        const result = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts },
            config: config as any,
        });

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
                    const message = language === 'it'
                        ? `Generazione interrotta (${finishReason}). Il modello potrebbe non riuscire a combinare queste immagini. Prova con: 1) Immagini più semplici 2) Prompt più breve 3) Meno immagini di riferimento.`
                        : `Generation stopped (${finishReason}). The model may not be able to combine these images. Try: 1) Simpler images 2) Shorter prompt 3) Fewer reference images.`;
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
                
                // Apply crop and resize
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

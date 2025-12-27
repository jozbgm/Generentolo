/**
 * 🚀 REVOLUTIONARY PROMPT ENHANCEMENT SYSTEM v2.0
 *
 * Inspired by industry leaders:
 * - Civitai Florence2 (vision-aware image captioning)
 * - Kling AI 2.1 (DeepSeek-powered multi-step enhancement)
 * - ComfyUI Local_LLM_Prompt_Enhancer (platform-specific optimization)
 * - OpenArt Prompt Wizard (guided progressive elaboration)
 * - CO-STAR Framework (Context, Objective, Style, Tone, Audience, Response)
 *
 * KEY INNOVATIONS:
 * 1. Two-step process: Image Captioning → Prompt Enhancement
 * 2. Vision-aware: Analyzes images BEFORE enhancing
 * 3. Self-evaluation: Model validates quality before returning
 * 4. Platform-optimized: Tailored for Gemini Image Generation
 * 5. Advertising-focused: Professional photography/design language
 * 6. Hyper-realistic default: Always photorealistic unless explicitly stated otherwise
 */

import { getAiClient, fileToGenerativePart } from './geminiService';

interface EnhancementResult {
    enhancedPrompt: string;
    imageAnalysis?: string;
    qualityScore?: number;
    method: 'vision-aware' | 'standard' | 'fallback';
}

/**
 * STEP 1: Vision Analysis (Image Captioning)
 * Analyzes all reference images to understand visual context
 */
async function analyzeImages(
    imageFiles: File[],
    styleFile: File | null,
    structureFile: File | null,
    userApiKey?: string | null,
    language: 'en' | 'it' = 'en'
): Promise<string> {
    const allImages: File[] = [];
    if (imageFiles.length > 0) allImages.push(...imageFiles);
    if (styleFile) allImages.push(styleFile);
    if (structureFile) allImages.push(structureFile);

    if (allImages.length === 0) return '';

    try {
        const ai = getAiClient(userApiKey);
        const visionParts = [];

        for (const file of allImages) {
            visionParts.push(await fileToGenerativePart(file));
        }

        const captionPrompt = language === 'it'
            ? `Analizza queste immagini come un fotografo pubblicitario professionista.

Descrivi in modo conciso (max 3 frasi):
1. SOGGETTI PRINCIPALI: persone, prodotti, oggetti (aspetto, stile, mood)
2. STILE VISIVO: illuminazione, composizione, palette colori
3. ESTETICA: mood/atmosfera, qualità fotografica, setting

Sii specifico e tecnico. Focus su dettagli utili per generare immagini simili.`
            : `Analyze these images as a professional advertising photographer.

Describe concisely (max 3 sentences):
1. MAIN SUBJECTS: people, products, objects (appearance, style, mood)
2. VISUAL STYLE: lighting, composition, color palette
3. AESTHETIC: mood/atmosphere, photo quality, setting

Be specific and technical. Focus on details useful for generating similar images.`;

        const result = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [...visionParts, { text: captionPrompt }] },
            config: {
                temperature: 0.4, // Low temp for accurate description
                maxOutputTokens: 300
            }
        });

        if (result && result.text) {
            const analysis = result.text.trim();
            console.log('🎨 Image Analysis:', analysis);
            return analysis;
        }
    } catch (error) {
        console.warn('⚠️ Image analysis failed:', error);
    }

    return '';
}

/**
 * STEP 2: CO-STAR Framework Prompt Enhancement
 * Context, Objective, Style, Tone, Audience, Response
 */
export async function enhancePromptV2(
    currentPrompt: string,
    imageFiles: File[],
    styleFile: File | null,
    structureFile: File | null,
    userApiKey?: string | null,
    language: 'en' | 'it' = 'en'
): Promise<EnhancementResult> {
    try {
        const ai = getAiClient(userApiKey);

        // STEP 1: Image Analysis (vision-aware)
        const imageAnalysis = await analyzeImages(imageFiles, styleFile, structureFile, userApiKey, language);

        const hasImages = imageFiles.length > 0 || styleFile || structureFile;
        const hasReference = imageFiles.length > 0;
        const hasStyle = !!styleFile;
        const hasStructure = !!structureFile;

        // Build image context description
        let imageContext = '';
        if (hasImages) {
            const parts = [];
            if (hasReference) parts.push(language === 'it' ? `${imageFiles.length} immagine/i di riferimento (soggetti da preservare)` : `${imageFiles.length} reference image(s) (subjects to preserve)`);
            if (hasStyle) parts.push(language === 'it' ? '1 immagine di stile (estetica da applicare)' : '1 style image (aesthetic to apply)');
            if (hasStructure) parts.push(language === 'it' ? '1 immagine struttura (composizione da preservare)' : '1 structure image (composition to preserve)');

            imageContext = language === 'it'
                ? `L'utente ha fornito: ${parts.join(', ')}.`
                : `User provided: ${parts.join(', ')}.`;

            if (imageAnalysis) {
                imageContext += language === 'it'
                    ? `\n\nANALISI VISIVA: ${imageAnalysis}`
                    : `\n\nVISUAL ANALYSIS: ${imageAnalysis}`;
            }
        }

        // CO-STAR System Instruction (Advertising-focused, Hyper-realistic default)
        const costarSystemInstruction = language === 'it'
            ? `# RUOLO
Sei un Senior Creative Director & Prompt Engineer specializzato in immagini pubblicitarie di alta gamma per fashion, design, product photography e advertising campaigns.

# CONTESTO
${imageContext || 'Nessuna immagine di riferimento fornita.'}

# OBIETTIVO
Trasforma il prompt dell'utente in una descrizione fotografica professionale ottimizzata per Gemini Image AI, mantenendo l'intento originale ma aggiungendo dettagli tecnici da fotografo commerciale di livello mondiale.

# TARGET AUDIENCE
Grafici pubblicitari, art director, fashion photographers, product designers che necessitano di immagini:
- Iper-realistiche e fotografiche (default)
- Alta qualità tecnica (8K, professional camera)
- Mood pubblicitario/commerciale
- Composizione bilanciata e professionale

# REGOLE OBBLIGATORIE

## 1. PRESERVAZIONE
- MANTIENI intatti i soggetti, azioni, ambientazioni del prompt originale
- NON alterare l'intento creativo dell'utente
- ${hasReference ? 'PRESERVA i soggetti dalle immagini di riferimento' : ''}
- ${hasStyle ? 'APPLICA lo stile visivo (colori, mood, estetica) dall\'immagine di stile' : ''}
- ${hasStructure ? 'MANTIENI la composizione spaziale dell\'immagine struttura' : ''}

## 2. DETTAGLI TECNICI OBBLIGATORI (aggiungi ALMENO 5)
- **Illuminazione fotografica**: golden hour light, soft studio lighting, dramatic Rembrandt lighting, natural window light, professional 3-point lighting, backlit with rim light
- **Camera & Lens**: shot on Sony A7R IV, 85mm f/1.4, shallow depth of field, tack-sharp focus, professional photography, medium format camera
- **Angolo camera**: eye-level shot, low angle hero shot, overhead flat lay, 3/4 angle product shot, aerial view, dutch angle
- **Composizione**: rule of thirds, centered composition, negative space, leading lines, golden ratio, balanced frame
- **Qualità fotografica**: 8K ultra HD, photorealistic, hyperrealistic details, crisp sharp focus, professional color grading, cinema-quality
- **Mood/Atmosfera**: serene and elegant, energetic and vibrant, moody and dramatic, clean and minimal, warm and inviting
- **Color grading**: warm golden tones, cool cinematic blues, vibrant saturated colors, muted pastel palette, high-contrast monochrome
- **Texture & materiali**: smooth skin texture, rough fabric detail, glossy reflective surface, matte finish, natural grain

## 3. STILE IPER-REALISTICO (default se non specificato diversamente)
- Usa SEMPRE termini fotografici professionali
- Default: "photorealistic, professional photography"
- SOLO se l'utente chiede esplicitamente: illustration, cartoon, painting, 3D render, artistic style
- Altrimenti: tratta come advertising/commercial photography shoot

## 4. LUNGHEZZA & FORMATO
- 70-130 parole (conciso ma descrittivo)
- Linguaggio da fotografo professionista/art director
- Integra i dettagli tecnici in modo naturale nella descrizione
- NO ripetizioni, NO ridondanze, NO parole chiave separate

## 5. OUTPUT QUALITY
Restituisci SOLO il prompt migliorato senza:
- Spiegazioni o commenti
- Markdown o formattazione
- Virgolette o apici
- Prefissi come "Prompt:" o "Enhanced:"

# AUTO-VALUTAZIONE (valuta PRIMA di restituire)
✓ Ho mantenuto i soggetti originali?
✓ Ho aggiunto almeno 5 dettagli tecnici fotografici?
✓ È lungo 70-130 parole?
✓ È significativamente diverso e migliorato rispetto all'originale?
✓ Usa linguaggio professionale da fotografo pubblicitario?
✓ È iper-realistico/fotografico (a meno che non sia richiesto stile artistico)?
${hasStyle ? '✓ Ho applicato l\'estetica dell\'immagine di stile?' : ''}
${hasStructure ? '✓ Ho menzionato di preservare la composizione strutturale?' : ''}

Se una risposta è NO, rielabora completamente prima di restituire.`
            : `# ROLE
You are a Senior Creative Director & Prompt Engineer specialized in high-end advertising imagery for fashion, design, product photography, and advertising campaigns.

# CONTEXT
${imageContext || 'No reference images provided.'}

# OBJECTIVE
Transform the user's prompt into a professional photographic description optimized for Gemini Image AI, preserving original intent but adding world-class commercial photographer technical details.

# TARGET AUDIENCE
Advertising designers, art directors, fashion photographers, product designers who need images that are:
- Hyper-realistic and photographic (default)
- High technical quality (8K, professional camera)
- Commercial/advertising mood
- Balanced professional composition

# MANDATORY RULES

## 1. PRESERVATION
- KEEP original subjects, actions, settings intact
- DO NOT alter user's creative intent
- ${hasReference ? 'PRESERVE subjects from reference images' : ''}
- ${hasStyle ? 'APPLY visual style (colors, mood, aesthetic) from style image' : ''}
- ${hasStructure ? 'MAINTAIN spatial composition from structure image' : ''}

## 2. MANDATORY TECHNICAL DETAILS (add AT LEAST 5)
- **Photographic lighting**: golden hour light, soft studio lighting, dramatic Rembrandt lighting, natural window light, professional 3-point lighting, backlit with rim light
- **Camera & Lens**: shot on Sony A7R IV, 85mm f/1.4, shallow depth of field, tack-sharp focus, professional photography, medium format camera
- **Camera angle**: eye-level shot, low angle hero shot, overhead flat lay, 3/4 angle product shot, aerial view, dutch angle
- **Composition**: rule of thirds, centered composition, negative space, leading lines, golden ratio, balanced frame
- **Photo quality**: 8K ultra HD, photorealistic, hyperrealistic details, crisp sharp focus, professional color grading, cinema-quality
- **Mood/Atmosphere**: serene and elegant, energetic and vibrant, moody and dramatic, clean and minimal, warm and inviting
- **Color grading**: warm golden tones, cool cinematic blues, vibrant saturated colors, muted pastel palette, high-contrast monochrome
- **Texture & materials**: smooth skin texture, rough fabric detail, glossy reflective surface, matte finish, natural grain

## 3. HYPER-REALISTIC STYLE (default unless specified otherwise)
- ALWAYS use professional photography terminology
- Default: "photorealistic, professional photography"
- ONLY if user explicitly requests: illustration, cartoon, painting, 3D render, artistic style
- Otherwise: treat as advertising/commercial photography shoot

## 4. LENGTH & FORMAT
- 70-130 words (concise but descriptive)
- Professional photographer/art director language
- Integrate technical details naturally into description
- NO repetitions, NO redundancy, NO separate keywords

## 5. OUTPUT QUALITY
Return ONLY the enhanced prompt without:
- Explanations or comments
- Markdown or formatting
- Quotes or apostrophes
- Prefixes like "Prompt:" or "Enhanced:"

# SELF-EVALUATION (evaluate BEFORE returning)
✓ Did I preserve original subjects?
✓ Did I add at least 5 photographic technical details?
✓ Is it 70-130 words long?
✓ Is it significantly different and improved from original?
✓ Does it use professional advertising photographer language?
✓ Is it hyper-realistic/photographic (unless artistic style requested)?
${hasStyle ? '✓ Did I apply the aesthetic from the style image?' : ''}
${hasStructure ? '✓ Did I mention preserving structural composition?' : ''}

If any answer is NO, completely rework before returning.`;

        // STEP 2: Enhancement request
        const enhanceRequest = language === 'it'
            ? `Prompt utente da migliorare:\n"${currentPrompt}"\n\nMigliora questo prompt seguendo rigorosamente tutte le regole. Restituisci SOLO il prompt finale migliorato.`
            : `User prompt to enhance:\n"${currentPrompt}"\n\nEnhance this prompt strictly following all rules. Return ONLY the final enhanced prompt.`;

        const result = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [{ text: enhanceRequest }] },
            config: {
                systemInstruction: costarSystemInstruction,
                temperature: 0.85, // Balanced creativity for professional results
                maxOutputTokens: 450,
                topP: 0.95,
                topK: 40
            }
        });

        if (!result || !result.text) {
            console.warn('⚠️ Enhancement failed, using fallback');
            return {
                enhancedPrompt: applyFallbackEnhancement(currentPrompt, hasStyle, hasStructure, language),
                method: 'fallback'
            };
        }

        let enhancedPrompt = result.text.trim();

        // Clean formatting artifacts
        enhancedPrompt = enhancedPrompt.replace(/^["'`*]+|["'`*]+$/g, '').trim();
        enhancedPrompt = enhancedPrompt.replace(/^(Prompt:|Enhanced:|Migliorato:)\s*/i, '').trim();

        // STEP 3: Quality Validation (self-evaluation)
        const qualityCheck = validateEnhancement(enhancedPrompt, currentPrompt);

        if (!qualityCheck.isValid) {
            console.warn(`⚠️ Quality check failed: ${qualityCheck.reason}, applying fallback`);
            return {
                enhancedPrompt: applyFallbackEnhancement(currentPrompt, hasStyle, hasStructure, language),
                method: 'fallback',
                qualityScore: qualityCheck.score
            };
        }

        console.log(`✨ Prompt enhanced successfully (${currentPrompt.length} → ${enhancedPrompt.length} chars, score: ${qualityCheck.score}/100)`);

        return {
            enhancedPrompt,
            imageAnalysis: imageAnalysis || undefined,
            qualityScore: qualityCheck.score,
            method: hasImages ? 'vision-aware' : 'standard'
        };

    } catch (error) {
        console.error('❌ Enhancement error:', error);
        return {
            enhancedPrompt: currentPrompt,
            method: 'fallback'
        };
    }
}

/**
 * STEP 3: Quality Validation
 * Validates enhancement quality before returning
 */
function validateEnhancement(
    enhanced: string,
    original: string
): { isValid: boolean; score: number; reason?: string } {
    const wordCount = enhanced.split(/\s+/).length;

    // Check 1: Length validation
    if (wordCount < 20) {
        return { isValid: false, score: 20, reason: 'Too short (<20 words)' };
    }
    if (wordCount > 150) {
        return { isValid: false, score: 40, reason: 'Too long (>150 words)' };
    }

    // Check 2: Identical to original
    const normalizedEnhanced = enhanced.toLowerCase().replace(/[^\w\s]/g, '');
    const normalizedOriginal = original.toLowerCase().replace(/[^\w\s]/g, '');
    if (normalizedEnhanced === normalizedOriginal) {
        return { isValid: false, score: 10, reason: 'Identical to original' };
    }

    // Check 3: Technical terms presence (photography vocabulary)
    const technicalTerms = [
        'light', 'lighting', 'shot', 'angle', 'view', 'mood', 'tone', 'color',
        'texture', 'quality', 'professional', 'cinematic', 'photography', 'camera',
        'focus', 'composition', '8k', 'realistic', 'detail', 'grading', 'studio'
    ];
    const technicalTermsFound = technicalTerms.filter(term =>
        enhanced.toLowerCase().includes(term)
    ).length;

    if (technicalTermsFound < 3) {
        return { isValid: false, score: 30, reason: 'Missing technical terms' };
    }

    // Check 4: Photographic quality indicators
    const photoIndicators = ['photorealistic', 'professional photography', 'shot on', 'camera', '8k', 'ultra hd'];
    const hasPhotoQuality = photoIndicators.some(indicator =>
        enhanced.toLowerCase().includes(indicator.toLowerCase())
    );

    // Calculate quality score
    let score = 50; // Base score
    score += Math.min(30, technicalTermsFound * 5); // +5 per technical term (max 30)
    if (hasPhotoQuality) score += 10;
    if (wordCount >= 70 && wordCount <= 130) score += 10; // Ideal length

    return { isValid: true, score };
}

/**
 * Fallback Enhancement (template-based)
 * Simple but reliable enhancement when main system fails
 */
function applyFallbackEnhancement(
    prompt: string,
    hasStyle: boolean,
    hasStructure: boolean,
    language: 'en' | 'it'
): string {
    const additions = language === 'it'
        ? [
            'illuminazione professionale da studio',
            hasStyle ? 'con estetica stilizzata dalle reference' : 'mood cinematografico',
            'inquadratura bilanciata',
            'fotografia professionale',
            'dettagli iper-realistici 8K',
            'colori naturali e bilanciati',
            hasStructure ? 'composizione spaziale preservata' : 'composizione armoniosa'
        ]
        : [
            'professional studio lighting',
            hasStyle ? 'with stylized aesthetic from references' : 'cinematic mood',
            'balanced composition',
            'professional photography',
            'hyper-realistic 8K details',
            'natural balanced colors',
            hasStructure ? 'spatial composition preserved' : 'harmonious composition'
        ];

    return `${prompt}, ${additions.join(', ')}`;
}

// Export as default for backwards compatibility
export default enhancePromptV2;

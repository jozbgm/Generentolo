// v1.4: Style Presets - One-click style applications
export interface StylePreset {
    id: string;
    name: string;
    nameIt: string;
    category: 'artistic' | 'photo' | 'scene' | 'text';
    promptSuffix: string;
    description: string;
    descriptionIt: string;
    icon: string;
}

export const STYLE_PRESETS: StylePreset[] = [
    // Artistic Styles
    {
        id: 'oil-painting',
        name: 'Oil Painting',
        nameIt: 'Pittura a Olio',
        category: 'artistic',
        promptSuffix: ', oil painting style, visible brush strokes, rich textures, classical art',
        description: 'Classical oil painting with visible brush strokes',
        descriptionIt: 'Pittura a olio classica con pennellate visibili',
        icon: '🎨'
    },
    {
        id: 'watercolor',
        name: 'Watercolor',
        nameIt: 'Acquerello',
        category: 'artistic',
        promptSuffix: ', watercolor style, soft edges, flowing colors, artistic paper texture',
        description: 'Soft watercolor painting effect',
        descriptionIt: 'Effetto acquerello morbido',
        icon: '💧'
    },
    {
        id: 'anime',
        name: 'Anime/Manga',
        nameIt: 'Anime/Manga',
        category: 'artistic',
        promptSuffix: ', anime style, manga art, vibrant colors, cel shading, Japanese animation aesthetic',
        description: 'Japanese anime and manga style',
        descriptionIt: 'Stile anime e manga giapponese',
        icon: '🎌'
    },
    {
        id: 'pixel-art',
        name: 'Pixel Art',
        nameIt: 'Pixel Art',
        category: 'artistic',
        promptSuffix: ', pixel art style, retro gaming aesthetic, 8-bit or 16-bit graphics, pixel perfect',
        description: 'Retro pixel art aesthetic',
        descriptionIt: 'Estetica pixel art retrò',
        icon: '👾'
    },
    {
        id: 'vector',
        name: 'Vector Illustration',
        nameIt: 'Illustrazione Vettoriale',
        category: 'artistic',
        promptSuffix: ', vector illustration, clean lines, flat colors, modern graphic design, minimalist',
        description: 'Clean vector graphics style',
        descriptionIt: 'Stile grafico vettoriale pulito',
        icon: '✏️'
    },

    // Photo Styles
    {
        id: 'product-photo',
        name: 'Product Photography',
        nameIt: 'Fotografia di Prodotto',
        category: 'photo',
        promptSuffix: ', professional product photography, clean white background, studio lighting, commercial quality, high resolution',
        description: 'Professional product shot on white',
        descriptionIt: 'Foto prodotto professionale su bianco',
        icon: '📦'
    },
    {
        id: 'portrait-studio',
        name: 'Portrait Studio',
        nameIt: 'Ritratto Studio',
        category: 'photo',
        promptSuffix: ', professional portrait photography, studio lighting, shallow depth of field, bokeh background, professional headshot',
        description: 'Studio portrait with professional lighting',
        descriptionIt: 'Ritratto studio con illuminazione professionale',
        icon: '👤'
    },
    {
        id: 'cinematic',
        name: 'Cinematic Film',
        nameIt: 'Film Cinematografico',
        category: 'photo',
        promptSuffix: ', cinematic film style, movie still, dramatic lighting, color grading, anamorphic lens, film grain',
        description: 'Hollywood movie aesthetic',
        descriptionIt: 'Estetica film di Hollywood',
        icon: '🎬'
    },
    {
        id: 'street-photo',
        name: 'Street Photography',
        nameIt: 'Fotografia di Strada',
        category: 'photo',
        promptSuffix: ', street photography, candid moment, urban environment, natural lighting, documentary style',
        description: 'Candid street photography',
        descriptionIt: 'Fotografia di strada spontanea',
        icon: '🌆'
    },
    {
        id: 'macro',
        name: 'Macro Close-up',
        nameIt: 'Macro Ravvicinato',
        category: 'photo',
        promptSuffix: ', macro photography, extreme close-up, fine details, shallow depth of field, professional macro lens',
        description: 'Extreme close-up details',
        descriptionIt: 'Dettagli ravvicinati estremi',
        icon: '🔬'
    },

    // Scene Types
    {
        id: 'isometric',
        name: 'Isometric Game Asset',
        nameIt: 'Asset Gioco Isometrico',
        category: 'scene',
        promptSuffix: ', isometric view, game asset style, 45-degree angle, clean geometry, video game art',
        description: 'Isometric game graphics',
        descriptionIt: 'Grafica gioco isometrica',
        icon: '🎮'
    },
    {
        id: 'ui-mockup',
        name: 'UI/UX Mockup',
        nameIt: 'Mockup UI/UX',
        category: 'scene',
        promptSuffix: ', UI/UX design mockup, clean interface, modern app design, professional presentation, flat design',
        description: 'Professional interface design',
        descriptionIt: 'Design interfaccia professionale',
        icon: '📱'
    },
    {
        id: 'infographic',
        name: 'Infographic Design',
        nameIt: 'Design Infografica',
        category: 'text',
        promptSuffix: ', infographic design, clear data visualization, professional typography, charts and diagrams, informative layout',
        description: 'Data visualization infographic',
        descriptionIt: 'Infografica visualizzazione dati',
        icon: '📊'
    },
    {
        id: 'social-media',
        name: 'Social Media Post',
        nameIt: 'Post Social Media',
        category: 'scene',
        promptSuffix: ', social media post design, eye-catching, modern aesthetic, Instagram or TikTok style, engaging visual',
        description: 'Viral social media content',
        descriptionIt: 'Contenuto social virale',
        icon: '📱'
    },
    {
        id: 'typography',
        name: 'Typography Art',
        nameIt: 'Arte Tipografica',
        category: 'text',
        promptSuffix: ', typography art, creative lettering, text-based design, bold fonts, graphic design, legible text',
        description: 'Text-focused artistic design',
        descriptionIt: 'Design artistico basato su testo',
        icon: '🔤'
    }
];

export const PHYSICS_PRESETS = {
    lighting: [
        { id: 'soft-studio', name: 'Soft Studio Light', nameIt: 'Luce Studio Morbida', prompt: 'soft studio lighting, diffused light, even illumination' },
        { id: 'golden-hour', name: 'Golden Hour', nameIt: 'Ora Dorata', prompt: 'golden hour lighting, warm sunset glow, soft shadows' },
        { id: 'dramatic', name: 'Dramatic Shadows', nameIt: 'Ombre Drammatiche', prompt: 'dramatic lighting, strong contrast, deep shadows, chiaroscuro' },
        { id: 'neon', name: 'Neon Glow', nameIt: 'Bagliore Neon', prompt: 'neon lighting, vibrant colors, glowing lights, cyberpunk aesthetic' },
        { id: 'natural', name: 'Natural Light', nameIt: 'Luce Naturale', prompt: 'natural daylight, soft window light, realistic lighting' }
    ],
    camera: [
        { id: 'wide-angle', name: 'Wide Angle', nameIt: 'Grandangolo', prompt: 'wide angle lens, expansive view, 24mm focal length' },
        { id: 'portrait-50mm', name: 'Portrait 50mm', nameIt: 'Ritratto 50mm', prompt: 'portrait lens, 50mm focal length, natural perspective' },
        { id: 'macro-closeup', name: 'Macro Close-up', nameIt: 'Macro Ravvicinato', prompt: 'macro lens, extreme close-up, fine details' },
        { id: 'telephoto', name: 'Telephoto', nameIt: 'Teleobiettivo', prompt: 'telephoto lens, compressed perspective, 85mm or 135mm' },
        { id: 'fisheye', name: 'Fisheye', nameIt: 'Fisheye', prompt: 'fisheye lens, spherical distortion, ultra wide view' }
    ],
    focus: [
        { id: 'bokeh', name: 'Bokeh Background', nameIt: 'Sfondo Bokeh', prompt: 'shallow depth of field, bokeh background, subject in sharp focus' },
        { id: 'tack-sharp', name: 'Tack Sharp', nameIt: 'Nitidezza Totale', prompt: 'tack sharp, everything in focus, deep depth of field' },
        { id: 'cinematic-dof', name: 'Cinematic Depth', nameIt: 'Profondità Cinematografica', prompt: 'cinematic depth of field, shallow focus, film aesthetic' },
        { id: 'tilt-shift', name: 'Tilt-Shift', nameIt: 'Tilt-Shift', prompt: 'tilt-shift effect, miniature look, selective focus' },
        { id: 'soft-focus', name: 'Soft Focus', nameIt: 'Fuoco Morbido', prompt: 'soft focus, dreamy aesthetic, slight blur' }
    ]
};

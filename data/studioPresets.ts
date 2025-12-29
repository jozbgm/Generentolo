export interface StudioOption {
    id: string;
    name: string;
    prompt: string;
}

export const CAMERAS: StudioOption[] = [
    { id: 'arri-alexa-35', name: 'Arri Alexa 35', prompt: 'shot on Arri Alexa 35, digital cinema camera style' },
    { id: 'red-v-raptor', name: 'Red V-Raptor', prompt: 'shot on Red V-Raptor, high contrast, sharp details' },
    { id: 'sony-venice-2', name: 'Sony Venice 2', prompt: 'shot on Sony Venice 2, rich skin tones, cinematic color science' },
    { id: 'imax-70mm', name: 'IMAX 70mm', prompt: 'shot on IMAX 70mm film camera, maximum detail, large format look' },
    { id: '16mm-film', name: '16mm Vintage Film', prompt: 'shot on 16mm film, vintage grain, Kodak Portra aesthetic' },
    { id: 'iphone-15-pro', name: 'iPhone 15 Pro', prompt: 'shot on iPhone 15 Pro, mobile photography style, sharp, natural' }
];

export const LENSES: StudioOption[] = [
    { id: 'zeiss-ultra-prime', name: 'Zeiss Ultra Prime', prompt: 'Zeiss Ultra Prime lens, pristine clarity, neutral rendering' },
    { id: 'cooke-s4', name: 'Cooke S4', prompt: 'Cooke S4 lens, warm skin tones, smooth falloff, the Cooke look' },
    { id: 'panavision-anamorphic', name: 'Panavision Anamorphic', prompt: 'Panavision Anamorphic lens, cinematic oval bokeh, horizontal lens flares' },
    { id: 'helios-44', name: 'Helios 44-2', prompt: 'Helios 44-2 lens, swirly bokeh, vintage character, dreamy falloff' },
    { id: 'lensbaby', name: 'Lensbaby', prompt: 'Lensbaby lens, sweet spot focus, artistic blur, creative distortion' }
];

export const FOCAL_LENGTHS: StudioOption[] = [
    { id: '14mm', name: '14mm (Ultra Wide)', prompt: '14mm ultra wide angle lens, expansive perspective' },
    { id: '24mm', name: '24mm (Wide)', prompt: '24mm wide angle lens, professional architectural look' },
    { id: '35mm', name: '35mm (Storyteller)', prompt: '35mm lens, cinematic storytelling perspective' },
    { id: '50mm', name: '50mm (Natural)', prompt: '50mm lens, natural human eye perspective' },
    { id: '85mm', name: '85mm (Portrait)', prompt: '85mm portrait lens, beautiful compression, creamy background' },
    { id: '135mm', name: '135mm (Tele)', prompt: '135mm telephoto lens, extreme subject isolation' }
];

export const LIGHT_DIRECTIONS: StudioOption[] = [
    { id: 'top', name: 'Top (God Rays)', prompt: 'lighting from top, god rays, overhead illumination' },
    { id: 'front', name: 'Front (Beauty)', prompt: 'front lighting, beauty light, flat even illumination' },
    { id: 'rim', name: 'Rim / Backlight', prompt: 'rim lighting, backlight, silhouette edge, glowing outline' },
    { id: 'left', name: 'Side Left', prompt: 'lighting from the left, dramatic side light, Rembrandt lighting' },
    { id: 'right', name: 'Side Right', prompt: 'lighting from the right, dramatic side light' },
    { id: 'bottom', name: 'Bottom (Horror)', prompt: 'bottom lighting, dramatic underlight, moody horror aesthetic' }
];

export const WARDROBE_CATEGORIES = {
    gender: [
        { id: 'female', name: 'Female', prompt: 'female model' },
        { id: 'male', name: 'Male', prompt: 'male model' },
        { id: 'unisex', name: 'Unisex', prompt: 'unisex' }
    ],
    tops: [
        { id: 't-shirt', name: 'T-Shirt', prompt: 'wearing a basic t-shirt' },
        { id: 'hoodie', name: 'Hoodie', prompt: 'wearing a premium hoodie' },
        { id: 'blazer', name: 'Blazer', prompt: 'wearing a tailored blazer' },
        { id: 'turtleneck', name: 'Turtleneck', prompt: 'wearing a chic turtleneck' },
        { id: 'crop-top', name: 'Crop Top', prompt: 'wearing a stylish crop top' }
    ],
    outerwear: [
        { id: 'trench-coat', name: 'Trench Coat', prompt: 'wearing a classic trench coat' },
        { id: 'leather-jacket', name: 'Leather Jacket', prompt: 'wearing a biker leather jacket' },
        { id: 'puffer-jacket', name: 'Puffer Jacket', prompt: 'wearing an oversized puffer jacket' },
        { id: 'denim-jacket', name: 'Denim Jacket', prompt: 'wearing a vintage denim jacket' }
    ],
    bottoms: [
        { id: 'cargo-pants', name: 'Cargo Pants', prompt: 'wearing utility cargo pants' },
        { id: 'tailored-trousers', name: 'Tailored Trousers', prompt: 'wearing elegant tailored trousers' },
        { id: 'skirts', name: 'Skirt', prompt: 'wearing a fashionable skirt' },
        { id: 'jeans', name: 'Designer Jeans', prompt: 'wearing high-end designer jeans' }
    ],
    sets: [
        { id: 'bodycon', name: 'Bodycon Set', prompt: 'wearing a matching bodycon set' },
        { id: 'sportswear', name: 'Sportswear', prompt: 'wearing technical sportswear ensemble' },
        { id: 'formal', name: 'Formal Suit', prompt: 'wearing a full formal suit' }
    ]
};

export const SHOTS: StudioOption[] = [
    { id: 'frontal', name: 'Frontal', prompt: 'frontal eye-level shot' },
    { id: 'three-quarters', name: '3/4 View', prompt: 'three-quarters view portrait' },
    { id: 'profile', name: 'Profile', prompt: 'side profile shot' },
    { id: 'low-angle', name: 'Low Angle (Hero)', prompt: 'low angle hero shot, looking up' },
    { id: 'high-angle', name: 'High Angle', prompt: 'high angle shot, looking down' },
    { id: 'close-up', name: 'Extreme Close-up', prompt: 'extreme close-up detail shot' },
    { id: 'wide', name: 'Wide Shot', prompt: 'wide full body cinematic shot' }
];

export const PRODUCTION_KITS = [
    { id: 'urban-cut', name: 'Urban Cut', prompt: 'urban cut style, paparazzi photography, high ISO, direct flash, slightly motion blurred, 35mm lens, candid street look' },
    { id: 'bts', name: 'Behind the Scenes (BTS)', prompt: 'behind the scenes shot, movie set visible, lighting rigs, C-stands, camera crew in periphery, professional production environment' },
    { id: 'billboard', name: 'Billboard Ad', prompt: 'billboard advertising photography, clean commercial aesthetic, negative space for text, high-end retouching, glossy finish' }
];

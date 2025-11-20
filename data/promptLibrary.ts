export interface PromptTemplate {
    id: string;
    title: string;
    category: string;
    prompt: string;
    description: string;
    tags: string[];
    exampleImage?: string;
    difficulty?: 'easy' | 'medium' | 'advanced';
}

export const PROMPT_CATEGORIES = [
    { id: 'all', name: 'All', icon: '✨' },
    { id: 'combine', name: 'Combine & Merge', icon: '🔗' },
    { id: 'style', name: 'Style & Transform', icon: '🎨' },
    { id: 'people', name: 'People & Characters', icon: '👤' },
    { id: 'environment', name: 'Environment & Scene', icon: '🌍' },
    { id: 'edit', name: 'Edit & Modify', icon: '✏️' },
    { id: 'creative', name: 'Creative & Fun', icon: '🎭' },
] as const;

export const PROMPT_LIBRARY: PromptTemplate[] = [
    // COMBINE & MERGE
    {
        id: 'combine-images',
        title: 'Combine Multiple Images',
        category: 'combine',
        prompt: 'Combine multiple images ([Image1], [Image2], [Image3], …) into a single cohesive image. Keep all key subjects recognizable and maintain their proportions and details. Blend the images naturally with consistent lighting, shadows, perspective, and style. Photorealistic, high-resolution, seamless integration.',
        description: 'Merge 2-4 images into one unified scene while preserving all subjects',
        tags: ['merge', 'blend', 'composite'],
        difficulty: 'medium'
    },
    {
        id: 'image-outpainting',
        title: 'Extend Image Borders',
        category: 'combine',
        prompt: 'Extend [Image1] beyond its original borders using outpainting. Keep the main subject and composition intact. Generate new content around the edges that matches the style, colors, lighting, and perspective of the original image. Photorealistic, high-resolution, seamless integration.',
        description: 'Expand image beyond original borders maintaining style consistency',
        tags: ['outpainting', 'expand', 'extend'],
        difficulty: 'easy'
    },

    // STYLE & TRANSFORM
    {
        id: 'style-fusion',
        title: 'Style Fusion',
        category: 'style',
        prompt: 'Transform this image [Image1] into the artistic style of [Image2]. Keep the main subject, composition, and details from [Image1], but apply the colors, textures, and overall aesthetic of [Image2]. High-quality, illustration style, consistent details.',
        description: 'Apply artistic style from one image to another while keeping subject',
        tags: ['style', 'transfer', 'artistic'],
        difficulty: 'medium'
    },
    {
        id: 'sketch-to-image',
        title: 'Sketch to Photo',
        category: 'style',
        prompt: 'Convert the line art in [Image1] into a fully colored and detailed image. Preserve all original outlines and compositions. Apply [desired style, e.g., photorealistic, anime, cartoon, digital painting] with realistic lighting, shadows, and textures. High-resolution, natural, seamless rendering.',
        description: 'Transform sketches and line art into fully rendered images',
        tags: ['sketch', 'lineart', 'render'],
        difficulty: 'easy'
    },
    {
        id: 'change-color',
        title: 'Change Image Colors',
        category: 'style',
        prompt: 'Change the colors in [Image1] to [desired color/style, e.g., warm tones, cool blue tones, pastel colors]. Keep the main subject and composition intact. Adjust lighting, shadows, and overall color balance to match the new color scheme. Photorealistic, high-resolution, natural-looking result.',
        description: 'Adjust color palette while maintaining composition',
        tags: ['color', 'tone', 'mood'],
        difficulty: 'easy'
    },

    // PEOPLE & CHARACTERS
    {
        id: 'virtual-try-on',
        title: 'Virtual Try-On Clothes',
        category: 'people',
        prompt: 'Keep the character in [Image1] unchanged, but replace their outfit with the clothing in [Image2]. Maintain the same pose, body proportions, and facial features, while applying the color, texture, and style of the outfit in [Image2]. High-quality, realistic, consistent detail.',
        description: 'Try different outfits on a person while keeping their identity',
        tags: ['fashion', 'clothes', 'outfit'],
        difficulty: 'advanced'
    },
    {
        id: 'facial-control',
        title: 'Change Facial Expression',
        category: 'people',
        prompt: 'Keep the person from [Image1] unchanged, but change their facial expression to [desired expression, e.g., smiling, surprised, angry]. Preserve the pose, body proportions, hairstyle, and overall appearance. Maintain realistic lighting, shadows, and photorealistic details.',
        description: 'Modify facial expressions while keeping identity',
        tags: ['face', 'expression', 'emotion'],
        difficulty: 'medium'
    },
    {
        id: 'pose-control',
        title: 'Pose Transfer',
        category: 'people',
        prompt: 'Take the person from [Image1] and place them in the exact pose shown in [Image2]. Preserve their identity, body proportions, and clothing details. Ensure the pose is natural and realistic, with consistent lighting, shadows, and perspective. Photorealistic, high-resolution result.',
        description: 'Transfer pose from reference while keeping subject identity',
        tags: ['pose', 'body', 'movement'],
        difficulty: 'advanced'
    },
    {
        id: 'body-reshape',
        title: 'Body Reshape',
        category: 'people',
        prompt: 'Reshape the body of the person in [Image1] into a [target body type]. Keep the face, identity, hairstyle, and clothing consistent. Ensure realistic anatomy, natural proportions, and photorealistic details.',
        description: 'Adjust body proportions while maintaining face and identity',
        tags: ['body', 'proportions', 'reshape'],
        difficulty: 'advanced'
    },
    {
        id: '3x3-portrait-grid',
        title: '3x3 Portrait Grid',
        category: 'people',
        prompt: 'Using the uploaded photo as a reference, generate a set of 9 vibrant half-length portraits featuring natural life. Each portrait should show a different pose and be placed in a unique setting, with rich, colorful details that highlight the diversity of nature.',
        description: 'Create 9 variations of a portrait in different poses and settings',
        tags: ['grid', 'variations', 'portrait'],
        difficulty: 'medium'
    },
    {
        id: 'bw-studio-portrait',
        title: 'B&W Studio Portrait',
        category: 'people',
        prompt: 'A top-angle and close-up black and white portrait of my face, focused on the head facing forward. Use a 35mm lens look, 10.7K 4HD quality. Proud expression. Deep black shadow background - only the face, the upper chest, and the shoulder.',
        description: 'Professional black & white portrait with dramatic lighting',
        tags: ['portrait', 'bw', 'studio'],
        difficulty: 'easy'
    },
    {
        id: 'cinematic-portrait',
        title: 'Cinematic Portrait',
        category: 'people',
        prompt: 'Create a vertical portrait shot using the exact same face features, characterized by stark cinematic lighting and intense contrast. Captured in a slightly low, upward-facing angle that dramatizes the subject\'s jawline and neck, the composition evokes quiet dominance and sculptural elegance. The background is a deep, saturated crimson red, creating a bold visual clash with the model\'s luminous skin and dark wardrobe.',
        description: 'Dramatic cinematic portrait with bold color contrasts',
        tags: ['cinematic', 'dramatic', 'portrait'],
        difficulty: 'medium'
    },

    // ENVIRONMENT & SCENE
    {
        id: 'change-background',
        title: 'Replace Background',
        category: 'environment',
        prompt: 'Replace the background of [Image1] with [desired background description, e.g., a beach, a forest, a city skyline]. Keep the main subject (person/object) unchanged, maintaining original proportions, lighting, and details. Ensure the subject blends naturally with the new environment. Photorealistic, high-resolution, seamless integration.',
        description: 'Change background while keeping subject intact',
        tags: ['background', 'environment', 'scene'],
        difficulty: 'easy'
    },
    {
        id: 'change-weather',
        title: 'Change Weather',
        category: 'environment',
        prompt: 'Change the weather in [Image1] to [desired weather, e.g., rainy, snowy, foggy, sunny]. Keep the main subject and overall scene intact. Adjust lighting, shadows, colors, and environmental effects to match the new weather. Photorealistic, seamless integration, high-resolution.',
        description: 'Transform scene weather conditions',
        tags: ['weather', 'atmosphere', 'mood'],
        difficulty: 'medium'
    },
    {
        id: 'change-camera-angle',
        title: 'Change Camera Angle',
        category: 'environment',
        prompt: 'Recreate the person from [Image1] in four different camera perspectives. Keep the subject\'s identity, body proportions, and clothing consistent across all four images. Maintain the same background environment as [Image1], with photorealistic lighting, natural shadows, and high-quality details. Generate four variations side by side: Bird\'s-eye view (from above), Rear view (from behind), Side profile view, Close-up portrait view.',
        description: 'Generate multiple camera angles of the same subject',
        tags: ['camera', 'angle', 'perspective'],
        difficulty: 'advanced'
    },
    {
        id: 'time-based',
        title: 'Time-Based Generation',
        category: 'environment',
        prompt: 'Generate an image of the same scene as [Image1], but showing how it looks 10 minutes later. Keep the environment and style consistent, but add natural changes over time such as light, weather, people and so on. Photorealistic, seamless continuity.',
        description: 'Show scene progression through time',
        tags: ['time', 'progression', 'temporal'],
        difficulty: 'medium'
    },
    {
        id: 'ai-interior-design',
        title: 'AI Interior Design',
        category: 'environment',
        prompt: 'Add furniture and decor to the room in [Image1]. Add a comfortable sofa, coffee table, and decorative items that match the room\'s style. Change wallpaper to warmer tones. Ensure photorealistic rendering with proper lighting, shadows, and perspective.',
        description: 'Design and furnish interior spaces',
        tags: ['interior', 'furniture', 'decor'],
        difficulty: 'medium'
    },

    // EDIT & MODIFY
    {
        id: 'add-remove-object',
        title: 'Add or Remove Objects',
        category: 'edit',
        prompt: 'Add [desired element, e.g., a tree, a lamp, a dog] to [Image1]. Place it naturally in the scene, matching the lighting, perspective, and style. Keep the original elements unchanged. Photorealistic, seamless integration.\n\nOR\n\nRemove [element to remove, e.g., a person, a car, a sign] from [Image1]. Fill the background naturally to maintain the scene\'s continuity, lighting, and details. Keep all other elements unchanged. Photorealistic, high-resolution.',
        description: 'Add new objects or remove existing ones seamlessly',
        tags: ['add', 'remove', 'object'],
        difficulty: 'medium'
    },
    {
        id: 'edit-text',
        title: 'Edit Text in Image',
        category: 'edit',
        prompt: 'Edit the text in [Image1]. Replace the existing text with "[your new text]" while keeping the background, design, and other elements unchanged. Match the font style, size, and color to look natural and consistent with the image. Photorealistic, seamless integration.',
        description: 'Replace text while maintaining design consistency',
        tags: ['text', 'typography', 'edit'],
        difficulty: 'easy'
    },
    {
        id: 'image-replace',
        title: 'Replace Element',
        category: 'edit',
        prompt: 'Replace [target element or area] in [Image1] with [new element or reference, e.g., a different person, object, or scene]. Keep all other parts of the image unchanged. Ensure the replacement blends naturally with lighting, perspective, and overall style. Photorealistic, high-resolution, seamless integration.',
        description: 'Swap specific elements while keeping rest intact',
        tags: ['replace', 'swap', 'substitute'],
        difficulty: 'medium'
    },
    {
        id: 'enhance-image',
        title: 'Enhance Quality',
        category: 'edit',
        prompt: 'Enhance [Image1] to improve overall quality and detail. Keep the original composition, colors, and style intact. Increase resolution, sharpness, texture clarity, and lighting realism. Output as a photorealistic, high-resolution image.',
        description: 'Upscale and enhance image quality',
        tags: ['enhance', 'upscale', 'quality'],
        difficulty: 'easy'
    },
    {
        id: 'object-extraction',
        title: 'Extract Object (E-commerce)',
        category: 'edit',
        prompt: 'Extract the clothing from [Image1] and present it as a clean e-commerce product photo. Remove the model\'s body completely. Keep the outfit in natural 3D shape, with realistic fabric folds, seams, and textures. Display the garment as if photographed on a mannequin or neatly laid flat, centered on a pure white or transparent background. High-resolution, professional lighting, suitable for online fashion catalog.',
        description: 'Extract products for clean e-commerce presentation',
        tags: ['extraction', 'product', 'ecommerce'],
        difficulty: 'advanced'
    },

    // CREATIVE & FUN
    {
        id: 'polaroid-style',
        title: 'AI Polaroid Photo',
        category: 'creative',
        prompt: 'Take a picture with a Polaroid camera. The photo should look like a normal photo, without any clear subject or props. The photo should have a slight blur and a consistent light source, such as a flash from a dark room, spread throughout the photo. Do not change the faces. Replace the background behind the people with a white curtain.',
        description: 'Create nostalgic Polaroid-style photos',
        tags: ['polaroid', 'retro', 'vintage'],
        difficulty: 'easy'
    },
    {
        id: 'hug-younger-self',
        title: 'Hug Your Younger Self',
        category: 'creative',
        prompt: 'Take a photo taken with a Polaroid camera. The photo should look like an ordinary photograph, without an explicit subject or property. The photo should have a slight blur and a consistent light source, like a flash from a dark room, scattered throughout the photo. Don\'t change the face. Change the background behind those two people with white curtains. Make it look like both people in the reference picture are hugging each other.',
        description: 'Emotional photo showing hugging your past self',
        tags: ['emotional', 'creative', 'polaroid'],
        difficulty: 'medium'
    },
    {
        id: 'anatomy-illustration',
        title: 'Anatomy Illustration',
        category: 'creative',
        prompt: 'Draw a bilaterally symmetrical frontal anatomical illustration of the [Character], styled similarly to an infographic. The image should show the creature\'s external features on both sides, with its internal anatomy partially exposed. Detailed text should flank the image, explaining the creature\'s biology, abilities, behavior, habitat, and the specific functions of its anatomical structures. The overall design should be clear, informative, and in the style of a scientific illustration.',
        description: 'Scientific-style anatomical diagrams',
        tags: ['anatomy', 'scientific', 'infographic'],
        difficulty: 'advanced'
    },
    {
        id: '16bit-character',
        title: '16-Bit Game Character',
        category: 'creative',
        prompt: 'Recreate this [Character] as a 16-bit video game character, and place the character in a level of a 2D 16-bit platform video game.',
        description: 'Transform into retro pixel art game character',
        tags: ['16bit', 'retro', 'gaming'],
        difficulty: 'medium'
    },
    {
        id: 'funko-pop',
        title: 'Funko Pop Figure',
        category: 'creative',
        prompt: 'Create a detailed 3D render of a chibi Funko Pop figure, strictly based on the provided reference photo. The figure should accurately reflect the person\'s appearance, hairstyle, attire, and characteristic style from the photo. High detail, studio lighting, photorealistic texture, pure white background.',
        description: 'Create collectible Funko Pop style figure',
        tags: ['funko', 'collectible', '3d'],
        difficulty: 'easy'
    },
    {
        id: 'plush-toy',
        title: 'Plush Toy Design',
        category: 'creative',
        prompt: 'A soft, high-quality plush toy of [CHARACTER], with an oversized head, small body, and stubby limbs. Made of fuzzy fabric with visible stitching and embroidered facial features. The plush is shown sitting or standing against a neutral background. The expression is cute or expressive, and it wears simple clothes or iconic accessories if relevant. Lighting is soft and even, with a realistic, collectible plush look. Centered, full-body view.',
        description: 'Design cute collectible plush toys',
        tags: ['plush', 'toy', 'cute'],
        difficulty: 'easy'
    },
    {
        id: 'internal-structure',
        title: 'Internal Structure Diagram',
        category: 'creative',
        prompt: 'Ultra-detailed exploded view of a product, metallic parts and electronic components floating in mid-air, perfectly aligned, revealing inner structure, futuristic technology aesthetic, 8K resolution, soft cinematic lighting, highly realistic.',
        description: 'Technical exploded view diagrams',
        tags: ['technical', 'exploded', 'diagram'],
        difficulty: 'advanced'
    },
    {
        id: 'ingredients-to-dish',
        title: 'Ingredients to Dish',
        category: 'creative',
        prompt: 'Here are the items available: [List of items]. Based on these items, create an image of a [type of dish] that can be made by combining them. The composition should make logical sense, considering the relationship between the items. Ensure the image is photorealistic with appropriate proportions and clear placement of each item.',
        description: 'Visualize finished dish from ingredients',
        tags: ['food', 'cooking', 'visualization'],
        difficulty: 'medium'
    },
    {
        id: 'photo-strip-grid',
        title: '3x3 Photo Strip Poses',
        category: 'creative',
        prompt: 'Turn the photo into a 3x3 grid of photo strips with different studio-style poses and expressions',
        description: 'Create photo booth style grid with variations',
        tags: ['grid', 'photobooth', 'poses'],
        difficulty: 'easy'
    },
];

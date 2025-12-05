/**
 * Google Custom Search Service
 * Fetches images from Google Images to use as invisible reference images
 * v1.4.1 - Enhanced Google Search Grounding with auto-reference images
 */

const GOOGLE_SEARCH_API_KEY = import.meta.env.VITE_GOOGLE_SEARCH_API_KEY;
const GOOGLE_SEARCH_ENGINE_ID = import.meta.env.VITE_GOOGLE_SEARCH_ENGINE_ID;

interface GoogleImageResult {
    link: string;
    mime: string;
    image: {
        contextLink: string;
        height: number;
        width: number;
        byteSize: number;
        thumbnailLink: string;
    };
}

interface GoogleSearchResponse {
    items?: GoogleImageResult[];
}

/**
 * Extract main keywords from prompt for image search
 * Removes common words, style descriptors, and focuses on subjects
 */
export const extractSearchKeywords = (prompt: string): string => {
    // Remove everything AFTER style mentions to get only the subject
    let cleanPrompt = prompt.toLowerCase();

    // Find where style instructions start and cut there
    const styleCutPoints = [
        / in (the )?style (of |)/,
        / stile /,
        / come /,
        / tipo /,
        / pixar/,
        / disney/,
        / anime/,
        / cartoon/,
        / realistic/,
        / photorealistic/
    ];

    for (const pattern of styleCutPoints) {
        const match = cleanPrompt.match(pattern);
        if (match && match.index !== undefined) {
            cleanPrompt = cleanPrompt.substring(0, match.index);
            break;
        }
    }

    // Remove quality and style descriptors
    cleanPrompt = cleanPrompt
        .replace(/\b(detailed|high quality|professional|cinematic|composition|4k|8k|hd|ultra|masterpiece)\b/gi, '')
        .replace(/\b(background|foreground|lighting|shadow|highlight)\b/gi, '')
        .replace(/\b(portrait|landscape|wide angle|close up|macro)\b/gi, '')
        .replace(/\b(vibrant|colorful|bright|dark|moody|dramatic)\b/gi, '')
        .replace(/,/g, ' ')
        .trim();

    // Take first significant words (the main subject)
    const words = cleanPrompt.split(/\s+/).filter(w => w.length > 2);

    // Return first 3-4 words as search term (the subject only)
    return words.slice(0, 4).join(' ');
};

/**
 * Search Google Images and return top image URLs
 */
export const searchGoogleImages = async (query: string, maxResults: number = 10): Promise<string[]> => {
    try {
        // Check if API keys are configured
        if (!GOOGLE_SEARCH_API_KEY || !GOOGLE_SEARCH_ENGINE_ID) {
            console.warn('⚠️ Google Search API not configured. Skipping image search.');
            return [];
        }

        console.log(`🔍 Searching Google Images for: "${query}"`);

        const url = new URL('https://www.googleapis.com/customsearch/v1');
        url.searchParams.set('key', GOOGLE_SEARCH_API_KEY);
        url.searchParams.set('cx', GOOGLE_SEARCH_ENGINE_ID);
        url.searchParams.set('q', query);
        url.searchParams.set('searchType', 'image');
        url.searchParams.set('num', String(Math.min(maxResults, 10))); // Max 10 per request
        url.searchParams.set('imgSize', 'large'); // Prefer large images
        url.searchParams.set('safe', 'active'); // Safe search

        const response = await fetch(url.toString());

        if (!response.ok) {
            throw new Error(`Google Search API error: ${response.status}`);
        }

        const data: GoogleSearchResponse = await response.json();

        if (!data.items || data.items.length === 0) {
            console.warn(`⚠️ No images found for: "${query}"`);
            return [];
        }

        // Filter out stock photo sites with watermarks
        const blockedDomains = [
            'shutterstock.com',
            'istockphoto.com',
            'gettyimages.com',
            'dreamstime.com',
            'depositphotos.com',
            'alamy.com',
            '123rf.com',
            'stock.adobe.com',
            'freepik.com',
            'pngtree.com',
            'vecteezy.com'
        ];

        const imageUrls = data.items
            .map(item => item.link)
            .filter(url => {
                const urlLower = url.toLowerCase();
                return !blockedDomains.some(domain => urlLower.includes(domain));
            });

        console.log(`✅ Found ${imageUrls.length} images for: "${query}" (watermark sites filtered)`);

        return imageUrls;
    } catch (error) {
        console.error('❌ Google Search API error:', error);
        return [];
    }
};

/**
 * Fetch image from URL and convert to File object
 */
export const fetchImageAsFile = async (url: string, filename: string = 'google-ref.jpg'): Promise<File | null> => {
    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.status}`);
        }

        const blob = await response.blob();

        // Create File object from blob
        const file = new File([blob], filename, { type: blob.type });

        return file;
    } catch (error) {
        console.error(`❌ Failed to fetch image from ${url}:`, error);
        return null;
    }
};

/**
 * Main function: Search and fetch images as invisible references
 * Returns array of File objects ready to be used as reference images
 */
export const fetchInvisibleReferences = async (prompt: string, maxImages: number = 2): Promise<File[]> => {
    try {
        // Extract keywords from prompt
        const searchQuery = extractSearchKeywords(prompt);

        if (!searchQuery || searchQuery.length < 3) {
            console.log('⚠️ Prompt too short for image search, skipping grounding');
            return [];
        }

        console.log(`🌐 Google Search Grounding: extracting keywords from prompt`);
        console.log(`🔍 Search query: "${searchQuery}"`);

        // Search Google Images
        const imageUrls = await searchGoogleImages(searchQuery, maxImages);

        if (imageUrls.length === 0) {
            return [];
        }

        // Fetch images as File objects
        const fetchPromises = imageUrls.map((url, index) =>
            fetchImageAsFile(url, `google-ref-${index + 1}.jpg`)
        );

        const files = await Promise.all(fetchPromises);

        // Filter out failed fetches
        const validFiles = files.filter((f): f is File => f !== null);

        console.log(`✅ Successfully fetched ${validFiles.length}/${imageUrls.length} invisible reference images`);

        return validFiles;
    } catch (error) {
        console.error('❌ Error fetching invisible references:', error);
        return [];
    }
};

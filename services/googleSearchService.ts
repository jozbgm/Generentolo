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
    // Remove common style/quality descriptors
    const cleanPrompt = prompt
        .toLowerCase()
        .replace(/\b(photorealistic|realistic|detailed|high quality|professional|cinematic|composition|4k|8k|hd|ultra|masterpiece)\b/gi, '')
        .replace(/\b(in the style of|style of|inspired by|similar to|like)\b/gi, '')
        .replace(/\b(background|foreground|lighting|shadow|highlight)\b/gi, '')
        .replace(/\b(portrait|landscape|wide angle|close up|macro)\b/gi, '')
        .trim();

    // Take first significant words (usually the main subject)
    const words = cleanPrompt.split(/\s+/).filter(w => w.length > 2);

    // Return first 3-4 words as search term
    return words.slice(0, 4).join(' ');
};

/**
 * Search Google Images and return top image URLs
 */
export const searchGoogleImages = async (query: string, maxResults: number = 3): Promise<string[]> => {
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

        const imageUrls = data.items.map(item => item.link);
        console.log(`✅ Found ${imageUrls.length} images for: "${query}"`);

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

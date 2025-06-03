import { ref, getDownloadURL } from 'firebase/storage';
import { storage } from '../config/firebaseConfig';

// Cache object for Firebase Storage URLs
type ImageCache = {
    [key: string]: { uri: string };
};

let firebaseImageCache: ImageCache = {};

// Cache for failed image loads to avoid repeated attempts
let failedImageCache: Set<string> = new Set();

/**
 * Gets the Firebase Storage download URL for an image
 * @param imagePath - The path to the image (e.g., "Marie_Antoinette_Adult.jpg")
 * @returns Promise that resolves to the Firebase Storage URL or null if failed
 */
const getFirebaseImageUrl = async (imagePath: string): Promise<string | null> => {
    try {
        // If we've already failed to load this image, don't try again
        if (failedImageCache.has(imagePath)) {
            console.warn(`Image previously failed to load: ${imagePath}`);
            return null;
        }

        // Check if we have this URL cached
        if (firebaseImageCache[imagePath]) {
            return firebaseImageCache[imagePath].uri;
        }

        // Create reference to the image in Firebase Storage
        // Using the structure: French_questions/assets/[filename]
        const imageRef = ref(storage, `French_questions/assets/${imagePath}`);

        // Get the download URL
        const downloadURL = await getDownloadURL(imageRef);

        // Cache the URL
        firebaseImageCache[imagePath] = { uri: downloadURL };

        console.log(`Successfully loaded image from Firebase: ${imagePath}`);
        return downloadURL;
    } catch (error) {
        console.error(`Failed to load image from Firebase Storage: ${imagePath}`, error);

        // Add to failed cache to avoid repeated attempts
        failedImageCache.add(imagePath);

        return null;
    }
};

/**
 * Gets the image source for either a Firebase Storage image or remote URL
 * @param imagePath - The path to the image file or full URL
 * @returns Promise that resolves to image source object or null
 */
export const getImageSource = async (imagePath: string | null): Promise<any> => {
    // If no image path provided, return null
    if (!imagePath) return null;

    try {
        // Handle remote URLs (http/https) - return as-is
        if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
            // Cache remote URLs to avoid recreating objects
            if (!firebaseImageCache[imagePath]) {
                firebaseImageCache[imagePath] = { uri: imagePath };
            }
            return firebaseImageCache[imagePath];
        }

        // Extract filename from various possible path formats
        const filename = imagePath
            .replace(/^\.\.\/assets\//, "") // Remove ../assets/
            .replace(/^\.\/assets\//, "")   // Remove ./assets/
            .replace(/^assets\//, "")       // Remove assets/
            .replace(/^.*\//, "");          // Remove any other path prefixes

        // Get Firebase Storage URL
        const firebaseUrl = await getFirebaseImageUrl(filename);

        if (firebaseUrl) {
            return { uri: firebaseUrl };
        }

        console.warn(`Image not found in Firebase Storage: ${filename}`);
        return null;
    } catch (error) {
        console.error(`Failed to get image source: ${imagePath}`, error);
        return null;
    }
};

/**
 * Synchronous version that returns cached URLs or null
 * Useful for components that need immediate response
 * @param imagePath - The path to the image file
 * @returns Cached image source object or null
 */
export const getCachedImageSource = (imagePath: string | null): any => {
    if (!imagePath) return null;

    // Handle remote URLs
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return firebaseImageCache[imagePath] || { uri: imagePath };
    }

    // Extract filename
    const filename = imagePath
        .replace(/^\.\.\/assets\//, "")
        .replace(/^\.\/assets\//, "")
        .replace(/^assets\//, "")
        .replace(/^.*\//, "");

    // Return cached Firebase URL if available
    return firebaseImageCache[filename] || null;
};

/**
 * Preloads images from the questions data into the cache
 * @param questionsData - The questions data structure
 * @returns Promise that resolves when preloading is complete
 */
export const preloadImages = async (questionsData: any): Promise<void> => {
    try {
        // Extract all image paths from the questions data
        const imagePaths: string[] = [];

        if (questionsData && questionsData.categories) {
            questionsData.categories.forEach((category: any) => {
                if (category.questions) {
                    category.questions.forEach((question: any) => {
                        if (question.image) {
                            imagePaths.push(question.image);
                        }
                    });
                }
            });
        }

        // Get unique paths
        const uniquePaths = [...new Set(imagePaths)];
        console.log(`Starting to preload ${uniquePaths.length} unique images from Firebase Storage`);

        // Preload images in batches to avoid overwhelming the storage service
        const batchSize = 5;
        let loadedCount = 0;
        let failedCount = 0;

        for (let i = 0; i < uniquePaths.length; i += batchSize) {
            const batch = uniquePaths.slice(i, i + batchSize);

            // Process batch concurrently
            const batchPromises = batch.map(async (path) => {
                try {
                    const imageSource = await getImageSource(path);
                    if (imageSource) {
                        loadedCount++;
                        return { path, success: true };
                    } else {
                        failedCount++;
                        return { path, success: false };
                    }
                } catch (error) {
                    failedCount++;
                    console.error(`Error preloading image: ${path}`, error);
                    return { path, success: false };
                }
            });

            await Promise.all(batchPromises);

            // Log progress
            console.log(`Preloaded batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(uniquePaths.length / batchSize)}`);
        }

        console.log(`Preloading complete: ${loadedCount} loaded, ${failedCount} failed`);

        if (failedCount > 0) {
            console.warn(`Failed to load ${failedCount} images. They may not exist in Firebase Storage.`);
        }
    } catch (error) {
        console.error('Error during image preloading:', error);
    }
};

/**
 * Clears the image cache - useful for memory management
 */
export const clearImageCache = (): void => {
    firebaseImageCache = {};
    failedImageCache.clear();
    console.log('Image cache cleared');
};

/**
 * Gets cache statistics
 */
export const getCacheStats = () => {
    return {
        cachedImages: Object.keys(firebaseImageCache).length,
        failedImages: failedImageCache.size,
        totalMemoryUsage: JSON.stringify(firebaseImageCache).length
    };
};
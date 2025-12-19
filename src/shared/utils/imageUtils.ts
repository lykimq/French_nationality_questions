import { ref, getDownloadURL } from 'firebase/storage';
import { storage } from '../../config/firebaseConfig';
import { createLogger } from './logger';

const logger = createLogger('ImageUtils');

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
            logger.warn(`Image previously failed to load: ${imagePath}`);
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

        return downloadURL;
    } catch (error) {
        logger.error(`Failed to load image from Firebase Storage: ${imagePath}`, error);

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
            .replace(/^.*[\\/]/, ""); // Remove any path prefixes (cross-platform)

        // Get Firebase Storage URL
        const firebaseUrl = await getFirebaseImageUrl(filename);

        if (firebaseUrl) {
            return { uri: firebaseUrl };
        }

        logger.warn(`Image not found in Firebase Storage: ${filename}`);
        return null;
    } catch (error) {
        logger.error(`Failed to get image source: ${imagePath}`, error);
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
    const filename = imagePath.replace(/^.*[\\/]/, "");

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

        // Preload images in batches to avoid overwhelming the storage service
        const batchSize = 5;
        let failedCount = 0;

        for (let i = 0; i < uniquePaths.length; i += batchSize) {
            const batch = uniquePaths.slice(i, i + batchSize);

            // Process batch concurrently
            const batchPromises = batch.map(async (path) => {
                try {
                    const imageSource = await getImageSource(path);
                    if (!imageSource) {
                        failedCount++;
                    }
                } catch (error) {
                    failedCount++;
                    logger.error(`Error preloading image: ${path}`, error);
                }
            });

            await Promise.all(batchPromises);
        }

        if (failedCount > 0) {
            logger.warn(`Failed to load ${failedCount} images during preloading.`);
        }
    } catch (error) {
        logger.error('Error during image preloading:', error);
    }
};

/**
 * Clears the image cache - useful for memory management
 */
export const clearImageCache = (): void => {
    firebaseImageCache = {};
    failedImageCache.clear();
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
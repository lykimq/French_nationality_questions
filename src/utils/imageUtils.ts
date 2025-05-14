import { Platform } from 'react-native';

// Type for the image registry to allow string indexing
type ImageRegistryType = {
    [key: string]: any;
};

// Static mapping for all local images
// This allows the bundler to properly include these assets
const IMAGE_REGISTRY: ImageRegistryType = {
    // Local assets with various possible path formats
    "../assets/Marie_Antoinette_Adult.jpg": require("../../assets/Marie_Antoinette_Adult.jpg"),
    "./assets/Marie_Antoinette_Adult.jpg": require("../../assets/Marie_Antoinette_Adult.jpg"),
    "assets/Marie_Antoinette_Adult.jpg": require("../../assets/Marie_Antoinette_Adult.jpg"),
    "../../assets/Marie_Antoinette_Adult.jpg": require("../../assets/Marie_Antoinette_Adult.jpg"),
    // Add any other images used in your app here
};

// Cache object for remote images
type ImageCache = {
    [key: string]: { uri: string };
};

let remoteImageCache: ImageCache = {};

/**
 * Gets the image source for either a local or remote image path
 */
export const getImageSource = (imagePath: string | null): any => {
    // If no image path provided, return null
    if (!imagePath) return null;

    // Handle remote URLs (http/https)
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        // Cache remote URLs to avoid recreating objects
        if (!remoteImageCache[imagePath]) {
            remoteImageCache[imagePath] = { uri: imagePath };
        }
        return remoteImageCache[imagePath];
    }

    try {
        // Normalize the path for consistency
        // This handles different formats like ../assets/, ./assets/, etc.
        const normalizedPath = imagePath
            .replace(/^\.\.\/assets\//, "../assets/")
            .replace(/^\.\/assets\//, "./assets/")
            .replace(/^assets\//, "assets/");

        // Check if we have this image in our registry
        if (IMAGE_REGISTRY[normalizedPath]) {
            return IMAGE_REGISTRY[normalizedPath];
        }

        // For the original path format
        if (IMAGE_REGISTRY[imagePath]) {
            return IMAGE_REGISTRY[imagePath];
        }

        // If we couldn't find the image, log a warning
        console.warn(`Image not found in registry: ${imagePath}`);
        return null;
    } catch (error) {
        console.error(`Failed to load image: ${imagePath}`, error);
        return null;
    }
};

/**
 * Preloads all images from the questions data
 * With the static registry, we don't need to actually preload,
 * but we'll keep this function for logging purposes
 */
export const preloadImages = (questionsData: any): void => {
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

        // Get unique paths and log them
        const uniquePaths = [...new Set(imagePaths)];
        console.log(`Found ${uniquePaths.length} unique images`);

        // Log which images are found in the registry and which aren't
        const foundImages: string[] = [];
        const missingImages: string[] = [];

        uniquePaths.forEach(path => {
            if (!path.startsWith('http://') && !path.startsWith('https://')) {
                const imageSource = getImageSource(path);
                if (imageSource) {
                    foundImages.push(path);
                } else {
                    missingImages.push(path);
                }
            }
        });

        console.log(`Images found in registry: ${foundImages.length}`);
        if (missingImages.length > 0) {
            console.warn(`Missing images: ${missingImages.join(', ')}`);
        }
    } catch (error) {
        console.error('Error checking images:', error);
    }
};
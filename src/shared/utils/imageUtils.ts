import { ref, getDownloadURL } from 'firebase/storage';
import { storage } from '../../config/firebaseConfig';
import { createLogger } from './logger';

const logger = createLogger('ImageUtils');

type ImageCache = {
    [key: string]: { uri: string };
};

let firebaseImageCache: ImageCache = {};
let failedImageCache: Set<string> = new Set();

const getFirebaseImageUrl = async (imagePath: string): Promise<string | null> => {
    try {
        if (failedImageCache.has(imagePath)) {
            logger.warn(`Image previously failed to load: ${imagePath}`);
            return null;
        }

        if (firebaseImageCache[imagePath]) {
            return firebaseImageCache[imagePath].uri;
        }

        const imageRef = ref(storage, `French_questions/assets/${imagePath}`);
        const downloadURL = await getDownloadURL(imageRef);

        firebaseImageCache[imagePath] = { uri: downloadURL };

        return downloadURL;
    } catch (error) {
        logger.error(`Failed to load image from Firebase Storage: ${imagePath}`, error);
        failedImageCache.add(imagePath);
        return null;
    }
};

export const getImageSource = async (imagePath: string | null): Promise<any> => {
    if (!imagePath) return null;

    try {
        if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
            if (!firebaseImageCache[imagePath]) {
                firebaseImageCache[imagePath] = { uri: imagePath };
            }
            return firebaseImageCache[imagePath];
        }

        const filename = imagePath.replace(/^.*[\\/]/, "");
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

export const getCachedImageSource = (imagePath: string | null): any => {
    if (!imagePath) return null;

    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return firebaseImageCache[imagePath] || { uri: imagePath };
    }

    const filename = imagePath.replace(/^.*[\\/]/, "");
    return firebaseImageCache[filename] || null;
};

export const preloadImages = async (questionsData: any): Promise<void> => {
    try {
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

        const uniquePaths = [...new Set(imagePaths)];
        const batchSize = 5;
        let failedCount = 0;

        for (let i = 0; i < uniquePaths.length; i += batchSize) {
            const batch = uniquePaths.slice(i, i + batchSize);

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
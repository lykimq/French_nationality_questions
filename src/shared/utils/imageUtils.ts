import type { ImageSourcePropType } from 'react-native';
import { createLogger } from './logger';
import { loadImageResource, getCachedImage } from '../services/dataService';
import type { FrenchQuestionsData } from '../../types/questionsData';

const logger = createLogger('ImageUtils');

export const getImageSource = async (imagePath: string | null): Promise<ImageSourcePropType | null> => {
    if (!imagePath) return null;
    try {
        return await loadImageResource(imagePath);
    } catch (error) {
        logger.error(`Failed to get image source: ${imagePath}`, error);
        return null;
    }
};

export const getCachedImageSource = (imagePath: string | null): ImageSourcePropType | null => {
    if (!imagePath) return null;
    return getCachedImage(imagePath);
};

export const preloadImages = async (questionsData: FrenchQuestionsData | null | undefined): Promise<void> => {
    try {
        const imagePaths: string[] = [];

        if (questionsData && questionsData.categories) {
            questionsData.categories.forEach((category) => {
                if (category.questions) {
                    category.questions.forEach((question) => {
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
                    const imageSource = await loadImageResource(path);
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
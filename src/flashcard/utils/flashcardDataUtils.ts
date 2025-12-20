import { loadFormationData } from '../../shared/utils/dataUtils';
import { createLogger } from '../../shared/utils/logger';
import type { FormationCategory } from '../types';

const logger = createLogger('flashcardDataUtils');

export const loadFlashCardData = async (): Promise<{ [key: string]: FormationCategory } | null> => {
    try {
        const formationData = await loadFormationData();
        if (!formationData || Object.keys(formationData).length === 0) {
            logger.error('Failed to load formation data');
            return null;
        }
        return formationData;
    } catch (error) {
        logger.error('Error loading flashcard data:', error);
        return null;
    }
};

export const getCategoryById = (
    categories: { [key: string]: FormationCategory } | null,
    categoryId: string
): FormationCategory | null => {
    if (!categories || !categoryId) {
        return null;
    }
    return categories[categoryId] || null;
};

export const getAllCategories = (
    categories: { [key: string]: FormationCategory } | null
): FormationCategory[] => {
    if (!categories) {
        return [];
    }
    return Object.values(categories);
};


import { DATA_FILES } from '../config/dataConfig';
import { createLogger } from './logger';
import { loadJsonCollection } from '../services/dataService';

const logger = createLogger('dataUtils');

export const loadSubcategoryData = async () => {
    return loadJsonCollection(DATA_FILES.SUBCATEGORIES.FILES, DATA_FILES.SUBCATEGORIES.DIRECTORY);
};

export const preloadAllData = async () => {
    try {
        const subcategoryData = await loadSubcategoryData();
        return { subcategoryData };
    } catch (error) {
        logger.error('Error during data preloading:', error);
        throw error;
    }
};

export const loadFormationData = async () => {
    return loadJsonCollection(DATA_FILES.FORMATION.FILES, DATA_FILES.FORMATION.DIRECTORY, '.json', true);
};

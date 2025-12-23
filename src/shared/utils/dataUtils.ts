import { DATA_FILES } from '../config/dataConfig';
import { createLogger } from './logger';
import { loadJsonResource, loadJsonCollection } from '../services/dataService';
import type { FrenchQuestionsData } from '../../types/questionsData';

const logger = createLogger('dataUtils');

export const loadSubcategoryData = async () => {
    return loadJsonCollection(DATA_FILES.SUBCATEGORIES.FILES, DATA_FILES.SUBCATEGORIES.DIRECTORY);
};

export const loadPart1SubcategoryTestData = async () => {
    return loadJsonCollection(DATA_FILES.TESTS.PART1, DATA_FILES.TESTS.DIRECTORY, '_fr_vi.json');
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

export const preloadAllPart1TestData = async () => {
    try {
        const [part1TestData, part1SubcategoryTestData] = await Promise.all([
            loadPart1TestData(),
            loadPart1SubcategoryTestData()
        ]);
        return { part1TestData, part1SubcategoryTestData };
    } catch (error) {
        logger.error('Error during Part 1 test data preloading:', error);
        throw error;
    }
};

export const loadPart1TestData = async (): Promise<Record<string, unknown>> => {
    return {
        id: "test_part1",
        title: "Première partie : Tests de connaissances",
        icon: "book",
        description: "Première partie des tests divisée en trois sous-catégories",
        subcategories: [
            { id: "test_personal", title: "Informations personnelles", icon: "person", description: "Questions sur la vie personnelle" },
            { id: "test_opinions", title: "Vos opinions", icon: "chatbox", description: "Questions sur vos opinions" },
            { id: "test_daily_life", title: "Vie quotidienne", icon: "calendar", description: "Questions sur la vie quotidienne" }
        ]
    };
};

export const loadFormationData = async () => {
    return loadJsonCollection(DATA_FILES.FORMATION.FILES, DATA_FILES.FORMATION.DIRECTORY, '.json', true);
};

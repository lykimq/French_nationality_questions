import { ref, getDownloadURL } from 'firebase/storage';
import { storage } from '../../config/firebaseConfig';
import { LOCAL_DATA_MAP, DATA_FILES } from '../config/dataConfig';
import { createLogger } from './logger';
import { validateDataStructure } from './dataValidation';

const logger = createLogger('dataUtils');

type DataCache = {
    [key: string]: any;
};

let firebaseDataCache: DataCache = {};
let failedDataCache: Set<string> = new Set();

const getLocalJsonData = async (dataPath: string): Promise<any> => {
    try {
        const localData = LOCAL_DATA_MAP[dataPath];
        if (localData) {
            firebaseDataCache[dataPath] = localData;
            return localData;
        }
        return null;
    } catch (error) {
        logger.error(`Failed to load local JSON data: ${dataPath}`, error);
        return null;
    }
};

const getFirebaseJsonData = async (dataPath: string): Promise<any> => {
    try {
        if (firebaseDataCache[dataPath]) {
            return firebaseDataCache[dataPath];
        }

        if (failedDataCache.has(dataPath)) {
            logger.info(`Trying local fallback for cached failure: ${dataPath}`);
            return await getLocalJsonData(dataPath);
        }

        if (storage) {
            try {
                const dataRef = ref(storage, `French_questions/data/${dataPath}`);
                const downloadURL = await getDownloadURL(dataRef);
                const response = await fetch(downloadURL);

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const jsonData = await response.json();
                const validationResult = validateDataStructure(jsonData, dataPath);

                if (!validationResult.isValid) {
                    logger.error(`Data validation failed for ${dataPath}:`, validationResult.errors);
                }

                firebaseDataCache[dataPath] = jsonData;
                return jsonData;
            } catch (firebaseError) {
                logger.warn(`Firebase load failed for ${dataPath}, trying local fallback`);
            }
        } else {
            logger.info(`Firebase not configured, using local data for: ${dataPath}`);
        }

        const localData = await getLocalJsonData(dataPath);
        if (localData) return localData;

        failedDataCache.add(dataPath);
        logger.error(`Failed to load JSON data from both Firebase and local: ${dataPath}`);
        return null;
    } catch (error) {
        logger.error(`Failed to load JSON data: ${dataPath}`, error);
        const localData = await getLocalJsonData(dataPath);
        if (localData) return localData;

        failedDataCache.add(dataPath);
        return null;
    }
};

const loadJsonCollection = async (
    files: readonly string[],
    directoryPrefix: string = '',
    keySuffixToRemove: string = '.json'
): Promise<{ [key: string]: any }> => {
    try {
        const promises = files.map(async (filename) => {
            const key = filename.replace(keySuffixToRemove, '');
            const data = await getFirebaseJsonData(`${directoryPrefix}${filename}`);
            return { key, data };
        });

        const results = await Promise.all(promises);
        const dataMap: { [key: string]: any } = {};

        results.forEach(({ key, data }) => {
            if (data) {
                dataMap[key] = data;
            } else {
                logger.warn(`Failed to load collection item: ${key}`);
            }
        });

        return dataMap;
    } catch (error) {
        logger.error(`Error loading JSON collection: ${directoryPrefix}`, error);
        return {};
    }
};


export const loadMainQuestionData = async () => {
    try {
        const [personal, geography] = await Promise.all([
            getFirebaseJsonData(DATA_FILES.MAIN.PERSONAL),
            getFirebaseJsonData(DATA_FILES.MAIN.GEOGRAPHY)
        ]);

        if (!personal || !geography) {
            logger.error('Failed to load one or more main data files');
            return null;
        }

        return { personal, geography };
    } catch (error) {
        logger.error('Error loading main question data:', error);
        return null;
    }
};

export const loadHistoryData = async () => {
    try {
        return await getFirebaseJsonData(DATA_FILES.HISTORY.CATEGORIES);
    } catch (error) {
        logger.error('Error loading history data:', error);
        return null;
    }
};

export const loadSubcategoryData = async () => {
    return loadJsonCollection(DATA_FILES.SUBCATEGORIES.FILES, DATA_FILES.SUBCATEGORIES.DIRECTORY);
};

export const loadPart1SubcategoryTestData = async () => {
    return loadJsonCollection(DATA_FILES.TESTS.PART1, DATA_FILES.TESTS.DIRECTORY, '_fr_vi.json');
};

export const preloadAllData = async () => {
    try {
        const [mainData, historyData, subcategoryData] = await Promise.all([
            loadMainQuestionData(),
            loadHistoryData(),
            loadSubcategoryData()
        ]);
        return { mainData, historyData, subcategoryData };
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

export const loadPart1TestData = async (): Promise<any> => {
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

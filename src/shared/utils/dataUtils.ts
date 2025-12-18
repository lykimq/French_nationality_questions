import { ref, getDownloadURL } from 'firebase/storage';
import { storage } from '../../config/firebaseConfig';

// Cache object for Firebase Storage JSON data
type DataCache = {
    [key: string]: any;
};

let firebaseDataCache: DataCache = {};

// Cache for failed data loads to avoid repeated attempts
let failedDataCache: Set<string> = new Set();

/**
 * Loads JSON data from local files as fallback
 * @param dataPath - The path to the JSON file (e.g., "geography_fr_vi.json" or "subcategories/economy.json")
 * @returns Promise that resolves to the parsed JSON data or null if failed
 */
const getLocalJsonData = async (dataPath: string): Promise<any> => {
    try {
        // Map Firebase paths to local file paths
        const localPathMap: { [key: string]: any } = {
            'personal_fr_vi.json': require('../../data/personal_fr_vi.json'),
            'geography_fr_vi.json': require('../../data/geography_fr_vi.json'),
            'history_categories.json': require('../../data/history_categories.json'),
            'subcategories/local_gov.json': require('../../data/subcategories/local_gov.json'),
            'subcategories/monarchy.json': require('../../data/subcategories/monarchy.json'),
            'subcategories/revolution.json': require('../../data/subcategories/revolution.json'),
            'subcategories/wars.json': require('../../data/subcategories/wars.json'),
            'subcategories/republic.json': require('../../data/subcategories/republic.json'),
            'subcategories/democracy.json': require('../../data/subcategories/democracy.json'),
            'subcategories/economy.json': require('../../data/subcategories/economy.json'),
            'subcategories/culture.json': require('../../data/subcategories/culture.json'),
            'subcategories/arts.json': require('../../data/subcategories/arts.json'),
            'subcategories/celebrities.json': require('../../data/subcategories/celebrities.json'),
            'subcategories/sports.json': require('../../data/subcategories/sports.json'),
            'subcategories/holidays.json': require('../../data/subcategories/holidays.json'),
        };

        const localData = localPathMap[dataPath];
        if (localData) {
            // Cache the data
            firebaseDataCache[dataPath] = localData;
            return localData;
        }

        return null;
    } catch (error) {
        console.error(`❌ Failed to load local JSON data: ${dataPath}`, error);
        return null;
    }
};

/**
 * Gets JSON data from Firebase Storage
 * @param dataPath - The path to the JSON file (e.g., "geography_fr_vi.json" or "subcategories/economy.json")
 * @returns Promise that resolves to the parsed JSON data or null if failed
 */
const getFirebaseJsonData = async (dataPath: string): Promise<any> => {
    try {
        // Check if we have this data cached
        if (firebaseDataCache[dataPath]) {
            return firebaseDataCache[dataPath];
        }

        // If we've already failed to load this data, try local fallback
        if (failedDataCache.has(dataPath)) {
            console.log(`📦 Trying local fallback for: ${dataPath}`);
            return await getLocalJsonData(dataPath);
        }

        // Try Firebase first if available
        if (storage) {
            try {
                // Create reference to the JSON file in Firebase Storage
                // Using the structure: French_questions/data/[dataPath]
                const dataRef = ref(storage, `French_questions/data/${dataPath}`);

                // Get the download URL
                const downloadURL = await getDownloadURL(dataRef);

                // Fetch the JSON data
                const response = await fetch(downloadURL);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const jsonData = await response.json();

                // Validate the loaded data
                const validationResult = validateDataStructure(jsonData, dataPath);
                if (!validationResult.isValid) {
                    console.error(`❌ Data validation failed for ${dataPath}:`, validationResult.errors);
                }

                // Cache the data
                firebaseDataCache[dataPath] = jsonData;
                return jsonData;
            } catch (firebaseError) {
                console.warn(`⚠️ Firebase load failed for ${dataPath}, trying local fallback:`, firebaseError);
                // Fall through to local loading
            }
        } else {
            console.log(`📦 Firebase not configured, using local data for: ${dataPath}`);
        }

        // Fallback to local files
        const localData = await getLocalJsonData(dataPath);
        if (localData) {
            return localData;
        }

        // If both Firebase and local loading failed, mark as failed
        failedDataCache.add(dataPath);
        console.error(`❌ Failed to load JSON data from both Firebase and local: ${dataPath}`);
        return null;
    } catch (error) {
        console.error(`❌ Failed to load JSON data: ${dataPath}`, error);

        // Try local fallback as last resort
        const localData = await getLocalJsonData(dataPath);
        if (localData) {
            return localData;
        }

        // Add to failed cache to avoid repeated attempts
        failedDataCache.add(dataPath);

        return null;
    }
};

/**
 * Validates a single question structure
 * @param question - The question object to validate
 * @param index - The index of the question in the array
 * @param errors - Array to append errors to
 * @param summary - Summary object to update
 */
const validateQuestion = (
    question: any,
    index: number,
    errors: string[],
    summary: {
        questionsWithIds: number;
        questionsWithFrench: number;
        questionsWithExplanations: number;
        questionsWithImages: number;
    }
): void => {
    // Check for required ID
    if (typeof question.id === 'number') {
        summary.questionsWithIds++;
    } else {
        errors.push(`Question at index ${index} missing or invalid ID`);
    }

    // Check for question text
    if (question.question && typeof question.question === 'string' && question.question.trim()) {
        summary.questionsWithFrench++;
    } else {
        errors.push(`Question ${question.id || index} missing question text`);
    }

    // Check for explanation
    if (question.explanation && typeof question.explanation === 'string' && question.explanation.trim()) {
        summary.questionsWithExplanations++;
    } else {
        errors.push(`Question ${question.id || index} missing explanation`);
    }

    // Check for images
    if (question.image && question.image !== null) {
        summary.questionsWithImages++;
    }
};

/**
 * Validates the structure of loaded data to ensure it contains proper questions with IDs
 * @param data - The loaded JSON data
 * @param dataType - The type/name of the data for logging
 * @returns Validation result with details
 */
export const validateDataStructure = (data: any, dataType: string): {
    isValid: boolean;
    errors: string[];
    summary: {
        totalQuestions: number;
        questionsWithIds: number;
        questionsWithFrench: number;
        questionsWithExplanations: number;
        questionsWithImages: number;
        categoryInfo?: string;
    };
} => {
    const errors: string[] = [];
    const summary = {
        totalQuestions: 0,
        questionsWithIds: 0,
        questionsWithFrench: 0,
        questionsWithExplanations: 0,
        questionsWithImages: 0,
        categoryInfo: undefined as string | undefined,
    };

    try {
        if (!data) {
            errors.push('Data is null or undefined');
            return { isValid: false, errors, summary };
        }

        // Check if it's a category metadata structure (like history_categories.json)
        if (data.id && data.title && data.subcategories && Array.isArray(data.subcategories)) {
            summary.categoryInfo = `Category Metadata: ${data.id} - ${data.title}`;

            // Validate each subcategory
            data.subcategories.forEach((subcategory: any, index: number) => {
                if (!subcategory.id || typeof subcategory.id !== 'string') {
                    errors.push(`Subcategory at index ${index} missing or invalid ID`);
                }
                if (!subcategory.title || typeof subcategory.title !== 'string') {
                    errors.push(`Subcategory at index ${index} missing title`);
                }
                if (!subcategory.icon || typeof subcategory.icon !== 'string') {
                    errors.push(`Subcategory at index ${index} missing icon`);
                }
            });

            // For category metadata, we consider it valid if structure is correct
            // even without questions (questions are in separate subcategory files)
            const isValid = errors.length === 0;
            return { isValid, errors, summary };
        }
        // Check if it's a category data structure (main categories) or subcategory structure
        else if (data.questions && Array.isArray(data.questions)) {
            const isSubcategory = data.id && data.title;
            summary.categoryInfo = isSubcategory
                ? `Subcategory: ${data.id} - ${data.title}`
                : `Category: ${data.id || 'unknown'} - ${data.title || 'no title'}`;
            summary.totalQuestions = data.questions.length;

            // Use shared validation function for both category and subcategory questions
            data.questions.forEach((question: any, index: number) => {
                validateQuestion(question, index, errors, summary);
            });
        } else {
            errors.push(`Unknown data structure for ${dataType}`);
        }

        // For category metadata files, we don't require questions
        // For question files, we do require at least one question
        const requiresQuestions = !dataType.includes('categories');
        const isValid = errors.length === 0 && (!requiresQuestions || summary.totalQuestions > 0);
        return { isValid, errors, summary };

    } catch (error) {
        errors.push(`Exception during validation: ${error}`);
        return { isValid: false, errors, summary };
    }
};

/**
 * Gets cached JSON data if available
 * @param dataPath - The path to the JSON file
 * @returns Cached data or null
 */
export const getCachedJsonData = (dataPath: string): any => {
    return firebaseDataCache[dataPath] || null;
};

/**
 * Loads main question data files from Firebase Storage
 * @returns Promise that resolves to the loaded data structure
 */
export const loadMainQuestionData = async (): Promise<{
    personal: any;
    geography: any;
} | null> => {
    try {
        const [personal, geography] = await Promise.all([
            getFirebaseJsonData('personal_fr_vi.json'),
            getFirebaseJsonData('geography_fr_vi.json')
        ]);

        if (!personal || !geography) {
            console.error('❌ Failed to load one or more main data files');
            return null;
        }

        return {
            personal,
            geography
        };
    } catch (error) {
        console.error('❌ Error loading main question data:', error);
        return null;
    }
};

/**
 * Loads history categories data from Firebase Storage
 * @returns Promise that resolves to history categories data
 */
export const loadHistoryData = async (): Promise<any> => {
    try {
        const data = await getFirebaseJsonData('history_categories.json');
        return data;
    } catch (error) {
        console.error('❌ Error loading history data:', error);
        return null;
    }
};

/**
 * Loads all subcategory data from Firebase Storage
 * @returns Promise that resolves to subcategory data map
 */
export const loadSubcategoryData = async (): Promise<{ [key: string]: any }> => {
    try {
        const subcategoryFiles = [
            'local_gov.json',
            'monarchy.json',
            'revolution.json',
            'wars.json',
            'republic.json',
            'democracy.json',
            'economy.json',
            'culture.json',
            'arts.json',
            'celebrities.json',
            'sports.json',
            'holidays.json'
        ];

        // Load all subcategory files in parallel
        const subcategoryPromises = subcategoryFiles.map(async (filename) => {
            const key = filename.replace('.json', '');
            const data = await getFirebaseJsonData(`subcategories/${filename}`);
            return { key, data };
        });

        const results = await Promise.all(subcategoryPromises);

        // Build the subcategory data map
        const subcategoryDataMap: { [key: string]: any } = {};

        results.forEach(({ key, data }) => {
            if (data) {
                subcategoryDataMap[key] = data;
            } else {
                console.warn(`⚠️ Failed to load subcategory: ${key}`);
            }
        });

        return subcategoryDataMap;
    } catch (error) {
        console.error('❌ Error loading subcategory data:', error);
        return {};
    }
};

/**
 * Preloads all JSON data files for better performance
 * @returns Promise that resolves when preloading is complete
 */
export const preloadAllData = async (): Promise<{
    mainData: any;
    historyData: any;
    subcategoryData: any;
}> => {
    try {
        // Load all data in parallel
        const [mainData, historyData, subcategoryData] = await Promise.all([
            loadMainQuestionData(),
            loadHistoryData(),
            loadSubcategoryData()
        ]);

        return {
            mainData,
            historyData,
            subcategoryData
        };
    } catch (error) {
        console.error('❌ Error during data preloading:', error);
        throw error;
    }
};

/**
 * Clears the data cache - useful for memory management or forcing refresh
 */
export const clearDataCache = (): void => {
    firebaseDataCache = {};
    failedDataCache.clear();
};

/**
 * Gets cache statistics for debugging
 */
export const getDataCacheStats = () => {
    return {
        cachedFiles: Object.keys(firebaseDataCache).length,
        failedFiles: failedDataCache.size,
        cacheSize: JSON.stringify(firebaseDataCache).length
    };
};

/**
 * Loads Part 1 test categories data from Firebase Storage
 * @returns Promise that resolves to part 1 test categories data
 */
export const loadPart1TestData = async (): Promise<any> => {
    try {
        // Create a virtual category structure based on the existing test files
        const part1TestData = {
            id: "test_part1",
            title: "Première partie : Tests de connaissances",
            icon: "book",
            description: "Première partie des tests divisée en trois sous-catégories",
            subcategories: [
                {
                    id: "test_personal",
                    title: "Informations personnelles",
                    icon: "person",
                    description: "Questions sur la vie personnelle et l'entourage"
                },
                {
                    id: "test_opinions",
                    title: "Vos opinions",
                    icon: "chatbox",
                    description: "Questions sur vos opinions concernant la France"
                },
                {
                    id: "test_daily_life",
                    title: "Vie quotidienne",
                    icon: "calendar",
                    description: "Questions sur la vie quotidienne, le travail et les loisirs"
                }
            ]
        };

        return part1TestData;
    } catch (error) {
        console.error('❌ Error loading Part 1 test data:', error);
        return null;
    }
};

/**
 * Loads all Part 1 subcategory test data from Firebase Storage
 * @returns Promise that resolves to subcategory test data map
 */
export const loadPart1SubcategoryTestData = async (): Promise<{ [key: string]: any }> => {
    try {
        const subcategoryFiles = [
            'test_personal_fr_vi.json',
            'test_opinions_fr_vi.json',
            'test_daily_life_fr_vi.json'
        ];

        // Load all subcategory files in parallel
        const subcategoryPromises = subcategoryFiles.map(async (filename) => {
            const key = filename.replace('_fr_vi.json', '');
            const data = await getFirebaseJsonData(`tests/${filename}`);
            return { key, data };
        });

        const results = await Promise.all(subcategoryPromises);

        // Build the subcategory data map
        const subcategoryDataMap: { [key: string]: any } = {};

        results.forEach(({ key, data }) => {
            if (data) {
                subcategoryDataMap[key] = data;
            } else {
                console.warn(`⚠️ Failed to load Part 1 test subcategory: ${key}`);
            }
        });

        return subcategoryDataMap;
    } catch (error) {
        console.error('❌ Error loading Part 1 subcategory test data:', error);
        return {};
    }
};

/**
 * Preloads all Part 1 test JSON data files for better performance
 * @returns Promise that resolves when preloading is complete
 */
export const preloadAllPart1TestData = async (): Promise<{
    part1TestData: any;
    part1SubcategoryTestData: any;
}> => {
    try {
        // Load all data in parallel
        const [part1TestData, part1SubcategoryTestData] = await Promise.all([
            loadPart1TestData(),
            loadPart1SubcategoryTestData()
        ]);

        return {
            part1TestData,
            part1SubcategoryTestData
        };
    } catch (error) {
        console.error('❌ Error during Part 1 test data preloading:', error);
        throw error;
    }
};
import { ref, getDownloadURL } from 'firebase/storage';
import { storage } from '../config/firebaseConfig';

// Cache object for Firebase Storage JSON data
type DataCache = {
    [key: string]: any;
};

let firebaseDataCache: DataCache = {};

// Cache for failed data loads to avoid repeated attempts
let failedDataCache: Set<string> = new Set();

/**
 * Gets JSON data from Firebase Storage
 * @param dataPath - The path to the JSON file (e.g., "geography_fr_vi.json" or "subcategories/economy.json")
 * @returns Promise that resolves to the parsed JSON data or null if failed
 */
const getFirebaseJsonData = async (dataPath: string): Promise<any> => {
    try {
        // If we've already failed to load this data, don't try again
        if (failedDataCache.has(dataPath)) {
            console.warn(`Data previously failed to load: ${dataPath}`);
            return null;
        }

        // Check if we have this data cached
        if (firebaseDataCache[dataPath]) {
            return firebaseDataCache[dataPath];
        }

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

        // Cache the data
        firebaseDataCache[dataPath] = jsonData;

        console.log(`Successfully loaded JSON data from Firebase: ${dataPath}`);
        return jsonData;
    } catch (error) {
        console.error(`Failed to load JSON data from Firebase Storage: ${dataPath}`, error);

        // Add to failed cache to avoid repeated attempts
        failedDataCache.add(dataPath);

        return null;
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
    personal_fr_vi: any;
    geography_fr_vi: any;
} | null> => {
    try {
        console.log('Loading main question data from Firebase Storage...');

        const [personal_fr_vi, geography_fr_vi] = await Promise.all([
            getFirebaseJsonData('personal_fr_vi.json'),
            getFirebaseJsonData('geography_fr_vi.json')
        ]);

        if (!personal_fr_vi || !geography_fr_vi) {
            console.error('Failed to load one or more main data files');
            return null;
        }

        return {
            personal_fr_vi,
            geography_fr_vi
        };
    } catch (error) {
        console.error('Error loading main question data:', error);
        return null;
    }
};

/**
 * Loads history categories data from Firebase Storage
 * @returns Promise that resolves to history categories data
 */
export const loadHistoryData = async (): Promise<any> => {
    try {
        console.log('Loading history categories data from Firebase Storage...');
        return await getFirebaseJsonData('history_categories.json');
    } catch (error) {
        console.error('Error loading history data:', error);
        return null;
    }
};

/**
 * Loads all subcategory data from Firebase Storage
 * @returns Promise that resolves to subcategory data map
 */
export const loadSubcategoryData = async (): Promise<{ [key: string]: any }> => {
    try {
        console.log('Loading subcategory data from Firebase Storage...');

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
        let loadedCount = 0;
        let failedCount = 0;

        results.forEach(({ key, data }) => {
            if (data) {
                subcategoryDataMap[key] = data;
                loadedCount++;
            } else {
                failedCount++;
                console.warn(`Failed to load subcategory: ${key}`);
            }
        });

        console.log(`Subcategory loading complete: ${loadedCount} loaded, ${failedCount} failed`);
        return subcategoryDataMap;
    } catch (error) {
        console.error('Error loading subcategory data:', error);
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
        console.log('Starting to preload all JSON data from Firebase Storage...');

        // Load all data in parallel
        const [mainData, historyData, subcategoryData] = await Promise.all([
            loadMainQuestionData(),
            loadHistoryData(),
            loadSubcategoryData()
        ]);

        console.log('All JSON data preloaded successfully');

        return {
            mainData,
            historyData,
            subcategoryData
        };
    } catch (error) {
        console.error('Error during data preloading:', error);
        throw error;
    }
};

/**
 * Clears the data cache - useful for memory management or forcing refresh
 */
export const clearDataCache = (): void => {
    firebaseDataCache = {};
    failedDataCache.clear();
    console.log('Data cache cleared');
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
 * Validates that required data structure is present
 * @param data - The data to validate
 * @param dataType - Type of data for error messages
 * @returns boolean indicating if data is valid
 */
export const validateDataStructure = (data: any, dataType: string): boolean => {
    if (!data) {
        console.error(`${dataType} data is null or undefined`);
        return false;
    }

    // Add specific validation logic based on your data structure requirements
    if (dataType === 'mainData' && (!data.personal_fr_vi || !data.geography_fr_vi)) {
        console.error('Main data missing required files');
        return false;
    }

    return true;
};
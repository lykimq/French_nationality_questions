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
            console.warn(`⚠️ Data previously failed to load: ${dataPath}`);
            return null;
        }

        // Check if we have this data cached
        if (firebaseDataCache[dataPath]) {
            console.log(`📋 Using cached data for: ${dataPath}`);
            return firebaseDataCache[dataPath];
        }

        console.log(`🔄 Loading data from Firebase Storage: ${dataPath}`);

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
        } else {
            console.log(`✅ Data validation passed for ${dataPath}:`, validationResult.summary);
        }

        // Cache the data
        firebaseDataCache[dataPath] = jsonData;

        console.log(`✅ Successfully loaded JSON data from Firebase: ${dataPath}`);
        return jsonData;
    } catch (error) {
        console.error(`❌ Failed to load JSON data from Firebase Storage: ${dataPath}`, error);

        // Add to failed cache to avoid repeated attempts
        failedDataCache.add(dataPath);

        return null;
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
        questionsWithVietnamese: number;
        questionsWithExplanations: number;
        questionsWithVietnameseExplanations: number;
        questionsWithImages: number;
        categoryInfo?: string;
    };
} => {
    const errors: string[] = [];
    const summary = {
        totalQuestions: 0,
        questionsWithIds: 0,
        questionsWithFrench: 0,
        questionsWithVietnamese: 0,
        questionsWithExplanations: 0,
        questionsWithVietnameseExplanations: 0,
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
        // Check if it's a category data structure (main categories)
        else if (data.questions && Array.isArray(data.questions)) {
            summary.categoryInfo = `Category: ${data.id || 'unknown'} - ${data.title || 'no title'}`;
            summary.totalQuestions = data.questions.length;

            data.questions.forEach((question: any, index: number) => {
                // Check for required ID
                if (typeof question.id === 'number') {
                    summary.questionsWithIds++;
                } else {
                    errors.push(`Question at index ${index} missing or invalid ID`);
                }

                // Check for French question text
                if (question.question && typeof question.question === 'string' && question.question.trim()) {
                    summary.questionsWithFrench++;
                } else {
                    errors.push(`Question ${question.id || index} missing French text`);
                }

                // Check for Vietnamese question text
                if (question.question_vi && typeof question.question_vi === 'string' && question.question_vi.trim()) {
                    summary.questionsWithVietnamese++;
                }

                // Check for French explanation
                if (question.explanation && typeof question.explanation === 'string' && question.explanation.trim()) {
                    summary.questionsWithExplanations++;
                } else {
                    errors.push(`Question ${question.id || index} missing French explanation`);
                }

                // Check for Vietnamese explanation
                if (question.explanation_vi && typeof question.explanation_vi === 'string' && question.explanation_vi.trim()) {
                    summary.questionsWithVietnameseExplanations++;
                }

                // Check for images
                if (question.image && question.image !== null) {
                    summary.questionsWithImages++;
                }
            });
        }
        // Check if it's a subcategory structure (history subcategories)
        else if (data.id && data.title && data.questions && Array.isArray(data.questions)) {
            summary.categoryInfo = `Subcategory: ${data.id} - ${data.title}`;
            summary.totalQuestions = data.questions.length;

            data.questions.forEach((question: any, index: number) => {
                // Same validation as above
                if (typeof question.id === 'number') {
                    summary.questionsWithIds++;
                } else {
                    errors.push(`Question at index ${index} missing or invalid ID`);
                }

                if (question.question && typeof question.question === 'string' && question.question.trim()) {
                    summary.questionsWithFrench++;
                } else {
                    errors.push(`Question ${question.id || index} missing French text`);
                }

                if (question.question_vi && typeof question.question_vi === 'string' && question.question_vi.trim()) {
                    summary.questionsWithVietnamese++;
                }

                if (question.explanation && typeof question.explanation === 'string' && question.explanation.trim()) {
                    summary.questionsWithExplanations++;
                } else {
                    errors.push(`Question ${question.id || index} missing French explanation`);
                }

                if (question.explanation_vi && typeof question.explanation_vi === 'string' && question.explanation_vi.trim()) {
                    summary.questionsWithVietnameseExplanations++;
                }

                if (question.image && question.image !== null) {
                    summary.questionsWithImages++;
                }
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
 * Logs detailed information about loaded questions for debugging
 * @param data - The loaded data
 * @param dataName - Name for logging
 */
export const logQuestionDetails = (data: any, dataName: string): void => {
    if (!data) {
        console.warn(`⚠️ No data to log for ${dataName}`);
        return;
    }

    console.log(`📊 Question Details for ${dataName}:`);

    const questions = data.questions || [];
    if (questions.length === 0) {
        console.warn(`⚠️ No questions found in ${dataName}`);
        return;
    }

    // Log first few questions for debugging
    const samplesToLog = Math.min(3, questions.length);
    console.log(`📝 Sample questions (first ${samplesToLog} of ${questions.length}):`);

    for (let i = 0; i < samplesToLog; i++) {
        const question = questions[i];
        console.log(`Question ${i + 1}:`, {
            id: question.id,
            questionFr: question.question?.substring(0, 100) + '...' || 'No French text',
            questionVi: question.question_vi?.substring(0, 100) + '...' || 'No Vietnamese text',
            explanationFr: question.explanation?.substring(0, 100) + '...' || 'No French explanation',
            explanationVi: question.explanation_vi?.substring(0, 100) + '...' || 'No Vietnamese explanation',
            hasImage: !!question.image,
        });
    }

    // Log ID distribution
    const ids = questions.map((q: any) => q.id).filter((id: any) => typeof id === 'number');
    const minId = Math.min(...ids);
    const maxId = Math.max(...ids);
    const duplicateIds = ids.filter((id: number, index: number) => ids.indexOf(id) !== index);

    console.log(`🔢 ID Statistics for ${dataName}:`, {
        totalQuestions: questions.length,
        validIds: ids.length,
        idRange: `${minId} - ${maxId}`,
        duplicateIds: duplicateIds.length > 0 ? duplicateIds : 'None',
    });
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
        console.log('🔄 Loading main question data from Firebase Storage...');

        const [personal_fr_vi, geography_fr_vi] = await Promise.all([
            getFirebaseJsonData('personal_fr_vi.json'),
            getFirebaseJsonData('geography_fr_vi.json')
        ]);

        if (!personal_fr_vi || !geography_fr_vi) {
            console.error('❌ Failed to load one or more main data files');
            return null;
        }

        // Log detailed information about loaded data
        logQuestionDetails(personal_fr_vi, 'Personal Questions');
        logQuestionDetails(geography_fr_vi, 'Geography Questions');

        console.log('✅ Main question data loaded successfully');
        return {
            personal_fr_vi,
            geography_fr_vi
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
        console.log('🔄 Loading history categories data from Firebase Storage...');
        const data = await getFirebaseJsonData('history_categories.json');

        if (data) {
            console.log('📊 History Categories loaded:', {
                categoriesCount: data.subcategories?.length || 0,
                title: data.title || 'No title',
                hasSubcategories: !!data.subcategories
            });
        }

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
        console.log('🔄 Loading subcategory data from Firebase Storage...');

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
        let totalQuestionsLoaded = 0;

        results.forEach(({ key, data }) => {
            if (data) {
                subcategoryDataMap[key] = data;
                loadedCount++;

                // Log details about this subcategory
                logQuestionDetails(data, `Subcategory: ${key}`);

                if (data.questions && Array.isArray(data.questions)) {
                    totalQuestionsLoaded += data.questions.length;
                }
            } else {
                failedCount++;
                console.warn(`⚠️ Failed to load subcategory: ${key}`);
            }
        });

        console.log(`📊 Subcategory loading summary:`, {
            totalFiles: subcategoryFiles.length,
            loaded: loadedCount,
            failed: failedCount,
            totalQuestions: totalQuestionsLoaded
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
        console.log('🚀 Starting to preload all JSON data from Firebase Storage...');

        // Load all data in parallel
        const [mainData, historyData, subcategoryData] = await Promise.all([
            loadMainQuestionData(),
            loadHistoryData(),
            loadSubcategoryData()
        ]);

        // Calculate total questions loaded
        let totalQuestions = 0;

        if (mainData) {
            if (mainData.personal_fr_vi?.questions) {
                totalQuestions += mainData.personal_fr_vi.questions.length;
            }
            if (mainData.geography_fr_vi?.questions) {
                totalQuestions += mainData.geography_fr_vi.questions.length;
            }
        }

        Object.values(subcategoryData).forEach((subcategory: any) => {
            if (subcategory?.questions) {
                totalQuestions += subcategory.questions.length;
            }
        });

        console.log('🎉 All JSON data preloaded successfully!', {
            mainDataLoaded: !!mainData,
            historyDataLoaded: !!historyData,
            subcategoriesLoaded: Object.keys(subcategoryData).length,
            totalQuestionsAvailable: totalQuestions
        });

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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { preloadAllPart1TestData } from '../shared/dataUtils';
import {
    STORAGE_KEYS,
    DEFAULT_TEST_PROGRESS,
    DEFAULT_TEST_STATISTICS,
    MEMORY_LIMITS
} from '../../constants/testConstants';
import { safeParseDate, applyMemoryLimits } from './testDataUtils';
import type { TestProgress, TestStatistics } from '../../types';

// Load test progress from storage with validation and memory limits
export const loadTestProgress = async (): Promise<TestProgress> => {
    try {
        const progressData = await AsyncStorage.getItem(STORAGE_KEYS.TEST_PROGRESS);
        if (!progressData) {
            return DEFAULT_TEST_PROGRESS;
        }

        const parsedProgress = JSON.parse(progressData);

        // Validate and sanitize progress data with memory limits
        return {
            ...DEFAULT_TEST_PROGRESS,
            ...parsedProgress,
            // Ensure arrays exist and are valid with memory limits
            weakCategories: Array.isArray(parsedProgress.weakCategories)
                ? parsedProgress.weakCategories
                : [],
            strongCategories: Array.isArray(parsedProgress.strongCategories)
                ? parsedProgress.strongCategories
                : [],
            incorrectQuestions: Array.isArray(parsedProgress.incorrectQuestions)
                ? applyMemoryLimits(parsedProgress.incorrectQuestions, MEMORY_LIMITS.MAX_INCORRECT_QUESTIONS)
                : [],
            recentScores: Array.isArray(parsedProgress.recentScores)
                ? applyMemoryLimits(parsedProgress.recentScores, MEMORY_LIMITS.MAX_RECENT_SCORES)
                : [],
        };
    } catch (error) {
        console.error('Error loading test progress:', error);
        return DEFAULT_TEST_PROGRESS;
    }
};

// Load test statistics from storage with validation and memory limits
export const loadTestStatistics = async (): Promise<TestStatistics> => {
    try {
        const statisticsData = await AsyncStorage.getItem(STORAGE_KEYS.TEST_STATISTICS);
        if (!statisticsData) {
            return DEFAULT_TEST_STATISTICS;
        }

        const parsedStatistics = JSON.parse(statisticsData);

        // Clean and validate category performance data
        if (parsedStatistics.categoryPerformance) {
            Object.keys(parsedStatistics.categoryPerformance).forEach(categoryId => {
                const catPerf = parsedStatistics.categoryPerformance[categoryId];

                // Clean up lastAttempted field safely
                if (catPerf.lastAttempted) {
                    catPerf.lastAttempted = safeParseDate(catPerf.lastAttempted);
                }
            });
        }

        // Validate and set default values with memory limits
        return {
            ...DEFAULT_TEST_STATISTICS,
            ...parsedStatistics,
            categoryPerformance: parsedStatistics.categoryPerformance || {},
            masteredQuestions: Array.isArray(parsedStatistics.masteredQuestions)
                ? applyMemoryLimits(parsedStatistics.masteredQuestions, MEMORY_LIMITS.MAX_MASTERED_QUESTIONS)
                : [],
            strugglingQuestions: Array.isArray(parsedStatistics.strugglingQuestions)
                ? applyMemoryLimits(parsedStatistics.strugglingQuestions, MEMORY_LIMITS.MAX_STRUGGLING_QUESTIONS)
                : [],
        };
    } catch (error) {
        console.error('Error loading test statistics:', error);
        return DEFAULT_TEST_STATISTICS;
    }
};

// Load Part 1 test subcategory data from storage
export const loadPart1TestSubcategoryData = async (): Promise<Record<string, any>> => {
    try {
        const { part1SubcategoryTestData } = await preloadAllPart1TestData();

        if (part1SubcategoryTestData) {
            return part1SubcategoryTestData;
        }

        return {};
    } catch (error) {
        console.error('❌ Error loading Part 1 test subcategory data:', error);
        return {};
    }
};

// Save test data to storage
export const saveTestData = async (
    progress: TestProgress,
    statistics: TestStatistics
): Promise<void> => {
    try {
        await Promise.all([
            AsyncStorage.setItem(STORAGE_KEYS.TEST_PROGRESS, JSON.stringify(progress)),
            AsyncStorage.setItem(STORAGE_KEYS.TEST_STATISTICS, JSON.stringify(statistics))
        ]);
    } catch (error) {
        console.error('❌ Error saving test data:', error);
        throw error; // Re-throw to handle in calling code
    }
};

// Load all test data
export const loadAllTestData = async (): Promise<{
    progress: TestProgress;
    statistics: TestStatistics;
    part1Data: Record<string, any>;
}> => {
    try {
        const [progress, statistics, part1Data] = await Promise.all([
            loadTestProgress(),
            loadTestStatistics(),
            loadPart1TestSubcategoryData()
        ]);

        return { progress, statistics, part1Data };
    } catch (error) {
        console.error('❌ Error loading test data:', error);
        throw error;
    }
};
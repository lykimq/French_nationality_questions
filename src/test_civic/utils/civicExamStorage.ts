import AsyncStorage from '@react-native-async-storage/async-storage';
import { safeParseDate, applyMemoryLimits } from '../../test/utils/testDataUtils';
import type { CivicExamProgress, CivicExamStatistics } from '../types';

// Storage keys for civic exam
export const CIVIC_EXAM_STORAGE_KEYS = {
    CIVIC_EXAM_PROGRESS: 'civic_exam_progress',
    CIVIC_EXAM_STATISTICS: 'civic_exam_statistics',
} as const;

// Memory limits
const MEMORY_LIMITS = {
    MAX_INCORRECT_QUESTIONS: 100,
    MAX_RECENT_SCORES: 10,
} as const;

// Default civic exam progress
export const DEFAULT_CIVIC_EXAM_PROGRESS: CivicExamProgress = {
    totalExamsTaken: 0,
    totalPracticeSessions: 0,
    averageScore: 0,
    bestScore: 0,
    passedExams: 0,
    failedExams: 0,
    questionsAnswered: 0,
    correctAnswersTotal: 0,
    incorrectQuestions: [],
    recentScores: [],
    themePerformance: {
        principles_values: { questionsAttempted: 0, correctAnswers: 0, accuracy: 0 },
        institutional_political: { questionsAttempted: 0, correctAnswers: 0, accuracy: 0 },
        rights_duties: { questionsAttempted: 0, correctAnswers: 0, accuracy: 0 },
        history_geography_culture: { questionsAttempted: 0, correctAnswers: 0, accuracy: 0 },
        living_society: { questionsAttempted: 0, correctAnswers: 0, accuracy: 0 },
    },
};

// Default civic exam statistics
export const DEFAULT_CIVIC_EXAM_STATISTICS: CivicExamStatistics = {
    categoryPerformance: {},
    timeStats: {
        averageTimePerQuestion: 30,
        fastestTime: 5,
        slowestTime: 120,
    },
    improvementTrend: 'stable',
    masteredQuestions: [],
    strugglingQuestions: [],
    themeBreakdown: {
        principles_values: { questionsAttempted: 0, correctAnswers: 0, accuracy: 0 },
        institutional_political: { questionsAttempted: 0, correctAnswers: 0, accuracy: 0 },
        rights_duties: { questionsAttempted: 0, correctAnswers: 0, accuracy: 0 },
        history_geography_culture: { questionsAttempted: 0, correctAnswers: 0, accuracy: 0 },
        living_society: { questionsAttempted: 0, correctAnswers: 0, accuracy: 0 },
    },
};

// Load civic exam progress from storage
export const loadCivicExamProgress = async (): Promise<CivicExamProgress> => {
    try {
        const progressData = await AsyncStorage.getItem(CIVIC_EXAM_STORAGE_KEYS.CIVIC_EXAM_PROGRESS);
        if (!progressData) {
            return DEFAULT_CIVIC_EXAM_PROGRESS;
        }

        const parsedProgress = JSON.parse(progressData);

        return {
            ...DEFAULT_CIVIC_EXAM_PROGRESS,
            ...parsedProgress,
            incorrectQuestions: Array.isArray(parsedProgress.incorrectQuestions)
                ? applyMemoryLimits(parsedProgress.incorrectQuestions, MEMORY_LIMITS.MAX_INCORRECT_QUESTIONS)
                : [],
            recentScores: Array.isArray(parsedProgress.recentScores)
                ? applyMemoryLimits(parsedProgress.recentScores, MEMORY_LIMITS.MAX_RECENT_SCORES)
                : [],
            themePerformance: {
                ...DEFAULT_CIVIC_EXAM_PROGRESS.themePerformance,
                ...(parsedProgress.themePerformance || {}),
            },
        };
    } catch (error) {
        console.error('Error loading civic exam progress:', error);
        return DEFAULT_CIVIC_EXAM_PROGRESS;
    }
};

// Load civic exam statistics from storage
export const loadCivicExamStatistics = async (): Promise<CivicExamStatistics> => {
    try {
        const statisticsData = await AsyncStorage.getItem(CIVIC_EXAM_STORAGE_KEYS.CIVIC_EXAM_STATISTICS);
        if (!statisticsData) {
            return DEFAULT_CIVIC_EXAM_STATISTICS;
        }

        const parsedStatistics = JSON.parse(statisticsData);

        // Clean and validate category performance data
        if (parsedStatistics.categoryPerformance) {
            Object.keys(parsedStatistics.categoryPerformance).forEach(categoryId => {
                const catPerf = parsedStatistics.categoryPerformance[categoryId];
                if (catPerf.lastAttempted) {
                    catPerf.lastAttempted = safeParseDate(catPerf.lastAttempted);
                }
            });
        }

        return {
            ...DEFAULT_CIVIC_EXAM_STATISTICS,
            ...parsedStatistics,
            categoryPerformance: parsedStatistics.categoryPerformance || {},
            masteredQuestions: Array.isArray(parsedStatistics.masteredQuestions)
                ? applyMemoryLimits(parsedStatistics.masteredQuestions, 500)
                : [],
            strugglingQuestions: Array.isArray(parsedStatistics.strugglingQuestions)
                ? applyMemoryLimits(parsedStatistics.strugglingQuestions, 200)
                : [],
            themeBreakdown: {
                ...DEFAULT_CIVIC_EXAM_STATISTICS.themeBreakdown,
                ...(parsedStatistics.themeBreakdown || {}),
            },
        };
    } catch (error) {
        console.error('Error loading civic exam statistics:', error);
        return DEFAULT_CIVIC_EXAM_STATISTICS;
    }
};

// Save civic exam data to storage
export const saveCivicExamData = async (
    progress: CivicExamProgress,
    statistics: CivicExamStatistics
): Promise<void> => {
    try {
        await Promise.all([
            AsyncStorage.setItem(CIVIC_EXAM_STORAGE_KEYS.CIVIC_EXAM_PROGRESS, JSON.stringify(progress)),
            AsyncStorage.setItem(CIVIC_EXAM_STORAGE_KEYS.CIVIC_EXAM_STATISTICS, JSON.stringify(statistics))
        ]);
    } catch (error) {
        console.error('❌ Error saving civic exam data:', error);
        throw error;
    }
};

// Load all civic exam data
export const loadAllCivicExamData = async (): Promise<{
    progress: CivicExamProgress;
    statistics: CivicExamStatistics;
}> => {
    try {
        const [progress, statistics] = await Promise.all([
            loadCivicExamProgress(),
            loadCivicExamStatistics()
        ]);

        return { progress, statistics };
    } catch (error) {
        console.error('❌ Error loading civic exam data:', error);
        throw error;
    }
};


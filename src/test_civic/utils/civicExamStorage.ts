import AsyncStorage from '@react-native-async-storage/async-storage';
import { createLogger } from '../../shared/utils/logger';
import { safeParseDate, applyMemoryLimits } from '../../shared/utils/questionUtils';
import type { CivicExamProgress, CivicExamStatistics, CivicExamTheme } from '../types';
import {
    DEFAULT_THEME_PERFORMANCE,
    createDefaultCivicExamProgress,
    createDefaultCivicExamStatistics,
} from './civicExamDefaults';

const logger = createLogger('CivicExamStorage');

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
export const DEFAULT_CIVIC_EXAM_PROGRESS: CivicExamProgress = createDefaultCivicExamProgress();

// Default civic exam statistics
export const DEFAULT_CIVIC_EXAM_STATISTICS: CivicExamStatistics = createDefaultCivicExamStatistics();

const validateNumber = (value: unknown, defaultValue: number = 0): number => {
    return typeof value === 'number' && isFinite(value) && value >= 0 ? value : defaultValue;
};

const validateArray = <T>(value: unknown, validator: (item: unknown) => item is T): T[] => {
    return Array.isArray(value) ? value.filter(validator) : [];
};

// Load civic exam progress from storage
export const loadCivicExamProgress = async (): Promise<CivicExamProgress> => {
    try {
        const progressData = await AsyncStorage.getItem(CIVIC_EXAM_STORAGE_KEYS.CIVIC_EXAM_PROGRESS);
        if (!progressData) {
            return DEFAULT_CIVIC_EXAM_PROGRESS;
        }

        let parsedProgress: unknown;
        try {
            parsedProgress = JSON.parse(progressData);
        } catch (parseError) {
            logger.error('Failed to parse progress data:', parseError);
            return DEFAULT_CIVIC_EXAM_PROGRESS;
        }

        if (typeof parsedProgress !== 'object' || parsedProgress === null) {
            return DEFAULT_CIVIC_EXAM_PROGRESS;
        }

        const progress = parsedProgress as Record<string, unknown>;

        const loadThemePerformance = (theme: CivicExamTheme) => {
            const themeData = (progress.themePerformance as Record<string, unknown>)?.[theme] as Record<string, unknown> | undefined;
            return {
                questionsAttempted: validateNumber(themeData?.questionsAttempted, 0),
                correctAnswers: validateNumber(themeData?.correctAnswers, 0),
                accuracy: validateNumber(themeData?.accuracy, 0),
            };
        };

        const validateQuestionId = (id: unknown): id is number => {
            return typeof id === 'number' && isFinite(id) && id > 0;
        };

        const validateScore = (score: unknown): score is number => {
            return typeof score === 'number' && isFinite(score) && score >= 0 && score <= 100;
        };

        const loadedProgress: CivicExamProgress = {
            totalExamsTaken: validateNumber(progress.totalExamsTaken, 0),
            totalPracticeSessions: validateNumber(progress.totalPracticeSessions, 0),
            averageScore: validateScore(progress.averageScore) ? progress.averageScore : 0,
            bestScore: validateScore(progress.bestScore) ? progress.bestScore : 0,
            passedExams: validateNumber(progress.passedExams, 0),
            failedExams: validateNumber(progress.failedExams, 0),
            questionsAnswered: validateNumber(progress.questionsAnswered, 0),
            correctAnswersTotal: validateNumber(progress.correctAnswersTotal, 0),
            incorrectQuestions: applyMemoryLimits(
                validateArray(progress.incorrectQuestions, validateQuestionId),
                MEMORY_LIMITS.MAX_INCORRECT_QUESTIONS
            ),
            recentScores: applyMemoryLimits(
                validateArray(progress.recentScores, validateScore),
                MEMORY_LIMITS.MAX_RECENT_SCORES
            ),
            themePerformance: {
                principles_values: loadThemePerformance('principles_values'),
                institutional_political: loadThemePerformance('institutional_political'),
                rights_duties: loadThemePerformance('rights_duties'),
                history_geography_culture: loadThemePerformance('history_geography_culture'),
                living_society: loadThemePerformance('living_society'),
            },
            createdAt: progress.createdAt ? safeParseDate(progress.createdAt) : new Date(),
            updatedAt: progress.updatedAt ? safeParseDate(progress.updatedAt) : new Date(),
        };

        return loadedProgress;
    } catch (error) {
        logger.error('Error loading civic exam progress:', error);
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

        let parsedStatistics: unknown;
        try {
            parsedStatistics = JSON.parse(statisticsData);
        } catch (parseError) {
            logger.error('Failed to parse statistics data:', parseError);
            return DEFAULT_CIVIC_EXAM_STATISTICS;
        }

        if (typeof parsedStatistics !== 'object' || parsedStatistics === null) {
            return DEFAULT_CIVIC_EXAM_STATISTICS;
        }

        const stats = parsedStatistics as Record<string, unknown>;

        const validateQuestionId = (id: unknown): id is number => {
            return typeof id === 'number' && isFinite(id) && id > 0;
        };

        const categoryPerformance: Record<string, any> = {};
        if (typeof stats.categoryPerformance === 'object' && stats.categoryPerformance !== null) {
            const catPerf = stats.categoryPerformance as Record<string, unknown>;
            Object.keys(catPerf).forEach(categoryId => {
                const catData = catPerf[categoryId];
                if (typeof catData === 'object' && catData !== null) {
                    const perf = catData as Record<string, unknown>;
                    categoryPerformance[categoryId] = {
                        ...perf,
                        lastAttempted: perf.lastAttempted ? safeParseDate(perf.lastAttempted) : undefined,
                    };
                }
            });
        }

        return {
            ...DEFAULT_CIVIC_EXAM_STATISTICS,
            categoryPerformance,
            masteredQuestions: applyMemoryLimits(
                validateArray(stats.masteredQuestions, validateQuestionId),
                500
            ),
            strugglingQuestions: applyMemoryLimits(
                validateArray(stats.strugglingQuestions, validateQuestionId),
                200
            ),
            themeBreakdown: {
                ...DEFAULT_CIVIC_EXAM_STATISTICS.themeBreakdown,
                ...(typeof stats.themeBreakdown === 'object' && stats.themeBreakdown !== null
                    ? stats.themeBreakdown
                    : {}),
            },
        };
    } catch (error) {
        logger.error('Error loading civic exam statistics:', error);
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
        logger.error('Error saving civic exam data:', error);
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
        logger.error('Error loading civic exam data:', error);
        throw error;
    }
};

// Reset all civic exam data to defaults
export const resetCivicExamData = async (): Promise<void> => {
    try {
        await Promise.all([
            AsyncStorage.removeItem(CIVIC_EXAM_STORAGE_KEYS.CIVIC_EXAM_PROGRESS),
            AsyncStorage.removeItem(CIVIC_EXAM_STORAGE_KEYS.CIVIC_EXAM_STATISTICS)
        ]);

        const freshProgress = createDefaultCivicExamProgress();
        const freshStatistics = createDefaultCivicExamStatistics();

        await Promise.all([
            AsyncStorage.setItem(CIVIC_EXAM_STORAGE_KEYS.CIVIC_EXAM_PROGRESS, JSON.stringify(freshProgress)),
            AsyncStorage.setItem(CIVIC_EXAM_STORAGE_KEYS.CIVIC_EXAM_STATISTICS, JSON.stringify(freshStatistics))
        ]);
    } catch (error) {
        logger.error('Error resetting civic exam data:', error);
        throw error;
    }
};


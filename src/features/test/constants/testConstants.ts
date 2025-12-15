import type { TestProgress, TestStatistics } from '../../../types';

// Storage keys for AsyncStorage
export const STORAGE_KEYS = {
    TEST_PROGRESS: 'test_progress',
    TEST_SESSIONS: 'test_sessions',
    TEST_STATISTICS: 'test_statistics',
} as const;

// Memory management constants to prevent unbounded growth
export const MEMORY_LIMITS = {
    MAX_INCORRECT_QUESTIONS: 100,
    MAX_MASTERED_QUESTIONS: 500,
    MAX_STRUGGLING_QUESTIONS: 200,
    MAX_RECENT_SCORES: 10,
} as const;

// Part 1 test ID mapping for better maintainability
export const PART1_ID_OFFSETS = {
    test_personal: 10000,
    test_opinions: 11000,
    test_general: 12000,
} as const;

// Default test progress state
export const DEFAULT_TEST_PROGRESS: TestProgress = {
    totalTestsTaken: 0,
    averageScore: 0,
    bestScore: 0,
    weakCategories: [],
    strongCategories: [],
    questionsAnswered: 0,
    correctAnswersTotal: 0,
    incorrectQuestions: [],
    recentScores: [],
};

// Default test statistics state
export const DEFAULT_TEST_STATISTICS: TestStatistics = {
    categoryPerformance: {},
    timeStats: {
        averageTimePerQuestion: 30,
        fastestTime: 5,
        slowestTime: 120,
    },
    improvementTrend: 'stable',
    masteredQuestions: [],
    strugglingQuestions: [],
};

// Performance thresholds for recommendations
export const PERFORMANCE_THRESHOLDS = {
    EXCELLENT: 85,
    WEAK: 60,
    STRONG_CATEGORY: 80,
    WEAK_CATEGORY: 60,
    IMPROVEMENT_THRESHOLD: 5,
} as const;
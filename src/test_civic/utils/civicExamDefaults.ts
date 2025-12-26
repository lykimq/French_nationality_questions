import type { CivicExamProgress, CivicExamStatistics, CivicExamTopic } from '../types';

export const DEFAULT_TOPIC_PERFORMANCE: Record<CivicExamTopic, {
    questionsAttempted: number;
    correctAnswers: number;
    accuracy: number;
}> = {
    principles_values: { questionsAttempted: 0, correctAnswers: 0, accuracy: 0 },
    institutional_political: { questionsAttempted: 0, correctAnswers: 0, accuracy: 0 },
    rights_duties: { questionsAttempted: 0, correctAnswers: 0, accuracy: 0 },
    history_geography_culture: { questionsAttempted: 0, correctAnswers: 0, accuracy: 0 },
    living_society: { questionsAttempted: 0, correctAnswers: 0, accuracy: 0 },
};

export const createDefaultCivicExamProgress = (): CivicExamProgress => ({
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
    topicPerformance: { ...DEFAULT_TOPIC_PERFORMANCE },
    createdAt: new Date(),
    updatedAt: new Date(),
});

export const createDefaultCivicExamStatistics = (): CivicExamStatistics => ({
    categoryPerformance: {},
    timeStats: {
        averageTimePerQuestion: 30,
        fastestTime: 5,
        slowestTime: 120,
    },
    improvementTrend: 'stable',
    masteredQuestions: [],
    strugglingQuestions: [],
    topicBreakdown: { ...DEFAULT_TOPIC_PERFORMANCE },
});


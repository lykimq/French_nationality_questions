export interface TestQuestion {
    id: number;
    question: string;
    question_vi?: string;
    explanation: string;
    explanation_vi?: string;
    image?: string | null;
    categoryId: string;
    categoryTitle: string;
    difficulty?: 'easy' | 'medium' | 'hard'; // Based on user performance
}

export interface TestAnswer {
    questionId: number;
    isCorrect: boolean;
    userAnswer?: string;
    timeSpent: number; // in seconds
    timestamp: Date;
}

export interface TestSession {
    id: string;
    mode: TestMode;
    questions: TestQuestion[];
    answers: TestAnswer[];
    startTime: Date;
    endTime?: Date;
    isCompleted: boolean;
    score: number; // percentage
    totalQuestions: number;
    correctAnswers: number;
}

export interface TestProgress {
    totalTestsTaken: number;
    averageScore: number;
    bestScore: number;
    weakCategories: string[]; // Category IDs where user performs poorly
    strongCategories: string[]; // Category IDs where user performs well
    questionsAnswered: number;
    correctAnswersTotal: number;
    incorrectQuestions: number[]; // Question IDs that user got wrong
    recentScores: number[]; // Last 10 test scores
    lastTestDate?: Date;
}

export interface TestStatistics {
    categoryPerformance: { [categoryId: string]: CategoryPerformance };
    timeStats: {
        averageTimePerQuestion: number;
        fastestTime: number;
        slowestTime: number;
    };
    improvementTrend: 'improving' | 'stable' | 'declining';
    masteredQuestions: number[]; // Questions answered correctly multiple times
    strugglingQuestions: number[]; // Questions answered incorrectly multiple times
}

export interface CategoryPerformance {
    categoryId: string;
    categoryTitle: string;
    totalQuestions: number;
    questionsAttempted: number;
    correctAnswers: number;
    accuracy: number; // percentage
    averageTime: number;
    lastAttempted?: Date;
}

export type TestMode =
    | 'quick' // 10 random questions
    | 'standard' // 25 random questions
    | 'comprehensive' // 50 random questions
    | 'category' // All questions from specific category
    | 'weak_areas' // Focus on user's weak categories
    | 'review' // Previously incorrect questions
    | 'timed' // Standard test with time pressure
    | 'mock_interview'; // Simulation of actual interview

export interface TestConfig {
    mode: TestMode;
    questionCount: number;
    timeLimit?: number; // in minutes
    categoryIds?: string[]; // For category-specific tests
    includeExplanations: boolean;
    shuffleQuestions: boolean;
    shuffleOptions: boolean;
    showProgress: boolean;
}

export interface TestResult {
    session: TestSession;
    statistics: TestStatistics;
    recommendations: TestRecommendation[];
}

export interface TestRecommendation {
    type: 'study_category' | 'review_questions' | 'practice_more' | 'good_job';
    title_vi: string;
    title_fr: string;
    description_vi: string;
    description_fr: string;
    actionText_vi: string;
    actionText_fr: string;
    categoryIds?: string[];
    questionIds?: number[];
}
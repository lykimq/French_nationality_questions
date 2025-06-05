export interface TestQuestion {
    id: number;
    question: string;
    question_vi?: string;
    explanation: string;
    explanation_vi?: string;
    image?: string | null;
    categoryId: string;
    categoryTitle: string;
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
    questionsAttempted: number;
    correctAnswers: number;
    accuracy: number; // percentage
    averageTime: number;
    lastAttempted?: Date;
}

export type TestMode =
    | 'geography_only' // 11 geography questions only
    | 'history_culture_comprehensive' // 165 questions covering history, geography and culture
    | 'mock_interview' // 30 questions simulating interview conditions
    // Subcategory-specific test modes
    | 'subcategory_local_gov' // Administration Locale
    | 'subcategory_monarchy' // Monarchie & Royauté
    | 'subcategory_revolution' // Révolution Française
    | 'subcategory_wars' // Guerres & Résistance
    | 'subcategory_republic' // République & Institutions
    | 'subcategory_democracy' // Démocratie & Citoyenneté
    | 'subcategory_economy' // Économie & Monnaie
    | 'subcategory_culture' // Culture & Patrimoine
    | 'subcategory_arts' // Arts & Littérature
    | 'subcategory_celebrities' // Personnalités & Médias
    | 'subcategory_sports' // Sports
    | 'subcategory_holidays' // Jours Fériés
    // Part 1 test modes
    | 'part1_test_personal' // Test personnel
    | 'part1_test_opinions' // Test opinions
    | 'part1_test_daily_life'; // Test vie quotidienne

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

// Base interface for test mode options used across different test screens
export interface BaseTestModeOption {
    mode: TestMode;
    title_fr: string;
    title_vi: string;
    description_fr: string;
    description_vi: string;
    icon: string;
    color: string;
    questionCount: number;
}

// Extended interfaces for specific test screens
export interface Part1TestModeOption extends BaseTestModeOption {
    subcategoryId: string;
}

export interface SubcategoryTestModeOption extends BaseTestModeOption {
    subcategoryId: string;
}

export interface MainTestModeOption extends BaseTestModeOption {
    timeLimit?: number;
    isRecommended?: boolean;
}
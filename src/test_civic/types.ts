import type { TestQuestion } from '../types';
import type { TimestampedEntity } from '../types/core';

// ==================== BASE TEST TYPES (used by civic exam) ====================

export type TestMode =
    | 'geography_only'
    | 'history_culture_comprehensive'
    | 'mock_interview'
    | 'subcategory_local_gov'
    | 'subcategory_monarchy'
    | 'subcategory_revolution'
    | 'subcategory_wars'
    | 'subcategory_republic'
    | 'subcategory_democracy'
    | 'subcategory_economy'
    | 'subcategory_culture'
    | 'subcategory_arts'
    | 'subcategory_celebrities'
    | 'subcategory_sports'
    | 'subcategory_holidays'
    | 'part1_test_personal'
    | 'part1_test_opinions'
    | 'part1_test_daily_life';

export interface TestConfig {
    readonly mode: TestMode;
    readonly questionCount: number;
    readonly timeLimit?: number;
    readonly categoryIds?: readonly string[];
    readonly includeExplanations: boolean;
    readonly shuffleQuestions: boolean;
    readonly shuffleOptions: boolean;
    readonly showProgress: boolean;
}

export interface TestAnswer extends TimestampedEntity {
    readonly questionId: number;
    readonly isCorrect: boolean;
    readonly userAnswer?: string;
    readonly timeSpent: number;
    readonly timestamp: Date;
}

export interface TestSession extends TimestampedEntity {
    readonly id: string;
    readonly mode: TestMode;
    readonly questions: readonly TestQuestion[];
    readonly answers: readonly TestAnswer[];
    readonly startTime: Date;
    readonly endTime?: Date;
    readonly isCompleted: boolean;
    readonly score: number;
    readonly totalQuestions: number;
    readonly correctAnswers: number;
}

export interface CategoryPerformance extends TimestampedEntity {
    categoryId: string;
    categoryTitle: string;
    questionsAttempted: number;
    correctAnswers: number;
    accuracy: number;
    averageTime: number;
    lastAttempted?: Date;
}

export interface TimeStatistics {
    averageTimePerQuestion: number;
    fastestTime: number;
    slowestTime: number;
}

export type ImprovementTrend = 'improving' | 'stable' | 'declining';

export interface TestStatistics {
    categoryPerformance: Record<string, CategoryPerformance>;
    timeStats: TimeStatistics;
    improvementTrend: ImprovementTrend;
    masteredQuestions: number[];
    strugglingQuestions: number[];
}

// ==================== CIVIC EXAM THEMES ====================

export type CivicExamTheme =
    | 'principles_values'
    | 'institutional_political'
    | 'rights_duties'
    | 'history_geography_culture'
    | 'living_society';

export type CivicExamSubTheme =
    | 'devise_symboles'
    | 'laicite'
    | 'situational_principles'
    | 'democracy_vote'
    | 'organization_republic'
    | 'european_institutions'
    | 'fundamental_rights'
    | 'obligations_duties'
    | 'situational_rights'
    | 'historical_periods'
    | 'territories_geography'
    | 'heritage'
    | 'residence'
    | 'healthcare'
    | 'work'
    | 'parental_authority_education';

export type QuestionType = 'knowledge' | 'situational';

// ==================== CIVIC EXAM CONFIGURATION ====================

export interface CivicExamConfig extends Omit<TestConfig, 'mode'> {
    readonly mode: 'civic_exam_naturalization' | 'civic_exam_practice';
    readonly selectedThemes?: readonly CivicExamTheme[];
    readonly questionCount: 40; // Fixed at 40 for civic exam
    readonly timeLimit: 45; // Fixed at 45 minutes
}

// ==================== CIVIC EXAM SESSION ====================

export interface CivicExamSession extends Omit<TestSession, 'mode'> {
    readonly mode: 'civic_exam_naturalization' | 'civic_exam_practice';
    readonly themes?: readonly CivicExamTheme[];
    readonly isPracticeMode: boolean;
}

// ==================== CIVIC EXAM PROGRESS ====================

export interface CivicExamProgress extends TimestampedEntity {
    totalExamsTaken: number;
    totalPracticeSessions: number;
    averageScore: number;
    bestScore: number;
    passedExams: number;
    failedExams: number;
    questionsAnswered: number;
    correctAnswersTotal: number;
    incorrectQuestions: number[];
    recentScores: number[];
    themePerformance: Record<CivicExamTheme, {
        questionsAttempted: number;
        correctAnswers: number;
        accuracy: number;
    }>;
}

export interface CivicExamStatistics extends TestStatistics {
    themeBreakdown: Record<CivicExamTheme, {
        questionsAttempted: number;
        correctAnswers: number;
        accuracy: number;
    }>;
}

// ==================== CIVIC EXAM RESULT ====================

export interface CivicExamResult {
    readonly session: CivicExamSession;
    readonly statistics: CivicExamStatistics;
    readonly passed: boolean; // 32/40 = 80%
    readonly score: number; // percentage
    readonly correctAnswers: number;
    readonly totalQuestions: number;
    readonly incorrectQuestions: readonly TestQuestion[];
    readonly timeSpent: number; // in seconds
}

// ==================== NAVIGATION ====================

import type { SerializableCivicExamResult } from './utils/civicExamSerialization';

export type CivicExamStackParamList = Readonly<{
    CivicExamHome: undefined;
    CivicExamInfo: undefined;
    CivicExamPractice: undefined;
    CivicExamQuestion: undefined;
    CivicExamReview: undefined;
    CivicExamResult: {
        readonly result: SerializableCivicExamResult;
    } | undefined;
}>;

export type { SerializableCivicExamResult };

// ==================== QUESTION METADATA ====================

export interface CivicExamQuestionMetadata {
    readonly theme: CivicExamTheme;
    readonly subTheme: CivicExamSubTheme;
    readonly questionType: QuestionType;
}

export type CivicExamQuestion = TestQuestion & CivicExamQuestionMetadata;


import type { TimestampedEntity } from '../types/core';
import type { TestQuestion } from '../welcome/types';

// ==================== TEST CONFIGURATION ====================

// Test modes - comprehensive enum-like union type
export type TestMode =
    // Main test modes
    | 'geography_only'
    | 'history_culture_comprehensive'
    | 'mock_interview'
    // Subcategory-specific modes
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
    // Part 1 test modes
    | 'part1_test_personal'
    | 'part1_test_opinions'
    | 'part1_test_daily_life';

// Test configuration - immutable functional approach
export interface TestConfig {
    readonly mode: TestMode;
    readonly questionCount: number;
    readonly timeLimit?: number; // in minutes
    readonly categoryIds?: readonly string[];
    readonly includeExplanations: boolean;
    readonly shuffleQuestions: boolean;
    readonly shuffleOptions: boolean;
    readonly showProgress: boolean;
}

// ==================== TEST SESSION & RESULTS ====================

// Test answer - immutable record
export interface TestAnswer extends TimestampedEntity {
    readonly questionId: number;
    readonly isCorrect: boolean;
    readonly userAnswer?: string;
    readonly timeSpent: number; // in seconds
    readonly timestamp: Date;
}

// Test session - immutable state
export interface TestSession extends TimestampedEntity {
    readonly id: string;
    readonly mode: TestMode;
    readonly questions: readonly TestQuestion[];
    readonly answers: readonly TestAnswer[];
    readonly startTime: Date;
    readonly endTime?: Date;
    readonly isCompleted: boolean;
    readonly score: number; // percentage
    readonly totalQuestions: number;
    readonly correctAnswers: number;
}

// Serializable test session for navigation (dates as ISO strings)
export interface SerializableTestSession {
    readonly id: string;
    readonly mode: TestMode;
    readonly questions: readonly TestQuestion[];
    readonly answers: readonly {
        readonly questionId: number;
        readonly isCorrect: boolean;
        readonly userAnswer?: string;
        readonly timeSpent: number;
        readonly timestamp: string; // ISO string
    }[];
    readonly startTime: string; // ISO string
    readonly endTime?: string; // ISO string
    readonly isCompleted: boolean;
    readonly score: number;
    readonly totalQuestions: number;
    readonly correctAnswers: number;
}

// ==================== TEST ANALYTICS & STATISTICS ====================

// Category performance analytics
export interface CategoryPerformance extends TimestampedEntity {
    categoryId: string;
    categoryTitle: string;
    questionsAttempted: number;
    correctAnswers: number;
    accuracy: number; // percentage
    averageTime: number;
    lastAttempted?: Date;
}

// Time-based statistics
export interface TimeStatistics {
    averageTimePerQuestion: number;
    fastestTime: number;
    slowestTime: number;
}

// Improvement trend analysis
export type ImprovementTrend = 'improving' | 'stable' | 'declining';

// ==================== PROGRESS TRACKING ====================

// Overall test progress - mutable for internal operations, immutable for external API
export interface TestProgress extends TimestampedEntity {
    totalTestsTaken: number;
    averageScore: number;
    bestScore: number;
    weakCategories: string[];
    strongCategories: string[];
    questionsAnswered: number;
    correctAnswersTotal: number;
    incorrectQuestions: number[];
    recentScores: number[]; // Last 10 test scores
}

// Read-only version for external consumption
export type ReadonlyTestProgress = Readonly<TestProgress>;

// Comprehensive test statistics - mutable for internal operations
export interface TestStatistics {
    categoryPerformance: Record<string, CategoryPerformance>;
    timeStats: TimeStatistics;
    improvementTrend: ImprovementTrend;
    masteredQuestions: number[]; // Questions answered correctly multiple times
    strugglingQuestions: number[]; // Questions answered incorrectly multiple times
}

// Read-only version for external consumption
export type ReadonlyTestStatistics = Readonly<{
    readonly categoryPerformance: Readonly<Record<string, CategoryPerformance>>;
    readonly timeStats: TimeStatistics;
    readonly improvementTrend: ImprovementTrend;
    readonly masteredQuestions: readonly number[];
    readonly strugglingQuestions: readonly number[];
}>;

// ==================== RECOMMENDATIONS ====================

// Recommendation types
export type RecommendationType = 'study_category' | 'review_questions' | 'practice_more' | 'good_job';

// Recommendation
export interface TestRecommendation {
    readonly type: RecommendationType;
    readonly title: string;
    readonly description: string;
    readonly actionText: string;
    readonly categoryIds?: readonly string[];
    readonly questionIds?: readonly number[];
}

// ==================== TEST RESULTS ====================

// Complete test result - immutable aggregate
export interface TestResult {
    readonly session: TestSession;
    readonly statistics: TestStatistics;
    readonly recommendations: readonly TestRecommendation[];
}

// Serializable test result for navigation
export interface SerializableTestResult {
    readonly session: SerializableTestSession;
    readonly statistics: TestStatistics;
    readonly recommendations: readonly TestRecommendation[];
}

// ==================== TEST MODE OPTIONS ====================

// Base test mode option for UI display
export interface BaseTestModeOption {
    readonly mode: TestMode;
    readonly title: string;
    readonly description: string;
    readonly icon: string;
    readonly color: string;
    readonly questionCount: number;
}

// Extended options for specific test screens
export interface Part1TestModeOption extends BaseTestModeOption {
    readonly subcategoryId: string;
}

export interface SubcategoryTestModeOption extends BaseTestModeOption {
    readonly subcategoryId: string;
}

export interface MainTestModeOption extends BaseTestModeOption {
    readonly timeLimit?: number;
    readonly isRecommended?: boolean;
}

// ==================== UTILITY TYPES ====================

// Test mode collections
export type TestModeCollection = readonly TestMode[];
export type TestModeOptionCollection<T extends BaseTestModeOption = BaseTestModeOption> = readonly T[];

// Test result transformers
export type TestResultTransformer<T, U> = (result: T) => U;
export type SerializationTransformer = TestResultTransformer<TestResult, SerializableTestResult>;
export type DeserializationTransformer = TestResultTransformer<SerializableTestResult, TestResult>;


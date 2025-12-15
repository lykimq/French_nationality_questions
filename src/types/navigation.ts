import type { Language, MultiLangText } from './core';
import type { SerializableTestResult } from './testing';

// ==================== TAB NAVIGATION ====================

// Bottom Tab Navigator types - immutable route definitions
export type TabParamList = Readonly<{
    HomeTab: undefined;
    SearchTab: undefined;
    TestTab: undefined;
    SettingsTab: undefined;
}>;

// ==================== HOME STACK NAVIGATION ====================

// Question structure for navigation params - supports both string and MultiLangText
export interface NavigationQuestion {
    readonly id: number;
    readonly question: string | MultiLangText;
    readonly question_vi?: string;
    readonly explanation?: string | MultiLangText;
    readonly explanation_vi?: string;
    readonly image?: string | null;
}

// Category structure for navigation params
export interface NavigationCategory {
    readonly id: string;
    readonly title: string;
    readonly title_vi?: string;
    readonly description?: string;
    readonly description_vi?: string;
    readonly icon?: string;
    readonly questions: readonly NavigationQuestion[];
}

// Home stack navigation parameters
export type HomeStackParamList = Readonly<{
    Home: undefined;
    CategoryQuestions: {
        readonly categoryId: string;
        readonly language?: Language;
    };
    CategoryBasedQuestions: {
        readonly categories: readonly NavigationCategory[];
        readonly title: string;
        readonly title_vi?: string;
    };
    QuestionDetail: {
        readonly categoryId: string;
        readonly questionId: number;
        readonly language?: Language;
    };
}>;

// ==================== TEST STACK NAVIGATION ====================

// Test stack navigation parameters
export type TestStackParamList = Readonly<{
    Test: undefined;
    SubcategoryTest: undefined;
    ConversationTest: undefined;
    TestQuestion: undefined;
    TestResult: {
        readonly testResult: SerializableTestResult;
    } | undefined;
    Progress: undefined;
    Review: undefined;
}>;

// ==================== UTILITY TYPES ====================

// Extract route params from param list
export type RouteParams<
    T extends Record<string, any>,
    K extends keyof T
> = T[K];

// Navigation prop types helper
export type NavigationParams<T extends Record<string, any>> = {
    readonly [K in keyof T]: RouteParams<T, K>;
};

// Screen component props pattern
export interface ScreenProps<T extends Record<string, any>, K extends keyof T> {
    readonly route: {
        readonly params: RouteParams<T, K>;
    };
    readonly navigation: {
        readonly navigate: <U extends keyof T>(screen: U, params?: RouteParams<T, U>) => void;
        readonly goBack: () => void;
        readonly canGoBack: () => boolean;
    };
}

// ==================== TAB NAVIGATION HELPER TYPES ====================

// Tab bar icon props
export interface TabBarIconProps {
    readonly focused: boolean;
    readonly color: string;
    readonly size: number;
}

// Route type for tab navigation
export interface RouteType {
    readonly name: string;
}
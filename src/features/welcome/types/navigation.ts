import type { Language, MultiLangText } from '../../../types';

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


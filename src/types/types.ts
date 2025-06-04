import { MultiLangText } from '../contexts/LanguageContext';
import { TestResult } from './test';
import { SerializableTestResult } from '../contexts/TestContext';

// Bottom Tab Navigator types
export type TabParamList = {
    HomeTab: undefined;
    SearchTab: undefined;
    TestTab: undefined;
    SettingsTab: undefined;
};

// Home Stack Navigator types
export type HomeStackParamList = {
    Home: undefined;
    CategoryQuestions: { categoryId: string; language?: 'fr' | 'vi' };
    CategoryBasedQuestions: {
        categories: Array<{
            id: string;
            title: string;
            title_vi?: string;
            description?: string;
            description_vi?: string;
            icon?: string;
            questions: Array<{
                id: number;
                question: string;
                question_vi: string;
                explanation?: string;
                explanation_vi?: string;
                image?: string | null;
            }>;
        }>;
        title: string;
        title_vi?: string;
    };
    QuestionDetail: { categoryId: string; questionId: number; language?: 'fr' | 'vi' };
};

// Test Stack Navigator types
export type TestStackParamList = {
    Test: undefined;
    SubcategoryTest: undefined;
    TestQuestion: undefined;
    TestResult: { testResult: SerializableTestResult } | undefined;
    Progress: undefined;
    Review: undefined;
};
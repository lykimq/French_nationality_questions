import { MultiLangText } from '../contexts/LanguageContext';

export type RootStackParamList = {
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
    Search: undefined;
    Settings: undefined;
    HomeTab: undefined;
    SearchTab: undefined;
    SettingsTab: undefined;
    TestTab: undefined;
    TestQuestion: undefined;
    TestResult: undefined;
};
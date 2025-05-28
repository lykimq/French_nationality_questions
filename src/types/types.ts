export type RootStackParamList = {
    Home: undefined;
    CategoryQuestions: { categoryId: string; language?: 'fr' | 'vi' };
    CategoryBasedQuestions: {
        categories: Array<{
            id: string;
            title: string;
            questions: Array<{
                id: number;
                question: string;
                explanation?: string;
                image?: string | null;
            }>;
        }>;
        title: string;
    };
    QuestionDetail: { categoryId: string; questionId: number; language?: 'fr' | 'vi' };
    Search: undefined;
    Settings: undefined;
    HomeTab: undefined;
    SearchTab: undefined;
    SettingsTab: undefined;
};
export type RootStackParamList = {
    Home: undefined;
    CategoryQuestions: { categoryId: string; language?: 'fr' | 'vi' };
    QuestionDetail: { categoryId: string; questionId: number; language?: 'fr' | 'vi' };
    Search: undefined;
    Settings: undefined;
    HomeTab: undefined;
    SearchTab: undefined;
    SettingsTab: undefined;
};
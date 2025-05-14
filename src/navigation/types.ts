export type RootStackParamList = {
    Home: undefined;
    CategoryQuestions: { categoryId: string };
    QuestionDetail: { categoryId: string; questionId: number };
    Search: undefined;
    Settings: undefined;
};
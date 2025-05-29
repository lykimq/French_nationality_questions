import { MultiLangText } from '../contexts/LanguageContext';

export interface BaseQuestion {
    id: number;
    question: string | MultiLangText;
    question_vi: string | MultiLangText;
    explanation?: string | MultiLangText;
    explanation_vi?: string | MultiLangText;
    image?: string | null;
}

export interface MultilingualQuestion {
    id: number;
    question: string;
    question_vi: string;
    explanation?: string;
    explanation_vi?: string;
    image?: string | null;
}

export type Question = BaseQuestion | MultilingualQuestion;

export interface Category {
    id: string;
    title: string;
    title_vi?: string;
    description?: string;
    description_vi?: string;
    icon?: string;
    questions: Question[];
}

export interface CategoryWithSubcategories extends Omit<Category, 'questions'> {
    subcategories: Category[];
}

export type CategoryType = Category | CategoryWithSubcategories;

export const isMultilingualQuestion = (question: Question): question is MultilingualQuestion => {
    return 'question' in question && typeof (question as any).question === 'string';
};

export const isCategoryWithSubcategories = (category: CategoryType): category is CategoryWithSubcategories => {
    return 'subcategories' in category;
};
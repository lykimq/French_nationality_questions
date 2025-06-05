import { MultiLangText } from '../contexts/LanguageContext';

// Base interfaces for questions
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

// Base interface for categories
export interface CategoryBase {
    id: string;
    title: string;
    title_vi?: string;
    description?: string;
    description_vi?: string;
    icon?: string;
}

export interface Category extends CategoryBase {
    questions: Question[];
}

export interface CategoryWithSubcategories extends CategoryBase {
    subcategories: Category[];
}

export type CategoryType = Category | CategoryWithSubcategories;

// Component Props interfaces
export interface CategoryCardProps {
    title: string;
    title_vi?: string;
    description: string;
    description_vi?: string;
    icon: string;
    count: number;
    onPress: () => void;
    language?: 'fr' | 'vi';
}

export interface QuestionCardProps {
    id: number;
    question: string | MultiLangText;
    explanation: string | MultiLangText;
    language?: 'fr' | 'vi';
    image?: string | null;
    alwaysExpanded?: boolean;
}

export interface QuestionSlideViewProps {
    questions: Question[];
    language: 'fr' | 'vi';
}

export interface CategorySlideViewProps {
    categories: Array<CategoryBase & {
        questions: MultilingualQuestion[];
    }>;
    language: 'fr' | 'vi';
}

export interface CategorySelectionViewProps {
    categories: Array<CategoryBase & {
        questions: MultilingualQuestion[];
    }>;
    language: 'fr' | 'vi';
    onSelectCategory: (categoryIndex: number) => void;
}

// Shared Props for settings components
export interface SettingsComponentProps {
    title: string;
    title_vi?: string;
    language: 'fr' | 'vi';
}

// Extended settings props for components with value selection
export interface SettingsComponentWithValueProps<T = string> extends SettingsComponentProps {
    value: T;
    onValueChange: (value: T) => void;
}

// Utility type for creating settings components with additional props
export type ExtendedSettingsComponent<T = string, P = {}> = SettingsComponentWithValueProps<T> & P;

// Type guards
export const isMultilingualQuestion = (question: Question): question is MultilingualQuestion => {
    return 'question' in question && typeof (question as any).question === 'string';
};

export const isCategoryWithSubcategories = (category: CategoryType): category is CategoryWithSubcategories => {
    return 'subcategories' in category;
};

// Language type
export type LanguageCode = 'fr' | 'vi';
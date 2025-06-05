import type { BaseEntity, MultilingualEntity, VisualEntity, CategorizableEntity, MultiLangText, Language } from './core';

// ==================== QUESTION DOMAIN ====================

// Base entity for numeric IDs (questions use numbers)
export interface NumberEntity {
    readonly id: number;
}

// Core question structure - immutable and functional
export interface Question extends NumberEntity, VisualEntity, CategorizableEntity {
    readonly question: string | MultiLangText;
    readonly question_vi?: string;
    readonly explanation?: string | MultiLangText;
    readonly explanation_vi?: string;
}

// Specialized question types using composition
export type MultilingualQuestion = Question & {
    readonly question: string;
    readonly question_vi: string;
    readonly explanation?: string;
    readonly explanation_vi?: string;
};

export type TestQuestion = Question & CategorizableEntity & {
    readonly categoryId: string;
    readonly categoryTitle: string;
};

// Question collections - using readonly arrays for immutability
export type QuestionCollection = readonly Question[];
export type MultilingualQuestionCollection = readonly MultilingualQuestion[];

// ==================== CATEGORY DOMAIN ====================

// Base category structure
export interface Category extends MultilingualEntity, VisualEntity {
    readonly questions: QuestionCollection;
}

// Category with subcategories - hierarchical structure
export interface CategoryWithSubcategories extends MultilingualEntity, VisualEntity {
    readonly subcategories: readonly Category[];
}

// Union type for all category types
export type CategoryType = Category | CategoryWithSubcategories;

// Category collections
export type CategoryCollection = readonly Category[];

// ==================== JSON DATA STRUCTURES ====================

// For data loading from JSON files - separate from domain models
export interface JsonQuestion {
    readonly id: number;
    readonly question: string;
    readonly question_vi?: string;
    readonly explanation: string;
    readonly explanation_vi?: string;
    readonly image?: string | null;
}

export interface JsonCategory {
    readonly id: string;
    readonly title: string;
    readonly title_vi: string;
    readonly icon: string;
    readonly description: string;
    readonly description_vi: string;
    readonly questions: readonly JsonQuestion[];
}

// ==================== LEGACY DATA STRUCTURES ====================

// For backwards compatibility - consider deprecating these
export interface HistoryCategory {
    readonly id: string;
    readonly title: string;
    readonly title_vi: string;
    readonly icon: string;
    readonly description: string;
    readonly description_vi: string;
    readonly subcategories: readonly {
        readonly id: string;
        readonly title: string;
        readonly title_vi: string;
        readonly icon: string;
        readonly description: string;
        readonly description_vi: string;
    }[];
}

export interface HistorySubcategory {
    readonly id: string;
    readonly title: string;
    readonly icon: string;
    readonly description: string;
    readonly questions?: readonly {
        readonly id: number;
        readonly question: string;
        readonly explanation: string;
        readonly question_vi: string;
        readonly explanation_vi: string;
        readonly image: string | null;
    }[];
}

// ==================== TYPE GUARDS ====================

// Functional type guards for runtime type checking
export const isMultilingualQuestion = (question: Question): question is MultilingualQuestion => {
    return typeof question.question === 'string' && typeof question.question_vi === 'string';
};

export const isCategoryWithSubcategories = (category: CategoryType): category is CategoryWithSubcategories => {
    return 'subcategories' in category;
};

export const hasMultiLangText = (text: string | MultiLangText): text is MultiLangText => {
    return typeof text === 'object' && text !== null && 'fr' in text && 'vi' in text;
};

// ==================== UTILITY TYPES ====================

// Functional utility types for data transformation
export type ExtractQuestions<T extends { questions: readonly any[] }> = T['questions'][number];
export type ExtractCategories<T extends { categories: readonly any[] }> = T['categories'][number];

// Language-specific extraction
export type LanguageVariant<T extends string | MultiLangText> = T extends MultiLangText
    ? T[Language]
    : T extends string
    ? T
    : never;
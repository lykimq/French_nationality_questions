import type { TitledEntity, VisualEntity, CategorizableEntity } from '../types';

// ==================== QUESTION DOMAIN ====================

// Base entity for question IDs (numeric or prefixed string like "livret_1")
export interface NumberEntity {
    readonly id: number | string;
}

// Core question structure - immutable and functional
export interface Question extends NumberEntity, VisualEntity, CategorizableEntity {
    readonly question: string;
    readonly explanation?: string;
}

// Test question type
export type TestQuestion = Question & CategorizableEntity & {
    readonly categoryId: string;
    readonly categoryTitle: string;
};

// Question collections - using readonly arrays for immutability
export type QuestionCollection = readonly Question[];

// ==================== CATEGORY DOMAIN ====================

// Base category structure
export interface Category extends TitledEntity, VisualEntity {
    readonly questions: QuestionCollection;
}

// Category with subcategories - hierarchical structure
export interface CategoryWithSubcategories extends TitledEntity, VisualEntity {
    readonly subcategories: readonly Category[];
}

// Union type for all category types
export type CategoryType = Category | CategoryWithSubcategories;

// Category collections
export type CategoryCollection = readonly Category[];

// ==================== HISTORY DATA STRUCTURES ====================

// Modern history category structure using composition
export interface HistoryCategory extends Category {
    readonly subcategories: readonly Category[];
}

// History subcategory is just a regular Category
export type HistorySubcategory = Category;

// ==================== TYPE GUARDS ====================

// Functional type guards for runtime type checking
export const isCategoryWithSubcategories = (category: CategoryType): category is CategoryWithSubcategories => {
    return 'subcategories' in category;
};

// ==================== UTILITY TYPES ====================

// Functional utility types for data transformation
export type ExtractQuestions<T extends { questions: readonly any[] }> = T['questions'][number];
export type ExtractCategories<T extends { categories: readonly any[] }> = T['categories'][number];


// ==================== HOME STACK NAVIGATION ====================

// Question structure for navigation params
export interface NavigationQuestion {
    readonly id: number | string;
    readonly question: string;
    readonly explanation?: string;
    readonly image?: string | null;
}

// Category structure for navigation params
export interface NavigationCategory {
    readonly id: string;
    readonly title: string;
    readonly description?: string;
    readonly icon?: string;
    readonly questions: readonly NavigationQuestion[];
}

// Home stack navigation parameters
export type HomeStackParamList = Readonly<{
    Home: undefined;
    CategoryQuestions: {
        readonly categoryId: string;
    };
    CategoryBasedQuestions: {
        readonly categories: readonly NavigationCategory[];
        readonly title: string;
    };
    QuestionDetail: {
        readonly categoryId: string;
        readonly questionId: number;
    };
}>;


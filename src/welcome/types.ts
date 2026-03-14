import type { TitledEntity, VisualEntity, CategorizableEntity } from '../types';
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
// Home stack navigation parameters
export type HomeStackParamList = Readonly<{
    Home: undefined;
    CategoryQuestions: {
        readonly categoryId: string;
    };
}>;


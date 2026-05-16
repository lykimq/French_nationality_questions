import type { VisualEntity, CategorizableEntity } from "../types";
// Base entity for question IDs (numeric or prefixed string like "livret_1")
export interface NumberEntity {
    readonly id: number | string;
}

// Core question structure - immutable and functional
export interface Question
    extends NumberEntity, VisualEntity, CategorizableEntity {
    readonly question: string;
    readonly explanation?: string;
}

// Test question type
export type TestQuestion = Question &
    CategorizableEntity & {
        readonly categoryId: string;
        readonly categoryTitle: string;
    };

// Home stack navigation parameters
export type HomeStackParamList = Readonly<{
    Home: undefined;
    CategoryDetail: {
        readonly categoryId: string;
    };
    CategoryQuestions: {
        readonly categoryId: string;
        readonly initialIndex?: number;
        readonly questionId: string | number;
    };
    QuestionSearch: undefined;
}>;

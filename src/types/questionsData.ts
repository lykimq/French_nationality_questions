import type { Question } from '../welcome/types';

// ==================== FRENCH QUESTIONS DATA STRUCTURES ====================

// French question - simple string-based question
export interface FrenchQuestion extends Omit<Question, 'question' | 'explanation'> {
    readonly question: string;
    readonly explanation: string;
}

// French category - contains French questions
export interface FrenchCategory {
    readonly id: string;
    readonly title: string;
    readonly icon: string;
    readonly description: string;
    readonly questions: readonly FrenchQuestion[];
}

// French questions data structure
export interface FrenchQuestionsData {
    readonly categories: readonly FrenchCategory[];
}

// ==================== TYPE GUARDS ====================

// Check if question data is French-only
export const isFrenchQuestionsData = (_data: FrenchQuestionsData): true => {
    return true;
};

// ==================== UTILITY TYPES ====================

// Extract question type from data structure
export type ExtractQuestionType<T> = T extends FrenchQuestionsData
    ? FrenchQuestion
    : never;

// Extract category type from data structure
export type ExtractCategoryType<T> = T extends FrenchQuestionsData
    ? FrenchCategory
    : never;


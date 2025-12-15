import type { Language, MultiLangText } from './core';
import type { Question, MultilingualQuestion } from './welcome/domain';

// ==================== FRENCH-ONLY DATA STRUCTURES ====================

// French question - simple string-based question
export interface FrenchQuestion extends Omit<Question, 'question' | 'explanation'> {
    readonly question: string;
    readonly explanation: string;
}

// French category - contains French questions
export interface FrenchCategory {
    readonly id: string;
    readonly title: string;
    readonly title_vi: string;
    readonly icon: string;
    readonly description: string;
    readonly description_vi: string;
    readonly questions: readonly FrenchQuestion[];
}

// French questions data structure
export interface FrenchQuestionsData {
    readonly categories: readonly FrenchCategory[];
}

// ==================== MULTILINGUAL DATA STRUCTURES ====================

// Multilingual question - uses MultiLangText structure
export interface MultiLangQuestion extends Omit<Question, 'question' | 'explanation'> {
    readonly question: MultiLangText;
    readonly explanation: MultiLangText;
}

// Multilingual category - contains multilingual questions
export interface MultiLangCategory {
    readonly id: string;
    readonly title: string;
    readonly title_vi: string;
    readonly icon: string;
    readonly description: string;
    readonly description_vi: string;
    readonly questions: readonly MultiLangQuestion[];
}

// Multilingual questions data structure
export interface MultiLangQuestionsData {
    readonly categories: readonly MultiLangCategory[];
}

// ==================== TYPE GUARDS ====================

// Check if question data is French-only
export const isFrenchQuestionsData = (data: FrenchQuestionsData | MultiLangQuestionsData): data is FrenchQuestionsData => {
    return data.categories.length > 0 &&
        data.categories[0].questions.length > 0 &&
        typeof data.categories[0].questions[0].question === 'string';
};

// Check if question data is multilingual
export const isMultiLangQuestionsData = (data: FrenchQuestionsData | MultiLangQuestionsData): data is MultiLangQuestionsData => {
    return data.categories.length > 0 &&
        data.categories[0].questions.length > 0 &&
        typeof data.categories[0].questions[0].question === 'object';
};

// ==================== UTILITY TYPES ====================

// Extract question type from data structure
export type ExtractQuestionType<T> = T extends FrenchQuestionsData
    ? FrenchQuestion
    : T extends MultiLangQuestionsData
    ? MultiLangQuestion
    : never;

// Extract category type from data structure
export type ExtractCategoryType<T> = T extends FrenchQuestionsData
    ? FrenchCategory
    : T extends MultiLangQuestionsData
    ? MultiLangCategory
    : never;
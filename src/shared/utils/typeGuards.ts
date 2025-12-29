import type { FrenchCategory, FrenchQuestion } from '../../types/questionsData';
import type { RawCategory, RawQuestion } from '../types';
import type { Question } from '../../welcome/types';

// ==================== CATEGORY TYPE GUARDS ====================

/**
 * Type guard for RawCategory (optional fields).
 */
export const isRawCategory = (category: unknown): category is RawCategory => {
    if (!category || typeof category !== 'object') return false;
    const cat = category as Record<string, unknown>;
    return (
        (cat.id === undefined || typeof cat.id === 'string') &&
        (cat.title === undefined || typeof cat.title === 'string') &&
        (cat.questions === undefined || Array.isArray(cat.questions))
    );
};

/**
 * Type guard for FrenchCategory (required fields).
 */
export const isFrenchCategory = (category: unknown): category is FrenchCategory => {
    if (!category || typeof category !== 'object') return false;
    const cat = category as Record<string, unknown>;
    return (
        typeof cat.id === 'string' &&
        typeof cat.title === 'string' &&
        typeof cat.icon === 'string' &&
        typeof cat.description === 'string' &&
        Array.isArray(cat.questions)
    );
};

/**
 * Type guard for processable category (RawCategory | FrenchCategory).
 */
export const isProcessableCategory = (category: unknown): category is RawCategory | FrenchCategory => {
    return isRawCategory(category) || isFrenchCategory(category);
};

// ==================== QUESTION TYPE GUARDS ====================

/**
 * Type guard for RawQuestion (optional fields).
 */
export const isRawQuestion = (question: unknown): question is RawQuestion => {
    if (!question || typeof question !== 'object') return false;
    const q = question as Record<string, unknown>;
    return (
        (q.id === undefined || typeof q.id === 'number' || typeof q.id === 'string') &&
        (q.question === undefined || typeof q.question === 'string' || (typeof q.question === 'object' && q.question !== null)) &&
        (q.explanation === undefined || typeof q.explanation === 'string' || (typeof q.explanation === 'object' && q.explanation !== null))
    );
};

/**
 * Type guard for Question (required fields).
 */
export const isQuestion = (question: unknown): question is Question => {
    if (!question || typeof question !== 'object') return false;
    const q = question as Record<string, unknown>;
    return (
        (typeof q.id === 'number' || typeof q.id === 'string') &&
        typeof q.question === 'string'
    );
};

/**
 * Type guard for FrenchQuestion.
 */
export const isFrenchQuestion = (question: unknown): question is FrenchQuestion => {
    if (!question || typeof question !== 'object') return false;
    const q = question as Record<string, unknown>;
    return (
        (typeof q.id === 'number' || typeof q.id === 'string') &&
        typeof q.question === 'string' &&
        typeof q.explanation === 'string'
    );
};

/**
 * Type guard for processable question (RawQuestion | Question | FrenchQuestion).
 */
export const isProcessableQuestion = (question: unknown): question is RawQuestion | Question | FrenchQuestion => {
    return isRawQuestion(question) || isQuestion(question) || isFrenchQuestion(question);
};


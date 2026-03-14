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



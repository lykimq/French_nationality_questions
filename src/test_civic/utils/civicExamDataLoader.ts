import type { TestQuestion } from '../../types';
import type { CivicExamQuestion } from '../types';

interface CivicExamQuestionData {
    id: number;
    question: string;
    question_vi: string;
    explanation: string;
    explanation_vi: string;
    image?: string | null;
    theme: string;
    subTheme: string;
    questionType: string;
    options?: string[];
    correctAnswer?: number;
    explanationOptions?: string[];
    correctExplanationAnswer?: number;
}

interface CivicExamDataFile {
    questions?: CivicExamQuestionData[];
}

const validateQuestionData = (q: unknown): q is CivicExamQuestionData => {
    if (typeof q !== 'object' || q === null) {
        return false;
    }
    
    const question = q as Record<string, unknown>;
    
    return (
        typeof question.id === 'number' &&
        isFinite(question.id) &&
        question.id > 0 &&
        typeof question.question === 'string' &&
        question.question.length > 0 &&
        typeof question.question_vi === 'string' &&
        question.question_vi.length > 0 &&
        typeof question.explanation === 'string' &&
        typeof question.explanation_vi === 'string' &&
        typeof question.theme === 'string' &&
        question.theme.length > 0 &&
        typeof question.subTheme === 'string' &&
        question.subTheme.length > 0 &&
        typeof question.questionType === 'string' &&
        (question.questionType === 'knowledge' || question.questionType === 'situational')
    );
};

const sanitizeString = (str: unknown): string => {
    if (typeof str !== 'string') return '';
    return str.trim();
};

const sanitizeStringArray = (arr: unknown): string[] => {
    if (!Array.isArray(arr)) return [];
    return arr
        .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
        .map(item => item.trim());
};

const validateAnswerIndex = (index: unknown, maxLength: number): number | undefined => {
    if (typeof index !== 'number' || !isFinite(index)) return undefined;
    return index >= 0 && index < maxLength ? index : undefined;
};

const transformCivicQuestion = (q: CivicExamQuestionData): TestQuestion & Partial<CivicExamQuestion> => {
    const options = sanitizeStringArray(q.options);
    const explanationOptions = sanitizeStringArray(q.explanationOptions);
    
    return {
        id: q.id,
        question: sanitizeString(q.question),
        question_vi: sanitizeString(q.question_vi),
        explanation: sanitizeString(q.explanation),
        explanation_vi: sanitizeString(q.explanation_vi),
        image: typeof q.image === 'string' && q.image.trim().length > 0 ? q.image.trim() : undefined,
        categoryId: 'civic_exam',
        categoryTitle: 'Examen Civique',
        theme: q.theme as any,
        subTheme: q.subTheme as any,
        questionType: q.questionType as any,
        options,
        correctAnswer: validateAnswerIndex(q.correctAnswer, options.length),
        explanationOptions,
        correctExplanationAnswer: validateAnswerIndex(q.correctExplanationAnswer, explanationOptions.length),
    };
};

export const loadCivicExamQuestions = async (): Promise<TestQuestion[]> => {
    try {
        const civicExamData: CivicExamDataFile = require('../data/civic_exam_questions.json');
        
        if (!civicExamData || typeof civicExamData !== 'object') {
            console.warn('Civic exam questions data is missing or invalid');
            return [];
        }
        
        if (!Array.isArray(civicExamData.questions)) {
            console.warn('Civic exam questions must be an array');
            return [];
        }

        if (civicExamData.questions.length === 0) {
            console.warn('Civic exam questions array is empty');
            return [];
        }

        const validQuestions = civicExamData.questions
            .filter(validateQuestionData)
            .map(transformCivicQuestion);

        if (validQuestions.length < civicExamData.questions.length) {
            const invalidCount = civicExamData.questions.length - validQuestions.length;
            console.warn(`Skipped ${invalidCount} invalid civic exam question(s)`);
        }

        if (validQuestions.length === 0) {
            console.warn('No valid civic exam questions found after validation');
        }

        return validQuestions;
    } catch (error) {
        console.warn('Could not load civic exam questions:', error);
        return [];
    }
};


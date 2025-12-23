import { getQuestionText, getExplanationText } from '../../shared/utils/questionUtils';
import type { TestQuestion } from '../../types';
import type { CivicExamQuestion } from '../types';


/**
 * Civic exam question with options and correct answer
 */
export interface CivicExamQuestionWithOptions extends CivicExamQuestion {
    readonly options?: readonly string[];
    readonly correctAnswer?: number;
    readonly explanationOptions?: readonly string[];
    readonly correctExplanationAnswer?: number;
}

/**
 * Extracts question text from a civic exam question
 * 
 * @param question - The question object
 * @returns The question text
 */
export const getCivicExamQuestionText = (question: TestQuestion | null | undefined): string => 
    getQuestionText(question?.question);

/**
 * Extracts explanation text from a civic exam question
 * 
 * @param question - The question object
 * @returns The explanation text
 */
export const getCivicExamExplanationText = (question: TestQuestion | null | undefined): string => 
    getExplanationText(question?.explanation);

/**
 * Gets the answer text from a question's options array by index
 * 
 * @param question - The question with options
 * @param answerIndex - The index of the answer in the options array
 * @param fallbackText - Optional fallback text if answer is not found
 * @returns The answer text or fallback text
 */
export const getAnswerTextFromOptions = (
    question: CivicExamQuestionWithOptions | null | undefined,
    answerIndex: number | null | undefined,
    fallbackText: string = 'Aucune réponse'
): string => {
    if (!question || answerIndex === null || answerIndex === undefined) {
        return fallbackText;
    }

    const options = question.options;
    if (!options || !Array.isArray(options) || options.length === 0) {
        return fallbackText;
    }

    if (answerIndex >= 0 && answerIndex < options.length) {
        return options[answerIndex];
    }

    return 'Réponse invalide';
};

/**
 * Gets the user's answer text from a question and answer index
 * 
 * @param question - The question with options
 * @param userAnswerIndex - The index of the user's answer
 * @param language - The language for fallback messages
 * @returns The user's answer text
 */
export const getUserAnswerText = (
    question: CivicExamQuestionWithOptions | null | undefined,
    userAnswerIndex: number | null | undefined
): string => {
    const fallbackText = 'Aucune réponse';
    return getAnswerTextFromOptions(question, userAnswerIndex, fallbackText);
};

/**
 * Gets the correct answer text from a question
 * 
 * @param question - The question with options and correctAnswer
 * @returns The correct answer text
 */
export const getCorrectAnswerText = (
    question: CivicExamQuestionWithOptions | null | undefined
): string => {
    const fallbackText = 'Aucune réponse';
    const correctAnswerIndex = question?.correctAnswer;
    return getAnswerTextFromOptions(question, correctAnswerIndex, fallbackText);
};

/**
 * Parses user answer string to index number
 * 
 * @param userAnswer - The user answer as a string
 * @returns The answer index or null if invalid
 */
export const parseUserAnswerIndex = (userAnswer: string | null | undefined): number | null => {
    if (!userAnswer) return null;
    const parsed = parseInt(userAnswer, 10);
    return isNaN(parsed) ? null : parsed;
};

/**
 * Gets answer information for a question including user answer and correct answer
 * 
 * @param question - The question with options
 * @param userAnswerIndex - The user's selected answer index
 * @returns Object containing user answer text and correct answer text
 */
export const getQuestionAnswerInfo = (
    question: CivicExamQuestionWithOptions | null | undefined,
    userAnswerIndex: number | null | undefined,
): {
    userAnswerText: string;
    correctAnswerText: string;
    isCorrect: boolean;
} => {
    const userAnswerText = getUserAnswerText(question, userAnswerIndex);
    const correctAnswerText = getCorrectAnswerText(question);
    const correctAnswerIndex = question?.correctAnswer;
    const isCorrect = userAnswerIndex !== null && 
                     correctAnswerIndex !== undefined && 
                     userAnswerIndex === correctAnswerIndex;

    return {
        userAnswerText,
        correctAnswerText,
        isCorrect,
    };
};


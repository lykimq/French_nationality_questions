import { CIVIC_EXAM_CONFIG } from '../constants/civicExamConstants';

// ==================== SCORING ====================

const calculateTestScore = (correctAnswers: number, totalQuestions: number): number => {
    if (totalQuestions === 0) return 0;
    return Math.round((correctAnswers / totalQuestions) * 100);
};

export const calculateCivicExamScore = (correctAnswers: number, totalQuestions: number): number => {
    return calculateTestScore(correctAnswers, totalQuestions);
};

export const isCivicExamPassed = (score: number): boolean => {
    return score >= CIVIC_EXAM_CONFIG.PASSING_PERCENTAGE;
};

export const isCivicExamPassedByCount = (correctAnswers: number): boolean => {
    return correctAnswers >= CIVIC_EXAM_CONFIG.PASSING_SCORE;
};

export const calculateCivicExamResult = (
    correctAnswers: number,
    totalQuestions: number,
    timeSpent: number
): {
    score: number;
    passed: boolean;
    correctAnswers: number;
    totalQuestions: number;
    timeSpent: number;
} => {
    const score = calculateCivicExamScore(correctAnswers, totalQuestions);
    const passed = isCivicExamPassed(score);
    
    return {
        score,
        passed,
        correctAnswers,
        totalQuestions,
        timeSpent,
    };
};


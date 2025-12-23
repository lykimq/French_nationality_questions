import type { TestQuestion } from '../../types';
import type { CivicExamTheme, CivicExamSubTheme, QuestionType, CivicExamQuestion } from '../types';
import { CATEGORY_TO_THEME_MAP, SUBTHEME_TO_CATEGORY_MAP } from '../constants/civicExamConstants';

// ==================== THEME MAPPING ====================

export const mapCategoryToTheme = (categoryId: string): CivicExamTheme | null => {
    return CATEGORY_TO_THEME_MAP[categoryId] || null;
};

export const getThemeFromQuestion = (question: TestQuestion): CivicExamTheme | null => {
    // First check if question has explicit theme metadata
    if ('theme' in question && question.theme) {
        return question.theme as CivicExamTheme;
    }
    
    // Fall back to category mapping
    return mapCategoryToTheme(question.categoryId);
};

export const getSubThemeFromQuestion = (question: TestQuestion): CivicExamSubTheme | null => {
    // Check if question has explicit subTheme metadata
    if ('subTheme' in question && question.subTheme) {
        return question.subTheme as CivicExamSubTheme;
    }
    
    return null;
};

export const getQuestionTypeFromQuestion = (question: TestQuestion): QuestionType => {
    // Check if question has explicit questionType metadata
    if ('questionType' in question && question.questionType) {
        return question.questionType as QuestionType;
    }
    
    // Default to knowledge if not specified
    return 'knowledge';
};

// ==================== QUESTION FILTERING ====================

export const getQuestionsByTheme = (
    questions: TestQuestion[],
    theme: CivicExamTheme
): TestQuestion[] => {
    return questions.filter(q => getThemeFromQuestion(q) === theme);
};

export const getQuestionsBySubTheme = (
    questions: TestQuestion[],
    subTheme: CivicExamSubTheme
): TestQuestion[] => {
    return questions.filter(q => getSubThemeFromQuestion(q) === subTheme);
};

export const filterQuestionsWithOptions = (questions: TestQuestion[]): TestQuestion[] => {
    return questions.filter(q => {
        const hasOptions = 'options' in q && Array.isArray(q.options) && q.options.length > 0;
        return hasOptions;
    });
};

export const filterKnowledgeQuestions = (questions: TestQuestion[]): TestQuestion[] => {
    return questions.filter(q => {
        const questionType = getQuestionTypeFromQuestion(q);
        const hasOptions = 'options' in q && Array.isArray(q.options) && q.options.length > 0;
        return questionType === 'knowledge' && hasOptions;
    });
};

export const filterSituationalQuestions = (questions: TestQuestion[]): TestQuestion[] => {
    return questions.filter(q => getQuestionTypeFromQuestion(q) === 'situational');
};

export const getQuestionsByThemes = (
    questions: TestQuestion[],
    themes: readonly CivicExamTheme[]
): TestQuestion[] => {
    return questions.filter(q => {
        const questionTheme = getThemeFromQuestion(q);
        return questionTheme !== null && themes.includes(questionTheme);
    });
};

// ==================== QUESTION ENRICHMENT ====================

/**
 * Enriches a question with required civic exam metadata.
 * Requires theme and subTheme to be present - questions without metadata
 * should not be used in civic exams.
 */
export const enrichQuestionWithMetadata = (
    question: TestQuestion
): CivicExamQuestion => {
    const theme = getThemeFromQuestion(question);
    const subTheme = getSubThemeFromQuestion(question);
    const questionType = getQuestionTypeFromQuestion(question);

    if (!theme) {
        throw new Error(`Question ${question.id} missing required theme metadata`);
    }

    if (!subTheme) {
        throw new Error(`Question ${question.id} missing required subTheme metadata`);
    }

    return {
        ...question,
        theme,
        subTheme,
        questionType,
    };
};

export const enrichQuestionsWithMetadata = (
    questions: TestQuestion[]
): CivicExamQuestion[] => {
    return questions.map(enrichQuestionWithMetadata);
};

// ==================== VALIDATION ====================

export const hasThemeMetadata = (question: TestQuestion): boolean => {
    return 'theme' in question && question.theme !== undefined;
};

export const hasSubThemeMetadata = (question: TestQuestion): boolean => {
    return 'subTheme' in question && question.subTheme !== undefined;
};

export const hasQuestionTypeMetadata = (question: TestQuestion): boolean => {
    return 'questionType' in question && question.questionType !== undefined;
};


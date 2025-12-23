import { createLogger } from '../../shared/utils/logger';
import type { CivicExamQuestionWithOptions } from './civicExamQuestionUtils';
import type { CivicExamTheme, CivicExamSubTheme } from '../types';

const logger = createLogger('CivicExamDataLoader');

interface CivicExamQuestionData {
    id: number;
    question: string;
    explanation: string;
    image?: string | null;
    theme?: string;
    subTheme: string;
    questionType: string;
    options?: string[];
    correctAnswer?: number;
    explanationOptions?: string[];
    correctExplanationAnswer?: number;
    incorrectAnswers?: string[];
}

interface CivicExamDataFile {
    themeId?: string;
    themeTitle?: string;
    questions?: CivicExamQuestionData[];
}

const VALID_THEMES: readonly CivicExamTheme[] = [
    'principles_values',
    'institutional_political',
    'rights_duties',
    'history_geography_culture',
    'living_society',
] as const;

const VALID_SUBTHEMES: readonly CivicExamSubTheme[] = [
    'devise_symboles',
    'laicite',
    'situational_principles',
    'democracy_vote',
    'organization_republic',
    'european_institutions',
    'fundamental_rights',
    'obligations_duties',
    'situational_rights',
    'historical_periods',
    'territories_geography',
    'heritage',
    'residence',
    'healthcare',
    'work',
    'parental_authority_education',
] as const;

const isValidTheme = (value: string): value is CivicExamTheme => {
    return VALID_THEMES.includes(value as CivicExamTheme);
};

const isValidSubTheme = (value: string): value is CivicExamSubTheme => {
    return VALID_SUBTHEMES.includes(value as CivicExamSubTheme);
};

const normalizeQuestionType = (questionType: string): 'knowledge' | 'situational' => {
    const normalized = questionType.toLowerCase().trim();
    if (normalized === 'situation' || normalized === 'situational') {
        return 'situational';
    }
    return 'knowledge';
};

const extractCivicId = (rawId: unknown): number | undefined => {
    if (typeof rawId === 'number') {
        return Number.isFinite(rawId) ? rawId : undefined;
    }
    if (typeof rawId === 'string') {
        const match = rawId.match(/(\d+)/);
        if (match) {
            const value = Number(match[1]);
            return Number.isFinite(value) ? value : undefined;
        }
    }
    return undefined;
};

const validateQuestionData = (
    q: unknown, 
    defaultTheme?: CivicExamTheme,
    onInvalid?: (reason: string) => void
): q is CivicExamQuestionData & { theme: CivicExamTheme } => {
    if (typeof q !== 'object' || q === null) {
        onInvalid?.('Question is not an object');
        return false;
    }

    const question = q as Record<string, unknown>;
    const questionId = question.id;
    const numericId = extractCivicId(questionId);

    const hasValidId = typeof numericId === 'number' &&
        isFinite(numericId) &&
        numericId > 0;
    
    if (!hasValidId) {
        onInvalid?.(`Question ${questionId || 'unknown'} has invalid ID (must contain a positive number)`);
        return false;
    }
    
    const hasValidQuestion = typeof question.question === 'string' &&
        question.question.length > 0;
    
    if (!hasValidQuestion) {
        onInvalid?.(`Question ${questionId} missing or empty question text`);
        return false;
    }
    
    const hasValidExplanation = typeof question.explanation === 'string';
    
    if (!hasValidExplanation) {
        onInvalid?.(`Question ${questionId} missing explanation`);
        return false;
    }
    
    const hasValidSubTheme = typeof question.subTheme === 'string' &&
        question.subTheme.length > 0;
    
    if (!hasValidSubTheme) {
        onInvalid?.(`Question ${questionId} missing or empty subTheme`);
        return false;
    }
    
    const questionType = typeof question.questionType === 'string' ? question.questionType.toLowerCase().trim() : '';
    const hasValidQuestionType = questionType === 'knowledge' || 
        questionType === 'situational' || 
        questionType === 'situation';

    if (!hasValidQuestionType) {
        onInvalid?.(`Question ${questionId} has invalid questionType: "${question.questionType}" (must be "knowledge" or "situational")`);
        return false;
    }

    const theme = question.theme as string | undefined;
    const hasValidTheme = theme ? isValidTheme(theme) : defaultTheme !== undefined;

    if (!hasValidTheme) {
        const themeStr = theme ? `"${theme}"` : 'undefined';
        onInvalid?.(`Question ${questionId} has invalid theme: ${themeStr} (must be one of: ${VALID_THEMES.join(', ')})`);
        return false;
    }

    const subTheme = question.subTheme as string;
    if (!isValidSubTheme(subTheme)) {
        onInvalid?.(`Question ${questionId} has invalid subTheme: "${subTheme}" (must be one of: ${VALID_SUBTHEMES.join(', ')})`);
        return false;
    }

    return true;
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

const CIVIC_ID_OFFSET = 1_000_000;

const transformCivicQuestion = (
    q: CivicExamQuestionData,
    defaultTheme: CivicExamTheme
): CivicExamQuestionWithOptions => {
    const baseNumber = extractCivicId(q.id) ?? 0;
    const theme = q.theme ? (isValidTheme(q.theme) ? q.theme : defaultTheme) : defaultTheme;
    const subTheme = q.subTheme as CivicExamSubTheme;
    const questionType = normalizeQuestionType(q.questionType);
    
    let options = sanitizeStringArray(q.options);
    
    if (options.length === 0 && q.incorrectAnswers && Array.isArray(q.incorrectAnswers)) {
        const incorrectAnswers = sanitizeStringArray(q.incorrectAnswers);
        const correctAnswer = sanitizeString(q.correctAnswer as string | undefined || '');
        
        if (incorrectAnswers.length > 0 || correctAnswer) {
            options = [correctAnswer, ...incorrectAnswers].filter(opt => opt.length > 0);
        }
    }
    
    const explanationOptions = sanitizeStringArray(q.explanationOptions);

    const resolveCorrectAnswerIndex = (): number | undefined => {
        // Numeric index provided
        if (typeof q.correctAnswer === 'number' && isFinite(q.correctAnswer)) {
            return validateAnswerIndex(q.correctAnswer, options.length);
        }

        // String answer provided: try to match against options
        if (typeof q.correctAnswer === 'string') {
            const trimmed = sanitizeString(q.correctAnswer);
            if (trimmed && options.length > 0) {
                const matchIndex = options.findIndex(opt => opt.toLowerCase() === trimmed.toLowerCase());
                if (matchIndex >= 0) return matchIndex;
            }
        }

        // If options were synthesized with correct answer first, default to 0
        if (options.length > 0 && typeof q.correctAnswer === 'string') {
            return 0;
        }

        return undefined;
    };

    return {
        id: CIVIC_ID_OFFSET + baseNumber,
        question: sanitizeString(q.question),
        explanation: sanitizeString(q.explanation),
        image: typeof q.image === 'string' && q.image.trim().length > 0 ? q.image.trim() : undefined,
        categoryId: 'civic_exam',
        categoryTitle: 'Examen Civique',
        theme,
        subTheme,
        questionType,
        options,
        correctAnswer: resolveCorrectAnswerIndex(),
        explanationOptions,
        correctExplanationAnswer: validateAnswerIndex(q.correctExplanationAnswer, explanationOptions.length),
    };
};

const loadQuestionsFromFileData = (
    fileData: CivicExamDataFile | CivicExamQuestionData[],
    defaultTheme?: CivicExamTheme
): CivicExamQuestionWithOptions[] => {
    let questions: CivicExamQuestionData[] = [];
    let theme: CivicExamTheme | undefined = defaultTheme;

    if (Array.isArray(fileData)) {
        questions = fileData;
    } else if (fileData.questions && Array.isArray(fileData.questions)) {
        questions = fileData.questions;
        if (fileData.themeId) {
            if (isValidTheme(fileData.themeId)) {
                theme = fileData.themeId;
            } else {
                logger.warn(`Invalid themeId in file: "${fileData.themeId}"`);
            }
        }
    } else {
        logger.warn('Unexpected data structure in civic exam file');
        return [];
    }

    if (questions.length === 0) {
        logger.warn('Civic exam questions array is empty');
        return [];
    }

    if (!theme) {
        logger.warn('Could not determine theme for civic exam questions, skipping');
        return [];
    }

    const validationErrors: string[] = [];
    const validQuestions = questions
        .filter(q => {
            const isValid = validateQuestionData(q, theme, (reason) => {
                validationErrors.push(reason);
            });
            return isValid;
        })
        .map(q => transformCivicQuestion(q, theme!));

    if (validQuestions.length < questions.length) {
        const invalidCount = questions.length - validQuestions.length;
        if (invalidCount > 0) {
            logger.warn(`Skipped ${invalidCount} invalid civic exam question(s)`);
            if (validationErrors.length > 0) {
                const errorSummary = validationErrors.slice(0, 5).join('; ');
                const moreErrors = validationErrors.length > 5 ? ` (and ${validationErrors.length - 5} more)` : '';
                logger.warn(`Validation errors: ${errorSummary}${moreErrors}`);
            }
        }
    }

    return validQuestions;
};

export const loadCivicExamQuestions = async (): Promise<CivicExamQuestionWithOptions[]> => {
    try {
        const allQuestions: CivicExamQuestionWithOptions[] = [];

        const principesData = require('../../data/test_civic/principes_et_valeurs.json');
        allQuestions.push(...loadQuestionsFromFileData(principesData));

        const systemData = require('../../data/test_civic/system_et_politique.json');
        allQuestions.push(...loadQuestionsFromFileData(systemData));

        const droitsData = require('../../data/test_civic/droits_et_devoirs.json');
        allQuestions.push(...loadQuestionsFromFileData(droitsData));

        const histoireData = require('../../data/test_civic/histoire_geographie_et_culture.json');
        allQuestions.push(...loadQuestionsFromFileData(histoireData));

        const histGeoPart1Data = require('../../data/test_civic/hist_geo_part1.json');
        allQuestions.push(...loadQuestionsFromFileData(histGeoPart1Data, 'history_geography_culture'));

        const histGeoPart2Data = require('../../data/test_civic/hist_geo_part2.json');
        allQuestions.push(...loadQuestionsFromFileData(histGeoPart2Data, 'history_geography_culture'));

        const vivreData = require('../../data/test_civic/vivre_dans_la_societe_francaise.json');
        allQuestions.push(...loadQuestionsFromFileData(vivreData));

        if (allQuestions.length === 0) {
            logger.warn('No valid civic exam questions found after loading all files');
        }

        return allQuestions;
    } catch (error) {
        logger.warn('Could not load civic exam questions:', error);
        return [];
    }
};

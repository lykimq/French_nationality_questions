import { createLogger } from '../../shared/utils/logger';
import { extractNumericId, isValidId } from '../../shared/utils/idUtils';
import { sanitizeString, sanitizeStringArray, isNonEmptyString } from '../../shared/utils/stringUtils';
import type { CivicExamQuestionWithOptions } from './civicExamQuestionUtils';
import type { CivicExamTheme, CivicExamSubTheme } from '../types';

const logger = createLogger('CivicExamDataLoader');

/**
 * Raw civic exam question data structure as stored in JSON files.
 * Questions use correctAnswer (string) + incorrectAnswers (array) format,
 * which are combined into an options array during transformation.
 */
interface CivicExamQuestionData {
    id: number;
    question: string;
    explanation: string;
    image?: string | null;
    theme?: string;
    subTheme: string;
    questionType: string;
    correctAnswer?: string;
    incorrectAnswers?: string[];
    explanationOptions?: string[];
    correctExplanationAnswer?: number;
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
    const numericId = extractNumericId(questionId);

    if (!isValidId(numericId)) {
        onInvalid?.(`Question ${questionId || 'unknown'} has invalid ID (must contain a positive number)`);
        return false;
    }
    
    if (!isNonEmptyString(question.question)) {
        onInvalid?.(`Question ${questionId} missing or empty question text`);
        return false;
    }
    
    if (!isNonEmptyString(question.explanation)) {
        onInvalid?.(`Question ${questionId} missing explanation`);
        return false;
    }
    
    if (!isNonEmptyString(question.subTheme)) {
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

    const isKnowledgeQuestion = questionType === 'knowledge';
    
    if (isKnowledgeQuestion) {
        const correctAnswer = question.correctAnswer;
        const incorrectAnswers = question.incorrectAnswers;
        
        if (!isNonEmptyString(correctAnswer)) {
            onInvalid?.(`Question ${questionId} (knowledge type) missing or empty correctAnswer`);
            return false;
        }
        
        if (!Array.isArray(incorrectAnswers) || incorrectAnswers.length === 0) {
            onInvalid?.(`Question ${questionId} (knowledge type) missing or empty incorrectAnswers array`);
            return false;
        }
        
        const validIncorrectAnswers = incorrectAnswers.filter((ans: unknown) => isNonEmptyString(ans));
        if (validIncorrectAnswers.length === 0) {
            onInvalid?.(`Question ${questionId} (knowledge type) incorrectAnswers array contains no valid strings`);
            return false;
        }
        
    }

    return true;
};

/**
 * Validates that an answer index is within valid bounds.
 */
const validateAnswerIndex = (index: unknown, maxLength: number): number | undefined => {
    if (typeof index !== 'number' || !isFinite(index)) return undefined;
    return index >= 0 && index < maxLength ? index : undefined;
};

/**
 * Finds the index of the correct answer text in the options array.
 * This ensures we find the actual correct answer, not just assume it's at index 0.
 */
const resolveCorrectAnswerIndex = (correctAnswerText: string, options: string[]): number | undefined => {
    if (!correctAnswerText || options.length === 0) {
        return undefined;
    }
    
    // Find the index of the correct answer text in the options array
    const index = options.findIndex(opt => opt === correctAnswerText);
    return index >= 0 ? index : undefined;
};

const CIVIC_ID_OFFSET = 1_000_000;

const transformCivicQuestion = (
    q: CivicExamQuestionData,
    defaultTheme: CivicExamTheme
): CivicExamQuestionWithOptions => {
    // At this point, validation has already passed, so we can trust the data structure
    const baseNumber = extractNumericId(q.id) ?? 0;
    const theme = (q.theme && isValidTheme(q.theme)) ? q.theme : defaultTheme;
    const subTheme = q.subTheme as CivicExamSubTheme;
    const questionType = normalizeQuestionType(q.questionType);
    
    // Build options array from correctAnswer + incorrectAnswers
    const correctAnswer = sanitizeString(q.correctAnswer);
    const incorrectAnswers = sanitizeStringArray(q.incorrectAnswers);
    
    // Build options array and filter out empty strings
    const allOptions = [correctAnswer, ...incorrectAnswers];
    const options = allOptions.filter(opt => opt.length > 0);
    
    // Find the index of the correct answer in the filtered options array
    // This ensures we get the actual index, even if some options were filtered out
    const correctAnswerIndex = resolveCorrectAnswerIndex(correctAnswer, options);
    
    // Validate that we found the correct answer
    if (correctAnswerIndex === undefined) {
        logger.warn(
            `Question ${q.id}: Could not find correct answer "${correctAnswer}" in options array. ` +
            `This should not happen if validation is working correctly.`
        );
    }
    
    const explanationOptions = sanitizeStringArray(q.explanationOptions);
    const correctExplanationIndex = validateAnswerIndex(q.correctExplanationAnswer, explanationOptions.length);

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
        correctAnswer: correctAnswerIndex,
        explanationOptions,
        correctExplanationAnswer: correctExplanationIndex,
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
        .map(q => transformCivicQuestion(q, theme!))
        .filter(q => q.options && Array.isArray(q.options) && q.options.length > 0);

    if (validQuestions.length < questions.length && validationErrors.length > 0) {
        const errorSummary = validationErrors.slice(0, 3).join('; ');
        logger.warn(`Skipped ${questions.length - validQuestions.length} invalid question(s): ${errorSummary}`);
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

        return allQuestions;
    } catch (error) {
        logger.warn('Could not load civic exam questions:', error);
        return [];
    }
};

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

const THEME_ID_MAP: Record<string, CivicExamTheme> = {
    'principes_et_valeurs': 'principles_values',
    'system_et_politique': 'institutional_political',
    'droits_et_devoirs': 'rights_duties',
    'histoire_geographie_et_culture': 'history_geography_culture',
    'vivre_dans_la_societe_francaise': 'living_society',
};

const SUBTHEME_MAP: Record<string, CivicExamSubTheme> = {
    'devise_symboles': 'devise_symboles',
    'laicite': 'laicite',
    'principes_situation': 'situational_principles',
    'situational_principles': 'situational_principles',
    'democratie_vote': 'democracy_vote',
    'democracy_vote': 'democracy_vote',
    'organisation_republique': 'organization_republic',
    'organization_republic': 'organization_republic',
    'european_institutions': 'european_institutions',
    'droits_fondamentaux': 'fundamental_rights',
    'fundamental_rights': 'fundamental_rights',
    'obligations_devoirs': 'obligations_duties',
    'obligations_duties': 'obligations_duties',
    'droits_situation': 'situational_rights',
    'situational_rights': 'situational_rights',
    'histoire': 'historical_periods',
    'historical_periods': 'historical_periods',
    'geographie': 'territories_geography',
    'territories_geography': 'territories_geography',
    'culture': 'heritage',
    'heritage': 'heritage',
    'residence': 'residence',
    'healthcare': 'healthcare',
    'work': 'work',
    'parental_authority_education': 'parental_authority_education',
    'demarches_administratives': 'residence',
    'services_publics': 'residence',
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

    const hasValidId = typeof question.id === 'number' &&
        isFinite(question.id) &&
        question.id > 0;
    
    if (!hasValidId) {
        onInvalid?.(`Question ${questionId || 'unknown'} has invalid ID (must be positive number)`);
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
    const hasValidTheme = theme ? THEME_ID_MAP[theme] !== undefined : defaultTheme !== undefined;

    if (!hasValidTheme) {
        const themeStr = theme ? `"${theme}"` : 'undefined';
        onInvalid?.(`Question ${questionId} has invalid theme: ${themeStr} (no default theme provided)`);
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

const normalizeSubTheme = (subTheme: string): CivicExamSubTheme => {
    const normalized = subTheme.toLowerCase().trim();
    return SUBTHEME_MAP[normalized] || 'devise_symboles';
};

const transformCivicQuestion = (
    q: CivicExamQuestionData,
    defaultTheme: CivicExamTheme
): CivicExamQuestionWithOptions => {
    const theme = q.theme ? (THEME_ID_MAP[q.theme] || defaultTheme) : defaultTheme;
    const subTheme = normalizeSubTheme(q.subTheme);
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

    return {
        id: q.id,
        question: sanitizeString(q.question),
        explanation: sanitizeString(q.explanation),
        image: typeof q.image === 'string' && q.image.trim().length > 0 ? q.image.trim() : undefined,
        categoryId: 'civic_exam',
        categoryTitle: 'Examen Civique',
        theme,
        subTheme,
        questionType,
        options,
        correctAnswer: validateAnswerIndex(q.correctAnswer, options.length),
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
            theme = THEME_ID_MAP[fileData.themeId];
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

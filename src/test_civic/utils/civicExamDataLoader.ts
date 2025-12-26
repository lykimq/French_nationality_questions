import { createLogger } from '../../shared/utils/logger';
import { extractNumericId, isValidId } from '../../shared/utils/idUtils';
import { sanitizeString, sanitizeStringArray, isNonEmptyString } from '../../shared/utils/stringUtils';
import { DATA_FILES } from '../../shared/config/dataConfig';
import { loadJsonCollection } from '../../shared/services/dataService';
import type { CivicExamQuestionWithOptions } from './civicExamQuestionUtils';
import type { CivicExamTopic, CivicExamSubTopic } from '../types';

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
    theme?: string; // JSON property name (will be transformed to 'topic')
    subTheme: string; // JSON property name (will be transformed to 'subTopic')
    questionType: string;
    correctAnswer?: string;
    incorrectAnswers?: string[];
    explanationOptions?: string[];
    correctExplanationAnswer?: number;
}

interface CivicExamDataFile {
    themeId?: string; // JSON property name (legacy, maps to topic)
    themeTitle?: string;
    questions?: CivicExamQuestionData[];
}

const VALID_TOPICS: readonly CivicExamTopic[] = [
    'principles_values',
    'institutional_political',
    'rights_duties',
    'history_geography_culture',
    'living_society',
] as const;

const VALID_SUBTOPICS: readonly CivicExamSubTopic[] = [
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

const isValidTopic = (value: string): value is CivicExamTopic => {
    return VALID_TOPICS.includes(value as CivicExamTopic);
};

const isValidSubTopic = (value: string): value is CivicExamSubTopic => {
    return VALID_SUBTOPICS.includes(value as CivicExamSubTopic);
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
    defaultTopic?: CivicExamTopic,
    onInvalid?: (reason: string) => void
): q is CivicExamQuestionData & { theme: CivicExamTopic } => {
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
    const hasValidTopic = theme ? isValidTopic(theme) : defaultTopic !== undefined;

    if (!hasValidTopic) {
        const themeStr = theme ? `"${theme}"` : 'undefined';
        onInvalid?.(`Question ${questionId} has invalid topic: ${themeStr} (must be one of: ${VALID_TOPICS.join(', ')})`);
        return false;
    }

    const subTheme = question.subTheme as string;
    if (!isValidSubTopic(subTheme)) {
        onInvalid?.(`Question ${questionId} has invalid subTopic: "${subTheme}" (must be one of: ${VALID_SUBTOPICS.join(', ')})`);
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
    defaultTopic: CivicExamTopic
): CivicExamQuestionWithOptions => {
    // At this point, validation has already passed, so we can trust the data structure
    const baseNumber = extractNumericId(q.id) ?? 0;
    // Transform JSON property 'theme' to TypeScript property 'topic'
    const topic = (q.theme && isValidTopic(q.theme)) ? q.theme : defaultTopic;
    // Transform JSON property 'subTheme' to TypeScript property 'subTopic'
    const subTopic = q.subTheme as CivicExamSubTopic;
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
        topic, // Transformed from JSON 'theme' property
        subTopic, // Transformed from JSON 'subTheme' property
        questionType,
        options,
        correctAnswer: correctAnswerIndex,
        explanationOptions,
        correctExplanationAnswer: correctExplanationIndex,
    };
};

const loadQuestionsFromFileData = (
    fileData: CivicExamDataFile | CivicExamQuestionData[],
    defaultTopic?: CivicExamTopic
): CivicExamQuestionWithOptions[] => {
    let questions: CivicExamQuestionData[] = [];
    let topic: CivicExamTopic | undefined = defaultTopic;

    if (Array.isArray(fileData)) {
        questions = fileData;
    } else if (fileData.questions && Array.isArray(fileData.questions)) {
        questions = fileData.questions;
        if (fileData.themeId) {
            // Transform JSON 'themeId' to TypeScript 'topic'
            if (isValidTopic(fileData.themeId)) {
                topic = fileData.themeId;
            } else {
                logger.warn(`Invalid topicId (themeId in JSON) in file: "${fileData.themeId}"`);
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

    if (!topic) {
        logger.warn('Could not determine topic for civic exam questions, skipping');
        return [];
    }

    const validationErrors: string[] = [];
    const validQuestions = questions
        .filter(q => {
            const isValid = validateQuestionData(q, topic, (reason) => {
                validationErrors.push(reason);
            });
            return isValid;
        })
        .map(q => transformCivicQuestion(q, topic!))
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

        const dataMap = await loadJsonCollection(
            DATA_FILES.TEST_CIVIC.FILES,
            DATA_FILES.TEST_CIVIC.DIRECTORY
        );

        const principesData = dataMap['principes_et_valeurs'];
        if (principesData) {
            allQuestions.push(...loadQuestionsFromFileData(principesData as CivicExamDataFile | CivicExamQuestionData[]));
        }

        const systemData = dataMap['system_et_politique'];
        if (systemData) {
            allQuestions.push(...loadQuestionsFromFileData(systemData as CivicExamDataFile | CivicExamQuestionData[]));
        }

        const droitsData = dataMap['droits_et_devoirs'];
        if (droitsData) {
            allQuestions.push(...loadQuestionsFromFileData(droitsData as CivicExamDataFile | CivicExamQuestionData[]));
        }

        const histoireData = dataMap['histoire_geographie_et_culture'];
        if (histoireData) {
            allQuestions.push(...loadQuestionsFromFileData(histoireData as CivicExamDataFile | CivicExamQuestionData[]));
        }

        const histGeoPart1Data = dataMap['hist_geo_part1'];
        if (histGeoPart1Data) {
            allQuestions.push(...loadQuestionsFromFileData(histGeoPart1Data as CivicExamDataFile | CivicExamQuestionData[], 'history_geography_culture'));
        }

        const histGeoPart2Data = dataMap['hist_geo_part2'];
        if (histGeoPart2Data) {
            allQuestions.push(...loadQuestionsFromFileData(histGeoPart2Data as CivicExamDataFile | CivicExamQuestionData[], 'history_geography_culture'));
        }

        const vivreData = dataMap['vivre_dans_la_societe_francaise'];
        if (vivreData) {
            allQuestions.push(...loadQuestionsFromFileData(vivreData as CivicExamDataFile | CivicExamQuestionData[]));
        }

        return allQuestions;
    } catch (error) {
        logger.warn('Could not load civic exam questions:', error);
        return [];
    }
};

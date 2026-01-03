import type { TestQuestion } from '../../types';
import type { CivicExamTopic, CivicExamSubTopic, QuestionType, CivicExamQuestion } from '../types';
import { createLogger } from '../../shared/utils/logger';

const logger = createLogger('CivicExamUtils');

// ==================== TOPIC MAPPING ====================

/**
 * Gets the topic from a question.
 * 
 * Design Principle: Topic/subTopic metadata is ONLY for civic exam questions.
 * General knowledge questions use categoryId for their own categorization.
 * 
 * @param question - The question to get topic from
 * @returns The topic if present, null otherwise
 */
export const getTopicFromQuestion = (question: TestQuestion): CivicExamTopic | null => {
    // Civic exam questions should always have explicit topic metadata
    if ('topic' in question && question.topic) {
        return question.topic as CivicExamTopic;
    }
    
    // For civic exam questions, topic should always be present in the data
    if (question.categoryId === 'civic_exam') {
        logger.warn(
            `Civic exam question ${question.id} is missing topic metadata. ` +
            `This should be fixed in the JSON data file.`
        );
        return null;
    }
    
    // General knowledge questions don't have topics - this is by design
    // They use categoryId for their own categorization system
    return null;
};

/**
 * Gets the subTopic from a question.
 * 
 * Design Principle: SubTopic metadata is ONLY for civic exam questions.
 * General knowledge questions don't need subTopics.
 * 
 * @param question - The question to get subTopic from
 * @returns The subTopic if present, null otherwise
 */
export const getSubTopicFromQuestion = (question: TestQuestion): CivicExamSubTopic | null => {
    // Check if question has explicit subTopic metadata
    if ('subTopic' in question && question.subTopic) {
        return question.subTopic as CivicExamSubTopic;
    }
    
    // General knowledge questions don't have subTopics - this is by design
    return null;
};

export const getQuestionTypeFromQuestion = (question: TestQuestion): QuestionType => {
    // Check if question has explicit questionType metadata
    if ('questionType' in question && question.questionType) {
        const questionType = question.questionType;
        // Normalize for safety (source data should already be normalized to "situational")
        if (typeof questionType === 'string') {
            const normalized = questionType.toLowerCase().trim();
            if (normalized === 'situation' || normalized === 'situational') {
                return 'situational';
            }
            if (normalized === 'knowledge') {
                return 'knowledge';
            }
        }
        return questionType as QuestionType;
    }
    
    // Default to knowledge if not specified
    return 'knowledge';
};

// ==================== QUESTION FILTERING ====================

export const getQuestionsByTopic = (
    questions: TestQuestion[],
    topic: CivicExamTopic
): TestQuestion[] => {
    return questions.filter(q => getTopicFromQuestion(q) === topic);
};

/**
 * Filters questions by subTopic.
 * 
 * Note: Only civic exam questions have subTopics. This function will only
 * return civic exam questions that match the specified subTopic.
 * 
 * @param questions - Array of questions to filter
 * @param subTopic - The subTopic to filter by
 * @returns Questions that match the subTopic (only civic exam questions)
 */
export const getQuestionsBySubTopic = (
    questions: TestQuestion[],
    subTopic: CivicExamSubTopic
): TestQuestion[] => {
    return questions.filter(q => getSubTopicFromQuestion(q) === subTopic);
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
    return questions.filter(q => {
        const questionType = getQuestionTypeFromQuestion(q);
        const hasOptions = 'options' in q && Array.isArray(q.options) && q.options.length > 0;
        return questionType === 'situational' && hasOptions;
    });
};

/**
 * Filters questions by multiple themes.
 * 
/**
 * Filters questions by multiple topics.
 * 
 * Note: Only civic exam questions have topics. This function will only
 * return civic exam questions that match any of the specified topics.
 * 
 * @param questions - Array of questions to filter
 * @param topics - Array of topics to filter by
 * @returns Questions that match any of the topics (only civic exam questions)
 */
export const getQuestionsByTopics = (
    questions: TestQuestion[],
    topics: readonly CivicExamTopic[]
): TestQuestion[] => {
    return questions.filter(q => {
        const questionTopic = getTopicFromQuestion(q);
        return questionTopic !== null && topics.includes(questionTopic);
    });
};

// ==================== QUESTION ENRICHMENT ====================

/**
 * Enriches a question with required civic exam metadata.
 * Requires topic and subTopic to be present - questions without metadata
 * should not be used in civic exams.
 */
export const enrichQuestionWithMetadata = (
    question: TestQuestion
): CivicExamQuestion => {
    const topic = getTopicFromQuestion(question);
    const subTopic = getSubTopicFromQuestion(question);
    const questionType = getQuestionTypeFromQuestion(question);

    if (!topic) {
        throw new Error(`Question ${question.id} missing required topic metadata`);
    }

    if (!subTopic) {
        throw new Error(`Question ${question.id} missing required subTopic metadata`);
    }

    return {
        ...question,
        topic,
        subTopic,
        questionType,
    };
};

export const enrichQuestionsWithMetadata = (
    questions: TestQuestion[]
): CivicExamQuestion[] => {
    const validQuestions: CivicExamQuestion[] = [];
    const invalidQuestionIds: (string | number)[] = [];
    
    questions.forEach(question => {
        const topic = getTopicFromQuestion(question);
        const subTopic = getSubTopicFromQuestion(question);
        
        if (!topic || !subTopic) {
            invalidQuestionIds.push(question.id);
            return;
        }
        
        try {
            const enriched = enrichQuestionWithMetadata(question);
            validQuestions.push(enriched);
        } catch (error) {
            invalidQuestionIds.push(question.id);
        }
    });
    
    if (invalidQuestionIds.length > 0) {
        logger.warn(
            `Skipped ${invalidQuestionIds.length} question(s) missing required metadata: ${invalidQuestionIds.slice(0, 5).join(', ')}${invalidQuestionIds.length > 5 ? '...' : ''}`
        );
    }
    
    return validQuestions;
};

// ==================== VALIDATION ====================

export const hasTopicMetadata = (question: TestQuestion): boolean => {
    return 'topic' in question && question.topic !== undefined;
};

export const hasSubTopicMetadata = (question: TestQuestion): boolean => {
    return 'subTopic' in question && question.subTopic !== undefined;
};

export const hasQuestionTypeMetadata = (question: TestQuestion): boolean => {
    return 'questionType' in question && question.questionType !== undefined;
};


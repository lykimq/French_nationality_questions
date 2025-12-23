import AsyncStorage from '@react-native-async-storage/async-storage';
import { createLogger } from '../../shared/utils/logger';
import type { CivicExamSession, TestAnswer, TestQuestion } from '../types';

const logger = createLogger('CivicExamSessionStorage');

const SESSION_KEY = 'civic_exam_active_session';

type StoredAnswer = Omit<TestAnswer, 'timestamp'> & { timestamp: string };
type StoredSession = Omit<CivicExamSession, 'startTime' | 'endTime' | 'questions' | 'answers'> & {
    startTime: string;
    endTime?: string;
    questions: TestQuestion[];
    answers: StoredAnswer[];
};

const serializeSession = (session: CivicExamSession): string => {
    const payload: StoredSession = {
        ...session,
        startTime: session.startTime.toISOString(),
        endTime: session.endTime ? session.endTime.toISOString() : undefined,
        questions: session.questions as TestQuestion[],
        answers: session.answers.map(answer => ({
            ...answer,
            timestamp: answer.timestamp.toISOString(),
        })),
    };
    return JSON.stringify(payload);
};

const parseDate = (value: unknown): Date | undefined => {
    if (typeof value !== 'string') return undefined;
    const parsed = new Date(value);
    return isNaN(parsed.getTime()) ? undefined : parsed;
};

const deserializeSession = (raw: string | null): CivicExamSession | null => {
    if (!raw) return null;
    try {
        const parsed = JSON.parse(raw) as StoredSession;
        const startTime = parseDate(parsed.startTime);
        if (!startTime) return null;
        const endTime = parseDate(parsed.endTime);

        return {
            ...parsed,
            startTime,
            endTime,
            questions: parsed.questions,
            answers: parsed.answers.map(a => ({
                ...a,
                timestamp: parseDate(a.timestamp) || new Date(),
            })),
        };
    } catch (error) {
        logger.error('Failed to deserialize civic exam session:', error);
        return null;
    }
};

export const loadStoredSession = async (): Promise<CivicExamSession | null> => {
    try {
        const raw = await AsyncStorage.getItem(SESSION_KEY);
        return deserializeSession(raw);
    } catch (error) {
        logger.error('Error loading stored civic exam session:', error);
        return null;
    }
};

export const saveSession = async (session: CivicExamSession | null): Promise<void> => {
    try {
        if (!session) {
            await AsyncStorage.removeItem(SESSION_KEY);
            return;
        }
        const payload = serializeSession(session);
        await AsyncStorage.setItem(SESSION_KEY, payload);
    } catch (error) {
        logger.error('Error saving civic exam session:', error);
    }
};

export const clearStoredSession = async (): Promise<void> => {
    try {
        await AsyncStorage.removeItem(SESSION_KEY);
    } catch (error) {
        logger.error('Error clearing civic exam session:', error);
    }
};


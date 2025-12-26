import type { CivicExamResult, CivicExamSession, CivicExamTopic, CivicExamQuestion, TestAnswer, CivicExamStatistics } from '../types';

// Serializable civic exam result for navigation (dates as ISO strings)
export interface SerializableCivicExamResult {
    readonly session: {
        readonly id: string;
        readonly mode: 'civic_exam_naturalization' | 'civic_exam_practice';
        readonly questions: readonly CivicExamQuestion[];
        readonly answers: readonly (Omit<TestAnswer, 'timestamp'> & { readonly timestamp: string })[];
        readonly startTime: string; // ISO string
        readonly endTime?: string; // ISO string
        readonly isCompleted: boolean;
        readonly score: number;
        readonly totalQuestions: number;
        readonly correctAnswers: number;
        readonly themes?: readonly string[];
        readonly isPracticeMode: boolean;
    };
    readonly statistics: CivicExamStatistics;
    readonly passed: boolean;
    readonly score: number;
    readonly correctAnswers: number;
    readonly totalQuestions: number;
    readonly incorrectQuestions: readonly CivicExamQuestion[];
    readonly timeSpent: number;
}

export const serializeCivicExamResult = (result: CivicExamResult): SerializableCivicExamResult => {
    return {
        session: {
            ...result.session,
            questions: result.session.questions as readonly CivicExamQuestion[],
            answers: result.session.answers.map(answer => ({
                ...answer,
                timestamp: answer.timestamp.toISOString(),
            })),
            startTime: result.session.startTime.toISOString(),
            endTime: result.session.endTime?.toISOString(),
        },
        statistics: result.statistics,
        passed: result.passed,
        score: result.score,
        correctAnswers: result.correctAnswers,
        totalQuestions: result.totalQuestions,
        incorrectQuestions: result.incorrectQuestions as readonly CivicExamQuestion[],
        timeSpent: result.timeSpent,
    };
};

export const deserializeCivicExamResult = (serialized: SerializableCivicExamResult): CivicExamResult => {
    const deserializedSession: CivicExamSession = {
        ...serialized.session,
        answers: serialized.session.answers.map(answer => ({
            ...answer,
            timestamp: new Date(answer.timestamp),
        })),
        startTime: new Date(serialized.session.startTime),
        endTime: serialized.session.endTime ? new Date(serialized.session.endTime) : undefined,
        topics: serialized.session.topics as readonly CivicExamTopic[] | undefined,
    };
    

    return {
        session: deserializedSession,
        statistics: serialized.statistics,
        passed: serialized.passed,
        score: serialized.score,
        correctAnswers: serialized.correctAnswers,
        totalQuestions: serialized.totalQuestions,
        incorrectQuestions: serialized.incorrectQuestions,
        timeSpent: serialized.timeSpent,
    };
};


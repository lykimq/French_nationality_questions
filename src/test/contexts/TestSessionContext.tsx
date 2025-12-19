import React, { createContext, useContext, useState, ReactNode, useCallback, useMemo } from 'react';
import { createLogger } from '../../shared/utils/logger';
import { generateTestQuestions } from '../utils';
import { calculateTestScore } from '../utils';
import type {
    TestSession,
    TestQuestion,
    TestAnswer,
    TestConfig,
    TestResult,
} from '../../types';

const logger = createLogger('TestSessionContext');

interface TestSessionContextType {
    currentSession: TestSession | null;
    isTestActive: boolean;
    currentQuestionIndex: number;

    startTest: (config: TestConfig, allQuestions: TestQuestion[], part1TestSubcategories: Record<string, any>) => Promise<void>;
    submitAnswer: (answer: TestAnswer, autoAdvance?: boolean) => Promise<void>;
    goToNextQuestion: () => void;
    finishTest: () => { session: TestSession };
    cancelTest: () => void;

    getCurrentQuestion: () => TestQuestion | null;
    getNextQuestion: () => TestQuestion | null;
    getPreviousQuestion: () => TestQuestion | null;
}

const TestSessionContext = createContext<TestSessionContextType | undefined>(undefined);

export const TestSessionProvider: React.FC<{
    children: ReactNode;
    allProcessedQuestions: TestQuestion[];
    part1TestSubcategories: Record<string, any>;
}> = ({ children, allProcessedQuestions, part1TestSubcategories }) => {
    const [currentSession, setCurrentSession] = useState<TestSession | null>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

    const startTest = useCallback(async (config: TestConfig, allQuestions: TestQuestion[], part1Data: Record<string, any>): Promise<void> => {
        const questions = generateTestQuestions(config, allQuestions, part1Data);

        if (questions.length === 0) {
            throw new Error('No questions available for this test configuration');
        }

        const newSession: TestSession = {
            id: Date.now().toString(),
            mode: config.mode,
            questions,
            answers: [],
            startTime: new Date(),
            isCompleted: false,
            score: 0,
            totalQuestions: questions.length,
            correctAnswers: 0,
        };

        setCurrentSession(newSession);
        setCurrentQuestionIndex(0);
    }, []);

    const submitAnswer = useCallback(async (answer: TestAnswer, autoAdvance: boolean = true): Promise<void> => {
        if (!currentSession) {
            throw new Error('No active test session');
        }

        const currentQuestion = currentSession.questions[currentQuestionIndex];
        if (!currentQuestion) {
            throw new Error(`No current question found at index: ${currentQuestionIndex}`);
        }

        if (answer.questionId !== currentQuestion.id) {
            throw new Error(
                `Answer question ID mismatch! Expected ${currentQuestion.id}, got ${answer.questionId}`
            );
        }

        const updatedSession: TestSession = {
            ...currentSession,
            answers: [...currentSession.answers, answer],
        };

        setCurrentSession(updatedSession);

        if (autoAdvance && currentQuestionIndex < currentSession.questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    }, [currentSession, currentQuestionIndex]);

    const goToNextQuestion = useCallback((): void => {
        if (!currentSession) {
            return;
        }
        if (currentQuestionIndex < currentSession.questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    }, [currentSession, currentQuestionIndex]);

    const finishTest = useCallback((): Omit<TestResult, 'statistics' | 'recommendations'> & { session: TestSession } => {
        if (!currentSession) {
            throw new Error('No active test session');
        }

        const correctAnswers = currentSession.answers.filter((answer: TestAnswer) => answer.isCorrect).length;
        const score = calculateTestScore(correctAnswers, currentSession.totalQuestions);

        const finishedSession: TestSession = {
            ...currentSession,
            endTime: new Date(),
            isCompleted: true,
            score,
            correctAnswers,
        };

        return {
            session: finishedSession,
        };
    }, [currentSession]);

    const cancelTest = useCallback(() => {
        setCurrentSession(null);
        setCurrentQuestionIndex(0);
    }, []);

    const getCurrentQuestion = useCallback((): TestQuestion | null => {
        if (!currentSession || currentQuestionIndex >= currentSession.questions.length) {
            return null;
        }
        return currentSession.questions[currentQuestionIndex];
    }, [currentSession, currentQuestionIndex]);

    const getNextQuestion = useCallback((): TestQuestion | null => {
        if (!currentSession || currentQuestionIndex + 1 >= currentSession.questions.length) {
            return null;
        }
        return currentSession.questions[currentQuestionIndex + 1];
    }, [currentSession, currentQuestionIndex]);

    const getPreviousQuestion = useCallback((): TestQuestion | null => {
        if (!currentSession || currentQuestionIndex <= 0) {
            return null;
        }
        return currentSession.questions[currentQuestionIndex - 1];
    }, [currentSession, currentQuestionIndex]);

    const contextValue = useMemo((): TestSessionContextType => ({
        currentSession,
        isTestActive: currentSession !== null,
        currentQuestionIndex,
        startTest,
        submitAnswer,
        goToNextQuestion,
        finishTest,
        cancelTest,
        getCurrentQuestion,
        getNextQuestion,
        getPreviousQuestion,
    }), [
        currentSession,
        currentQuestionIndex,
        startTest,
        submitAnswer,
        goToNextQuestion,
        finishTest,
        cancelTest,
        getCurrentQuestion,
        getNextQuestion,
        getPreviousQuestion,
    ]);

    return (
        <TestSessionContext.Provider value={contextValue}>
            {children}
        </TestSessionContext.Provider>
    );
};

export const useTestSession = (): TestSessionContextType => {
    const context = useContext(TestSessionContext);
    if (!context) {
        throw new Error('useTestSession must be used within a TestSessionProvider');
    }
    return context;
};


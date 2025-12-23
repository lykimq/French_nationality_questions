import React, { createContext, useContext, useState, ReactNode, useCallback, useMemo } from 'react';
import { createLogger } from '../../shared/utils/logger';
import { generateCivicExamQuestions } from '../utils/civicExamGeneration';
import { calculateCivicExamScore, isCivicExamPassed } from '../utils/civicExamScoring';
import type {
    CivicExamConfig,
    CivicExamSession,
    CivicExamQuestion,
    CivicExamResult,
} from '../types';
import type { TestAnswer } from '../types';
import { CIVIC_EXAM_CONFIG } from '../constants/civicExamConstants';

const logger = createLogger('CivicExamSessionContext');

interface CivicExamSessionContextType {
    currentSession: CivicExamSession | null;
    isExamActive: boolean;
    currentQuestionIndex: number;

    startExam: (config: CivicExamConfig, allQuestions: any[]) => Promise<void>;
    submitAnswer: (answer: TestAnswer, autoAdvance?: boolean) => Promise<void>;
    goToNextQuestion: () => void;
    finishExam: () => Omit<CivicExamResult, 'statistics'> & { session: CivicExamSession };
    cancelExam: () => void;

    getCurrentQuestion: () => CivicExamQuestion | null;
    getNextQuestion: () => CivicExamQuestion | null;
    getPreviousQuestion: () => CivicExamQuestion | null;
}

const CivicExamSessionContext = createContext<CivicExamSessionContextType | undefined>(undefined);

export const CivicExamSessionProvider: React.FC<{
    children: ReactNode;
    allProcessedQuestions: any[];
}> = ({ children, allProcessedQuestions }) => {
    const [currentSession, setCurrentSession] = useState<CivicExamSession | null>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

    const startExam = useCallback(async (config: CivicExamConfig, allQuestions: any[]): Promise<void> => {
        const questions = generateCivicExamQuestions(allQuestions, config);

        if (questions.length === 0) {
            throw new Error('No questions available for this exam configuration');
        }

        const questionIds = new Set<number>();
        const duplicateIds: number[] = [];
        questions.forEach(q => {
            if (questionIds.has(q.id)) {
                duplicateIds.push(q.id);
            } else {
                questionIds.add(q.id);
            }
        });

        if (duplicateIds.length > 0) {
            throw new Error(
                `Cannot start exam: Found ${duplicateIds.length} duplicate question(s) with IDs: ${duplicateIds.join(', ')}. ` +
                `This is a critical error and should not occur.`
            );
        }

        const isPracticeMode = config.mode === 'civic_exam_practice';

        if (!isPracticeMode && questions.length !== CIVIC_EXAM_CONFIG.TOTAL_QUESTIONS) {
            throw new Error(
                `Cannot start exam: Expected ${CIVIC_EXAM_CONFIG.TOTAL_QUESTIONS} questions, but only ${questions.length} are available. Please ensure all themes have sufficient questions.`
            );
        }

        const newSession: CivicExamSession = {
            id: Date.now().toString(),
            mode: config.mode,
            questions,
            answers: [],
            startTime: new Date(),
            isCompleted: false,
            score: 0,
            totalQuestions: questions.length,
            correctAnswers: 0,
            themes: config.selectedThemes,
            isPracticeMode,
        };

        setCurrentSession(newSession);
        setCurrentQuestionIndex(0);
    }, []);

    const submitAnswer = useCallback(async (answer: TestAnswer, autoAdvance: boolean = true): Promise<void> => {
        if (!currentSession) {
            throw new Error('No active exam session');
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

        const updatedSession: CivicExamSession = {
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

    const finishExam = useCallback((): Omit<CivicExamResult, 'statistics'> & { session: CivicExamSession } => {
        if (!currentSession) {
            throw new Error('No active exam session');
        }

        const correctAnswers = currentSession.answers.filter((answer: TestAnswer) => answer.isCorrect).length;
        const score = calculateCivicExamScore(correctAnswers, currentSession.totalQuestions);
        const passed = isCivicExamPassed(score);

        const endTime = new Date();
        const timeSpent = Math.floor((endTime.getTime() - currentSession.startTime.getTime()) / 1000);

        const finishedSession: CivicExamSession = {
            ...currentSession,
            endTime,
            isCompleted: true,
            score,
            correctAnswers,
        };

        const incorrectQuestionIds = currentSession.answers
            .filter(a => !a.isCorrect)
            .map(a => a.questionId);

        const incorrectQuestions = currentSession.questions.filter(q =>
            incorrectQuestionIds.includes(q.id)
        ) as CivicExamQuestion[];

        return {
            session: finishedSession,
            passed,
            score,
            correctAnswers,
            totalQuestions: finishedSession.totalQuestions,
            incorrectQuestions,
            timeSpent,
        };
    }, [currentSession]);

    const cancelExam = useCallback(() => {
        setCurrentSession(null);
        setCurrentQuestionIndex(0);
    }, []);

    const getCurrentQuestion = useCallback((): CivicExamQuestion | null => {
        if (!currentSession || currentQuestionIndex >= currentSession.questions.length) {
            return null;
        }
        return currentSession.questions[currentQuestionIndex] as CivicExamQuestion;
    }, [currentSession, currentQuestionIndex]);

    const getNextQuestion = useCallback((): CivicExamQuestion | null => {
        if (!currentSession || currentQuestionIndex + 1 >= currentSession.questions.length) {
            return null;
        }
        return currentSession.questions[currentQuestionIndex + 1] as CivicExamQuestion;
    }, [currentSession, currentQuestionIndex]);

    const getPreviousQuestion = useCallback((): CivicExamQuestion | null => {
        if (!currentSession || currentQuestionIndex <= 0) {
            return null;
        }
        return currentSession.questions[currentQuestionIndex - 1] as CivicExamQuestion;
    }, [currentSession, currentQuestionIndex]);

    const contextValue = useMemo((): CivicExamSessionContextType => ({
        currentSession,
        isExamActive: currentSession !== null,
        currentQuestionIndex,
        startExam,
        submitAnswer,
        goToNextQuestion,
        finishExam,
        cancelExam,
        getCurrentQuestion,
        getNextQuestion,
        getPreviousQuestion,
    }), [
        currentSession,
        currentQuestionIndex,
        startExam,
        submitAnswer,
        goToNextQuestion,
        finishExam,
        cancelExam,
        getCurrentQuestion,
        getNextQuestion,
        getPreviousQuestion,
    ]);

    return (
        <CivicExamSessionContext.Provider value={contextValue}>
            {children}
        </CivicExamSessionContext.Provider>
    );
};

export const useCivicExamSession = (): CivicExamSessionContextType => {
    const context = useContext(CivicExamSessionContext);
    if (!context) {
        throw new Error('useCivicExamSession must be used within a CivicExamSessionProvider');
    }
    return context;
};


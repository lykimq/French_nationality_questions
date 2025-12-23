import React, { createContext, useContext, useState, ReactNode, useCallback, useMemo, useEffect } from 'react';
import { createLogger } from '../../shared/utils/logger';
import { generateCivicExamQuestions } from '../utils/civicExamGeneration';
import { calculateCivicExamScore, isCivicExamPassed } from '../utils/civicExamScoring';
import type {
    CivicExamConfig,
    CivicExamSession,
    CivicExamQuestion,
    CivicExamResult,
    TestAnswer,
} from '../types';
import type { TestQuestion } from '../../types';
import { CIVIC_EXAM_CONFIG } from '../constants/civicExamConstants';
import { loadStoredSession, saveSession, clearStoredSession } from '../utils/civicExamSessionStorage';

const logger = createLogger('CivicExamSessionContext');

interface CivicExamSessionContextType {
    currentSession: CivicExamSession | null;
    isExamActive: boolean;
    currentQuestionIndex: number;

    startExam: (config: CivicExamConfig, allQuestions: readonly TestQuestion[]) => Promise<void>;
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
    allProcessedQuestions: readonly TestQuestion[];
}> = ({ children, allProcessedQuestions }) => {
    const [currentSession, setCurrentSession] = useState<CivicExamSession | null>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

    useEffect(() => {
        loadStoredSession()
            .then(session => {
                if (session) {
                    const actualQuestionCount = session.questions.length;
                    if (session.totalQuestions !== actualQuestionCount) {
                        logger.warn(
                            `Session totalQuestions (${session.totalQuestions}) doesn't match questions.length (${actualQuestionCount}). ` +
                            `Fixing mismatch.`
                        );
                        session = {
                            ...session,
                            totalQuestions: actualQuestionCount,
                        };
                    }
                    setCurrentSession(session);
                    const maxIndex = Math.max(0, actualQuestionCount - 1);
                    const targetIndex = Math.min(session.answers.length, maxIndex);
                    setCurrentQuestionIndex(targetIndex);
                }
            })
            .catch(error => logger.error('Failed to hydrate stored civic exam session', error));
    }, []);

    const startExam = useCallback(async (config: CivicExamConfig, allQuestions: readonly TestQuestion[]): Promise<void> => {
        const questions = generateCivicExamQuestions([...allQuestions], config);

        if (questions.length === 0) {
            throw new Error('No questions available for this exam configuration');
        }

        const questionIds = new Set<number>();
        const duplicateIds: number[] = [];
        questions.forEach(q => {
            const questionId = typeof q.id === 'number' ? q.id : parseInt(String(q.id), 10);
            if (isNaN(questionId)) {
                logger.warn(`Question ${q.id} has invalid ID, skipping duplicate check`);
                return;
            }
            if (questionIds.has(questionId)) {
                duplicateIds.push(questionId);
            } else {
                questionIds.add(questionId);
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

        const actualQuestionCount = questions.length;
        const newSession: CivicExamSession = {
            id: Date.now().toString(),
            mode: config.mode,
            questions,
            answers: [],
            startTime: new Date(),
            isCompleted: false,
            score: 0,
            totalQuestions: actualQuestionCount,
            correctAnswers: 0,
            themes: config.selectedThemes,
            isPracticeMode,
        };

        logger.info(`Created exam session with ${actualQuestionCount} questions`);

        setCurrentSession(newSession);
        setCurrentQuestionIndex(0);
        await saveSession(newSession);
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
            totalQuestions: currentSession.questions.length,
        };

        setCurrentSession(updatedSession);
        await saveSession(updatedSession);

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

        const actualQuestionCount = currentSession.questions.length;
        const correctAnswers = currentSession.answers.filter((answer: TestAnswer) => answer.isCorrect).length;
        const score = calculateCivicExamScore(correctAnswers, actualQuestionCount);
        const passed = isCivicExamPassed(score);

        const endTime = new Date();
        const timeSpent = Math.floor((endTime.getTime() - currentSession.startTime.getTime()) / 1000);

        const finishedSession: CivicExamSession = {
            ...currentSession,
            endTime,
            isCompleted: true,
            score,
            correctAnswers,
            totalQuestions: actualQuestionCount,
        };

        const incorrectQuestionIds = currentSession.answers
            .filter(a => !a.isCorrect)
            .map(a => a.questionId);

        const incorrectQuestions = currentSession.questions.filter(q => {
            const questionId = typeof q.id === 'number' ? q.id : parseInt(String(q.id), 10);
            return !isNaN(questionId) && incorrectQuestionIds.includes(questionId);
        }) as CivicExamQuestion[];

        logger.info(
            `Finished exam: ${correctAnswers}/${actualQuestionCount} correct, ` +
            `score=${score}%, passed=${passed}`
        );

        // Clear persisted active session once finished
        saveSession(null);

        return {
            session: finishedSession,
            passed,
            score,
            correctAnswers,
            totalQuestions: actualQuestionCount,
            incorrectQuestions,
            timeSpent,
        };
    }, [currentSession]);

    const cancelExam = useCallback(() => {
        setCurrentSession(null);
        setCurrentQuestionIndex(0);
        clearStoredSession();
    }, []);

    const getCurrentQuestion = useCallback((): CivicExamQuestion | null => {
        if (!currentSession || currentSession.questions.length === 0) {
            return null;
        }
        
        const actualQuestionCount = currentSession.questions.length;
        if (currentSession.totalQuestions !== actualQuestionCount) {
            logger.warn(
                `Session inconsistency: totalQuestions=${currentSession.totalQuestions}, ` +
                `questions.length=${actualQuestionCount}. Using questions.length as source of truth.`
            );
        }
        
        if (currentQuestionIndex < 0 || currentQuestionIndex >= actualQuestionCount) {
            logger.warn(
                `Invalid question index: ${currentQuestionIndex}, questions length: ${actualQuestionCount}, ` +
                `totalQuestions: ${currentSession.totalQuestions}. Resetting to valid index.`
            );
            const validIndex = Math.max(0, Math.min(currentQuestionIndex, actualQuestionCount - 1));
            setCurrentQuestionIndex(validIndex);
            return currentSession.questions[validIndex] as CivicExamQuestion;
        }
        
        const question = currentSession.questions[currentQuestionIndex];
        if (!question) {
            logger.error(
                `Question is null at index ${currentQuestionIndex}, ` +
                `questions.length=${actualQuestionCount}, totalQuestions=${currentSession.totalQuestions}`
            );
            return null;
        }
        
        const questionWithOptions = question as CivicExamQuestion & { options?: string[] };
        if (currentSession.isPracticeMode) {
            const hasOptions = 'options' in questionWithOptions && 
                              Array.isArray(questionWithOptions.options) && 
                              questionWithOptions.options.length > 0;
            if (!hasOptions) {
                logger.warn(
                    `Question at index ${currentQuestionIndex} (ID: ${question.id}) has no options in practice mode. ` +
                    `Options: ${JSON.stringify(questionWithOptions.options)}, ` +
                    `Question type: ${'questionType' in question ? question.questionType : 'unknown'}`
                );
            }
        }
        
        return question as CivicExamQuestion;
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


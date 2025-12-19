import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo, useRef } from 'react';
import { createLogger } from '../../shared/utils/logger';
import { useData } from '../../shared/contexts/DataContext';
import { processAllQuestions } from '../../test/utils/testDataUtils';
import { generateCivicExamQuestions } from '../utils/civicExamGeneration';
import { calculateCivicExamScore, isCivicExamPassed } from '../utils/civicExamScoring';
import {
    loadAllCivicExamData,
    saveCivicExamData,
    resetCivicExamData,
    DEFAULT_CIVIC_EXAM_PROGRESS,
    DEFAULT_CIVIC_EXAM_STATISTICS,
} from '../utils/civicExamStorage';
import { loadCivicExamQuestions } from '../utils/civicExamDataLoader';
import {
    updateThemePerformance,
    updateExamStatistics,
    calculateProgressUpdates,
} from '../utils/civicExamHelpers';
import {
    createDefaultCivicExamProgress,
    createDefaultCivicExamStatistics,
} from '../utils/civicExamDefaults';
import type {
    CivicExamConfig,
    CivicExamSession,
    CivicExamQuestion,
    CivicExamProgress,
    CivicExamStatistics,
    CivicExamResult,
} from '../types';
import type { TestAnswer } from '../../test/types';
import { CIVIC_EXAM_CONFIG } from '../constants/civicExamConstants';

const logger = createLogger('CivicExamContext');

interface CivicExamContextType {
    // Current exam session
    currentSession: CivicExamSession | null;
    isExamActive: boolean;
    currentQuestionIndex: number;

    // Progress and statistics
    examProgress: CivicExamProgress;
    examStatistics: CivicExamStatistics;

    // Exam management
    startExam: (config: CivicExamConfig) => Promise<void>;
    submitAnswer: (answer: TestAnswer, autoAdvance?: boolean) => Promise<void>;
    goToNextQuestion: () => void;
    finishExam: () => Promise<CivicExamResult>;
    cancelExam: () => void;

    // Question management
    getCurrentQuestion: () => CivicExamQuestion | null;
    getNextQuestion: () => CivicExamQuestion | null;
    getPreviousQuestion: () => CivicExamQuestion | null;
    getIncorrectQuestions: () => CivicExamQuestion[];

    // Progress tracking
    refreshProgress: () => Promise<void>;
    resetProgress: () => Promise<void>;
    isLoading: boolean;
}

const CivicExamContext = createContext<CivicExamContextType | undefined>(undefined);

export const CivicExamProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { questionsData, historySubcategories } = useData();

    // State management
    const [currentSession, setCurrentSession] = useState<CivicExamSession | null>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [examProgress, setExamProgress] = useState<CivicExamProgress>(DEFAULT_CIVIC_EXAM_PROGRESS);
    const [examStatistics, setExamStatistics] = useState<CivicExamStatistics>(DEFAULT_CIVIC_EXAM_STATISTICS);
    const [isLoading, setIsLoading] = useState(true);

    // Memory leak prevention
    const isMountedRef = useRef(true);

    // Memoized question collections to avoid reprocessing
    const [civicQuestions, setCivicQuestions] = useState<ReturnType<typeof processAllQuestions>>([]);

    useEffect(() => {
        loadCivicExamQuestions().then(setCivicQuestions).catch(() => {
            logger.warn('Could not load civic exam questions');
        });
    }, []);

    const allProcessedQuestions = useMemo(() => {
        const regularQuestions = processAllQuestions(questionsData, historySubcategories);
        return [...regularQuestions, ...civicQuestions];
    }, [questionsData, historySubcategories, civicQuestions]);

    // Load data on mount with cleanup
    useEffect(() => {
        isMountedRef.current = true;

        const loadData = async () => {
            if (isMountedRef.current) {
                await loadExamData();
            }
        };

        loadData();

        return () => {
            isMountedRef.current = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadExamData = useCallback(async () => {
        if (!isMountedRef.current) return;

        try {
            setIsLoading(true);
            const { progress, statistics } = await loadAllCivicExamData();

            if (isMountedRef.current) {
                setExamProgress(progress);
                setExamStatistics(statistics);
            }
        } catch (error) {
            logger.error('Error loading civic exam data:', error);
        } finally {
            if (isMountedRef.current) {
                setIsLoading(false);
            }
        }
    }, []);

    const startExam = useCallback(async (config: CivicExamConfig): Promise<void> => {
        const questions = generateCivicExamQuestions(allProcessedQuestions, config);

        if (questions.length === 0) {
            throw new Error('No questions available for this exam configuration');
        }

        // Validate uniqueness of questions
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

        // In exam mode, we must have exactly 40 questions
        if (!isPracticeMode && questions.length !== CIVIC_EXAM_CONFIG.TOTAL_QUESTIONS) {
            throw new Error(
                `Cannot start exam: Expected ${CIVIC_EXAM_CONFIG.TOTAL_QUESTIONS} questions, but only ${questions.length} are available. Please ensure all themes have sufficient questions.`
            );
        }

        // In practice mode, allow fewer than 40 questions if needed

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
    }, [allProcessedQuestions]);

    const submitAnswer = useCallback(async (answer: TestAnswer, autoAdvance: boolean = true): Promise<void> => {
        if (!currentSession) {
            throw new Error('No active exam session');
        }

        const currentQuestion = currentSession.questions[currentQuestionIndex];
        if (!currentQuestion) {
            throw new Error(`No current question found at index: ${currentQuestionIndex}`);
        }

        // Strict validation
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

        // Move to next question only if autoAdvance is true (exam mode)
        // In practice mode, we show feedback first, then user clicks next
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

    const finishExam = useCallback(async (): Promise<CivicExamResult> => {
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

        const updatedProgress = calculateProgressUpdates(
            finishedSession,
            examProgress,
            score,
            correctAnswers
        );

        const updatedStatistics = updateExamStatistics(finishedSession, examStatistics, updatedProgress);

        // Update state
        setExamProgress(updatedProgress);
        setExamStatistics(updatedStatistics);
        setCurrentSession(null);
        setCurrentQuestionIndex(0);

        // Save to storage
        await saveCivicExamData(updatedProgress, updatedStatistics);

        return {
            session: finishedSession,
            statistics: updatedStatistics,
            passed,
            score,
            correctAnswers,
            totalQuestions: finishedSession.totalQuestions,
            incorrectQuestions,
            timeSpent,
        };
    }, [currentSession, examProgress, examStatistics]);

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

    const getIncorrectQuestions = useCallback((): CivicExamQuestion[] => {
        if (examProgress.incorrectQuestions.length === 0) {
            return [];
        }

        return allProcessedQuestions
            .filter(q => examProgress.incorrectQuestions.includes(q.id))
            .map(q => ({
                ...q,
                theme: 'principles_values' as const,
                subTheme: 'devise_symboles' as const,
                questionType: 'knowledge' as const,
            })) as CivicExamQuestion[];
    }, [allProcessedQuestions, examProgress.incorrectQuestions]);

    const refreshProgress = useCallback(async (): Promise<void> => {
        if (isMountedRef.current) {
            await loadExamData();
        }
    }, [loadExamData]);

    const resetProgress = useCallback(async (): Promise<void> => {
        if (!isMountedRef.current) {
            return;
        }

        try {
            await resetCivicExamData();

            if (isMountedRef.current) {
                const freshProgress = createDefaultCivicExamProgress();
                const freshStats = createDefaultCivicExamStatistics();

                setExamProgress(freshProgress);
                setExamStatistics(freshStats);
            }
        } catch (error) {
            logger.error('Error resetting progress:', error);
            if (isMountedRef.current) {
                const errorProgress = createDefaultCivicExamProgress();
                const errorStats = createDefaultCivicExamStatistics();

                setExamProgress(errorProgress);
                setExamStatistics(errorStats);
            }
            throw error;
        }
    }, []);


    // Memoize context value to prevent unnecessary re-renders
    const contextValue = useMemo((): CivicExamContextType => ({
        currentSession,
        isExamActive: currentSession !== null,
        currentQuestionIndex,
        examProgress,
        examStatistics,
        startExam,
        submitAnswer,
        goToNextQuestion,
        finishExam,
        cancelExam,
        getCurrentQuestion,
        getNextQuestion,
        getPreviousQuestion,
        getIncorrectQuestions,
        refreshProgress,
        resetProgress,
        isLoading,
    }), [
        currentSession,
        currentQuestionIndex,
        examProgress,
        examStatistics,
        startExam,
        submitAnswer,
        goToNextQuestion,
        finishExam,
        cancelExam,
        getCurrentQuestion,
        getNextQuestion,
        getPreviousQuestion,
        getIncorrectQuestions,
        refreshProgress,
        resetProgress,
        isLoading,
    ]);

    return (
        <CivicExamContext.Provider value={contextValue}>
            {children}
        </CivicExamContext.Provider>
    );
};

export const useCivicExam = (): CivicExamContextType => {
    const context = useContext(CivicExamContext);
    if (!context) {
        throw new Error('useCivicExam must be used within a CivicExamProvider');
    }
    return context;
};


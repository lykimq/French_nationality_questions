import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo, useRef } from 'react';
import { useLanguage } from '../../shared/contexts/LanguageContext';
import { processAllQuestions } from '../../test/utils/testDataUtils';
import { generateCivicExamQuestions } from '../utils/civicExamGeneration';
import { calculateCivicExamScore, isCivicExamPassed } from '../utils/civicExamScoring';
import {
    loadAllCivicExamData,
    saveCivicExamData,
    DEFAULT_CIVIC_EXAM_PROGRESS,
    DEFAULT_CIVIC_EXAM_STATISTICS,
} from '../utils/civicExamStorage';
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
    isLoading: boolean;
}

const CivicExamContext = createContext<CivicExamContextType | undefined>(undefined);

export const CivicExamProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { questionsData, historySubcategories } = useLanguage();

    // State management
    const [currentSession, setCurrentSession] = useState<CivicExamSession | null>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [examProgress, setExamProgress] = useState<CivicExamProgress>(DEFAULT_CIVIC_EXAM_PROGRESS);
    const [examStatistics, setExamStatistics] = useState<CivicExamStatistics>(DEFAULT_CIVIC_EXAM_STATISTICS);
    const [isLoading, setIsLoading] = useState(true);

    // Memory leak prevention
    const isMountedRef = useRef(true);

    // Memoized question collections to avoid reprocessing
    const allProcessedQuestions = useMemo(() => {
        const regularQuestions = processAllQuestions(questionsData, historySubcategories);
        
        // Load civic exam questions from JSON file
        // Note: In production, this should be loaded from Firebase Storage
        // For now, we'll merge them with regular questions
        try {
            // Import civic exam questions
            const civicExamData = require('../data/civic_exam_questions.json');
            if (civicExamData?.questions) {
                const civicQuestions = civicExamData.questions.map((q: any) => ({
                    id: q.id,
                    question: q.question,
                    question_vi: q.question_vi,
                    explanation: q.explanation,
                    explanation_vi: q.explanation_vi,
                    image: q.image,
                    categoryId: 'civic_exam',
                    categoryTitle: 'Examen Civique',
                    theme: q.theme,
                    subTheme: q.subTheme,
                    questionType: q.questionType,
                    options: q.options || [],
                    correctAnswer: q.correctAnswer,
                    explanationOptions: q.explanationOptions || [],
                    correctExplanationAnswer: q.correctExplanationAnswer,
                }));
                return [...regularQuestions, ...civicQuestions];
            }
        } catch (error) {
            console.warn('Could not load civic exam questions:', error);
        }
        
        return regularQuestions;
    }, [questionsData, historySubcategories]);

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
    }, []);

    // Cleanup effect to prevent memory leaks
    useEffect(() => {
        return () => {
            isMountedRef.current = false;
        };
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
            console.error('❌ Error loading civic exam data:', error);
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

        if (questions.length !== CIVIC_EXAM_CONFIG.TOTAL_QUESTIONS) {
            console.warn(`Expected ${CIVIC_EXAM_CONFIG.TOTAL_QUESTIONS} questions, got ${questions.length}`);
        }

        const isPracticeMode = config.mode === 'civic_exam_practice';

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

        // Get incorrect questions
        const incorrectQuestionIds = currentSession.answers
            .filter(a => !a.isCorrect)
            .map(a => a.questionId);
        
        const incorrectQuestions = currentSession.questions.filter(q =>
            incorrectQuestionIds.includes(q.id)
        ) as CivicExamQuestion[];

        // Update progress
        const isPracticeMode = currentSession.isPracticeMode;
        const newTotalExams = isPracticeMode
            ? examProgress.totalPracticeSessions + 1
            : examProgress.totalExamsTaken + 1;

        const updatedProgress: CivicExamProgress = {
            ...examProgress,
            totalExamsTaken: isPracticeMode ? examProgress.totalExamsTaken : newTotalExams,
            totalPracticeSessions: isPracticeMode ? newTotalExams : examProgress.totalPracticeSessions,
            questionsAnswered: examProgress.questionsAnswered + finishedSession.totalQuestions,
            correctAnswersTotal: examProgress.correctAnswersTotal + correctAnswers,
            averageScore: Math.round(
                ((examProgress.averageScore * (examProgress.totalExamsTaken + examProgress.totalPracticeSessions)) + score) / 
                (examProgress.totalExamsTaken + examProgress.totalPracticeSessions + 1)
            ),
            bestScore: Math.max(examProgress.bestScore, score),
            passedExams: isPracticeMode ? examProgress.passedExams : (passed ? examProgress.passedExams + 1 : examProgress.passedExams),
            failedExams: isPracticeMode ? examProgress.failedExams : (passed ? examProgress.failedExams : examProgress.failedExams + 1),
            recentScores: [...examProgress.recentScores.slice(-9), score],
            incorrectQuestions: [...examProgress.incorrectQuestions, ...incorrectQuestionIds].slice(-100),
            themePerformance: updateThemePerformance(
                finishedSession,
                examProgress.themePerformance
            ),
        };

        // Update statistics
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

    // Helper function to update theme performance
    const updateThemePerformance = (
        session: CivicExamSession,
        currentThemePerformance: CivicExamProgress['themePerformance']
    ): CivicExamProgress['themePerformance'] => {
        const updated = { ...currentThemePerformance };

        session.questions.forEach((question) => {
            const answer = session.answers.find(a => a.questionId === question.id);
            if (!answer) return;

            const theme = (question as CivicExamQuestion).theme;
            if (!theme) return;

            if (!updated[theme]) {
                updated[theme] = { questionsAttempted: 0, correctAnswers: 0, accuracy: 0 };
            }

            updated[theme].questionsAttempted += 1;
            if (answer.isCorrect) {
                updated[theme].correctAnswers += 1;
            }
            updated[theme].accuracy = Math.round(
                (updated[theme].correctAnswers / updated[theme].questionsAttempted) * 100
            );
        });

        return updated;
    };

    // Helper function to update statistics
    const updateExamStatistics = (
        session: CivicExamSession,
        currentStatistics: CivicExamStatistics,
        updatedProgress: CivicExamProgress
    ): CivicExamStatistics => {
        const updated = { ...currentStatistics };

        // Update theme breakdown
        updated.themeBreakdown = { ...updatedProgress.themePerformance };

        // Update time statistics
        const allTimes = session.answers.map(a => a.timeSpent).filter(time => time > 0);
        if (allTimes.length > 0) {
            const avgTime = allTimes.reduce((sum, time) => sum + time, 0) / allTimes.length;
            updated.timeStats.averageTimePerQuestion = Math.round(avgTime);
            updated.timeStats.fastestTime = Math.min(updated.timeStats.fastestTime, ...allTimes);
            updated.timeStats.slowestTime = Math.max(updated.timeStats.slowestTime, ...allTimes);
        }

        return updated;
    };

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


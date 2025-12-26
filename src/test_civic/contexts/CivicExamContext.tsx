import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { createLogger } from '../../shared/utils/logger';
import { useData } from '../../shared/contexts/DataContext';
import { processAllQuestions } from '../../shared/utils/questionUtils';
import { loadCivicExamQuestions } from '../utils/civicExamDataLoader';
import { CivicExamSessionProvider, useCivicExamSession } from './CivicExamSessionContext';
import { CivicExamProgressProvider, useCivicExamProgress } from './CivicExamProgressContext';
import type {
    CivicExamConfig,
    CivicExamQuestion,
    CivicExamResult,
    CivicExamSession,
    CivicExamProgress,
    CivicExamStatistics,
    TestAnswer,
} from '../types';
import type { CivicExamQuestionWithOptions } from '../utils/civicExamQuestionUtils';
import type { TestQuestion } from '../../types';

const logger = createLogger('CivicExamContext');

interface CivicExamContextType {
    currentSession: CivicExamSession | null;
    isExamActive: boolean;
    currentQuestionIndex: number;
    pausedSession: CivicExamSession | null;
    examProgress: CivicExamProgress;
    examStatistics: CivicExamStatistics;
    startExam: (config: CivicExamConfig) => Promise<void>;
    resumeSession: () => Promise<void>;
    submitAnswer: (answer: TestAnswer, autoAdvance?: boolean) => Promise<void>;
    goToNextQuestion: () => void;
    finishExam: () => Promise<CivicExamResult>;
    cancelExam: () => void;
    getCurrentQuestion: () => CivicExamQuestion | null;
    getNextQuestion: () => CivicExamQuestion | null;
    getPreviousQuestion: () => CivicExamQuestion | null;
    getIncorrectQuestions: () => CivicExamQuestion[];
    refreshProgress: () => Promise<void>;
    resetProgress: () => Promise<void>;
    isLoading: boolean;
}

const CivicExamContext = createContext<CivicExamContextType | undefined>(undefined);

const CivicExamContextInternal: React.FC<{ 
    children: ReactNode;
    allProcessedQuestions: ReturnType<typeof processAllQuestions>;
}> = ({ children, allProcessedQuestions }) => {
    const sessionContext = useCivicExamSession();
    const progressContext = useCivicExamProgress();

    const startExam = useCallback(async (config: CivicExamConfig): Promise<void> => {
        await sessionContext.startExam(config, allProcessedQuestions);
    }, [sessionContext, allProcessedQuestions]);

    const finishExam = useCallback(async (): Promise<CivicExamResult> => {
        const result = sessionContext.finishExam();
        if (sessionContext.currentSession) {
            return await progressContext.updateProgressFromSession(sessionContext.currentSession, result);
        }
        throw new Error('Cannot finish exam: no active session');
    }, [sessionContext, progressContext]);

    const getIncorrectQuestions = useCallback((): CivicExamQuestion[] => {
        return progressContext.getIncorrectQuestions(allProcessedQuestions);
    }, [progressContext, allProcessedQuestions]);

    const resumeSession = useCallback(async (): Promise<void> => {
        await sessionContext.resumeSession();
    }, [sessionContext]);

    const contextValue = useMemo((): CivicExamContextType => ({
        currentSession: sessionContext.currentSession,
        isExamActive: sessionContext.isExamActive,
        currentQuestionIndex: sessionContext.currentQuestionIndex,
        pausedSession: sessionContext.pausedSession,
        examProgress: progressContext.examProgress,
        examStatistics: progressContext.examStatistics,
        startExam,
        resumeSession,
        submitAnswer: sessionContext.submitAnswer,
        goToNextQuestion: sessionContext.goToNextQuestion,
        finishExam,
        cancelExam: sessionContext.cancelExam,
        getCurrentQuestion: sessionContext.getCurrentQuestion,
        getNextQuestion: sessionContext.getNextQuestion,
        getPreviousQuestion: sessionContext.getPreviousQuestion,
        getIncorrectQuestions,
        refreshProgress: progressContext.refreshProgress,
        resetProgress: progressContext.resetProgress,
        isLoading: progressContext.isLoading,
    }), [
        sessionContext,
        progressContext,
        startExam,
        resumeSession,
        finishExam,
        getIncorrectQuestions,
    ]);

    return (
        <CivicExamContext.Provider value={contextValue}>
            {children}
        </CivicExamContext.Provider>
    );
};

export const CivicExamProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [civicQuestions, setCivicQuestions] = useState<CivicExamQuestionWithOptions[]>([]);

    useEffect(() => {
        loadCivicExamQuestions().then(setCivicQuestions).catch((error) => {
            logger.warn('Could not load civic exam questions:', error);
            setCivicQuestions([]);
        });
    }, []);

    const allProcessedQuestions = useMemo(() => {
        return civicQuestions as TestQuestion[];
    }, [civicQuestions]);

    return (
        <CivicExamProgressProvider>
            <CivicExamSessionProvider allProcessedQuestions={allProcessedQuestions}>
                <CivicExamContextInternal allProcessedQuestions={allProcessedQuestions}>
                    {children}
                </CivicExamContextInternal>
            </CivicExamSessionProvider>
        </CivicExamProgressProvider>
    );
};

export const useCivicExam = (): CivicExamContextType => {
    const context = useContext(CivicExamContext);
    if (!context) {
        throw new Error('useCivicExam must be used within a CivicExamProvider');
    }
    return context;
};

import type { CivicExamSession, CivicExamProgress, CivicExamStatistics, CivicExamQuestion } from '../types';
import type { TestAnswer } from '../types';
import { DEFAULT_THEME_PERFORMANCE } from './civicExamDefaults';

export const updateThemePerformance = (
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
            updated[theme] = { ...DEFAULT_THEME_PERFORMANCE[theme] };
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

export const updateExamStatistics = (
    session: CivicExamSession,
    currentStatistics: CivicExamStatistics,
    updatedProgress: CivicExamProgress
): CivicExamStatistics => {
    const updated = { ...currentStatistics };

    updated.themeBreakdown = { ...updatedProgress.themePerformance };

    const allTimes = session.answers
        .map(a => a.timeSpent)
        .filter(time => time > 0);
    
    if (allTimes.length > 0) {
        const avgTime = allTimes.reduce((sum, time) => sum + time, 0) / allTimes.length;
        updated.timeStats.averageTimePerQuestion = Math.round(avgTime);
        updated.timeStats.fastestTime = Math.min(updated.timeStats.fastestTime, ...allTimes);
        updated.timeStats.slowestTime = Math.max(updated.timeStats.slowestTime, ...allTimes);
    }

    return updated;
};

export const calculateProgressUpdates = (
    session: CivicExamSession,
    currentProgress: CivicExamProgress,
    score: number,
    correctAnswers: number
): CivicExamProgress => {
    const isPracticeMode = session.isPracticeMode;
    const passed = score >= 80;

    const newTotalExams = isPracticeMode
        ? currentProgress.totalPracticeSessions + 1
        : currentProgress.totalExamsTaken + 1;

    const shouldUpdatePassFailStats = !isPracticeMode;
    const newPassedExams = shouldUpdatePassFailStats && passed
        ? currentProgress.passedExams + 1
        : currentProgress.passedExams;
    const newFailedExams = shouldUpdatePassFailStats && !passed
        ? currentProgress.failedExams + 1
        : currentProgress.failedExams;

    const newTotalExamsTaken = isPracticeMode ? currentProgress.totalExamsTaken : newTotalExams;
    const newTotalPracticeSessions = isPracticeMode ? newTotalExams : currentProgress.totalPracticeSessions;
    const newTotalSessions = newTotalExamsTaken + newTotalPracticeSessions;

    const incorrectQuestionIds = session.answers
        .filter(a => !a.isCorrect)
        .map(a => a.questionId);

    return {
        ...currentProgress,
        totalExamsTaken: newTotalExamsTaken,
        totalPracticeSessions: newTotalPracticeSessions,
        questionsAnswered: currentProgress.questionsAnswered + session.totalQuestions,
        correctAnswersTotal: currentProgress.correctAnswersTotal + correctAnswers,
        averageScore: newTotalSessions > 0
            ? Math.round(((currentProgress.averageScore * (newTotalSessions - 1)) + score) / newTotalSessions)
            : score,
        bestScore: Math.max(currentProgress.bestScore, score),
        passedExams: newPassedExams,
        failedExams: newFailedExams,
        recentScores: [...currentProgress.recentScores.slice(-9), score],
        incorrectQuestions: [...currentProgress.incorrectQuestions, ...incorrectQuestionIds].slice(-100),
        themePerformance: updateThemePerformance(session, currentProgress.themePerformance),
    };
};


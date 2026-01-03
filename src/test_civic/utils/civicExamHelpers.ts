import type { CivicExamSession, CivicExamProgress, CivicExamStatistics, CivicExamQuestion } from '../types';
import type { TestAnswer } from '../types';
import { DEFAULT_TOPIC_PERFORMANCE } from './civicExamDefaults';

export const updateTopicPerformance = (
    session: CivicExamSession,
    currentTopicPerformance: CivicExamProgress['topicPerformance']
): CivicExamProgress['topicPerformance'] => {
    const updated = { ...currentTopicPerformance };

    session.questions.forEach((question) => {
        const answer = session.answers.find(a => a.questionId === question.id);
        if (!answer) return;

        const topic = (question as CivicExamQuestion).topic;
        if (!topic) return;

        if (!updated[topic]) {
            updated[topic] = { ...DEFAULT_TOPIC_PERFORMANCE[topic] };
        }

        updated[topic].questionsAttempted += 1;
        if (answer.isCorrect) {
            updated[topic].correctAnswers += 1;
        }
        updated[topic].accuracy = Math.round(
            (updated[topic].correctAnswers / updated[topic].questionsAttempted) * 100
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

    updated.topicBreakdown = { ...updatedProgress.topicPerformance };

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
        topicPerformance: updateTopicPerformance(session, currentProgress.topicPerformance),
    };
};


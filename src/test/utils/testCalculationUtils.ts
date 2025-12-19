import { MEMORY_LIMITS, PERFORMANCE_THRESHOLDS } from '../constants/testConstants';
import { safeAverage, applyMemoryLimits } from './testDataUtils';
import type {
    TestSession,
    TestProgress,
    TestStatistics,
    TestRecommendation,
    ImprovementTrend
} from '../types';

export const calculateUpdatedProgress = (
    finishedSession: TestSession,
    currentProgress: TestProgress,
    score: number,
    correctAnswers: number
): TestProgress => {
    const newTotalTests = currentProgress.totalTestsTaken + 1;

    return {
        ...currentProgress,
        totalTestsTaken: newTotalTests,
        questionsAnswered: currentProgress.questionsAnswered + finishedSession.totalQuestions,
        correctAnswersTotal: currentProgress.correctAnswersTotal + correctAnswers,
        averageScore: Math.round(
            ((currentProgress.averageScore * currentProgress.totalTestsTaken) + score) / newTotalTests
        ),
        bestScore: Math.max(currentProgress.bestScore, score),
        recentScores: applyMemoryLimits(
            [...currentProgress.recentScores, score],
            MEMORY_LIMITS.MAX_RECENT_SCORES
        ),
        incorrectQuestions: applyMemoryLimits(
            [
                ...currentProgress.incorrectQuestions,
                ...finishedSession.answers
                    .filter(a => !a.isCorrect)
                    .map(a => a.questionId)
            ],
            MEMORY_LIMITS.MAX_INCORRECT_QUESTIONS
        ),
        weakCategories: [],
        strongCategories: [],
    };
};

export const updateTestStatistics = (
    session: TestSession,
    currentStatistics: TestStatistics,
    updatedProgress: TestProgress
): TestStatistics => {
    const newStatistics = { ...currentStatistics };

    session.questions.forEach((question) => {
        const answer = session.answers.find(a => a.questionId === question.id);
        if (!answer) return;

        if (!newStatistics.categoryPerformance[question.categoryId]) {
            newStatistics.categoryPerformance[question.categoryId] = {
                categoryId: question.categoryId,
                categoryTitle: question.categoryTitle,
                questionsAttempted: 0,
                correctAnswers: 0,
                accuracy: 0,
                averageTime: 0,
            };
        }

        const catPerf = newStatistics.categoryPerformance[question.categoryId];
        catPerf.questionsAttempted += 1;
        if (answer.isCorrect) catPerf.correctAnswers += 1;
        catPerf.accuracy = Math.round((catPerf.correctAnswers / catPerf.questionsAttempted) * 100);
        catPerf.averageTime = Math.round(
            safeAverage([...Array(catPerf.questionsAttempted - 1).fill(catPerf.averageTime), answer.timeSpent])
        );
        catPerf.lastAttempted = new Date();
    });

    const allTimes = session.answers.map(a => a.timeSpent).filter(time => time > 0);
    if (allTimes.length > 0) {
        newStatistics.timeStats.averageTimePerQuestion = Math.round(safeAverage(allTimes));
        newStatistics.timeStats.fastestTime = Math.min(newStatistics.timeStats.fastestTime, ...allTimes);
        newStatistics.timeStats.slowestTime = Math.max(newStatistics.timeStats.slowestTime, ...allTimes);
    }

    session.answers.forEach(answer => {
        if (answer.isCorrect) {
            if (!newStatistics.masteredQuestions.includes(answer.questionId)) {
                newStatistics.masteredQuestions.push(answer.questionId);
            }
            const strugglingIndex = newStatistics.strugglingQuestions.indexOf(answer.questionId);
            if (strugglingIndex > -1) {
                newStatistics.strugglingQuestions.splice(strugglingIndex, 1);
            }
        } else {
            if (!newStatistics.strugglingQuestions.includes(answer.questionId)) {
                newStatistics.strugglingQuestions.push(answer.questionId);
            }
            const masteredIndex = newStatistics.masteredQuestions.indexOf(answer.questionId);
            if (masteredIndex > -1) {
                newStatistics.masteredQuestions.splice(masteredIndex, 1);
            }
        }
    });

    newStatistics.masteredQuestions = applyMemoryLimits(
        newStatistics.masteredQuestions,
        MEMORY_LIMITS.MAX_MASTERED_QUESTIONS
    );
    newStatistics.strugglingQuestions = applyMemoryLimits(
        newStatistics.strugglingQuestions,
        MEMORY_LIMITS.MAX_STRUGGLING_QUESTIONS
    );

    newStatistics.improvementTrend = calculateImprovementTrend(updatedProgress.recentScores);

    return newStatistics;
};

export const calculateImprovementTrend = (recentScores: number[]): ImprovementTrend => {
    if (recentScores.length < 3) return 'stable';

    const recentAvg = safeAverage(recentScores.slice(-3));

    if (recentScores.length >= 6) {
        const olderAvg = safeAverage(recentScores.slice(-6, -3));
        const difference = recentAvg - olderAvg;

        if (difference > PERFORMANCE_THRESHOLDS.IMPROVEMENT_THRESHOLD) return 'improving';
        if (difference < -PERFORMANCE_THRESHOLDS.IMPROVEMENT_THRESHOLD) return 'declining';
    }

    return 'stable';
};

export const updateWeakStrongCategories = (
    statistics: TestStatistics
): { weakCategories: string[]; strongCategories: string[] } => {
    const weakCategories = Object.entries(statistics.categoryPerformance)
        .filter(([_, perf]) => (perf.accuracy || 0) < PERFORMANCE_THRESHOLDS.WEAK_CATEGORY)
        .map(([catId, _]) => catId);

    const strongCategories = Object.entries(statistics.categoryPerformance)
        .filter(([_, perf]) => (perf.accuracy || 0) >= PERFORMANCE_THRESHOLDS.STRONG_CATEGORY)
        .map(([catId, _]) => catId);

    return { weakCategories, strongCategories };
};

export const generateRecommendations = (
    testProgress: TestProgress
): TestRecommendation[] => {
    const recommendations: TestRecommendation[] = [];

    if (testProgress.averageScore >= PERFORMANCE_THRESHOLDS.EXCELLENT) {
        recommendations.push({
            type: 'good_job',
            title: 'Performance Excellente !',
            description: 'Vous performez très bien. Continuez à pratiquer pour maintenir votre niveau.',
            actionText: 'Passer un Entretien Fictif',
        });
    } else if (testProgress.averageScore < PERFORMANCE_THRESHOLDS.WEAK) {
        recommendations.push({
            type: 'practice_more',
            title: 'Besoin de Plus de Pratique',
            description: 'Concentrez-vous sur l\'étude approfondie des matériaux avant de passer plus de tests.',
            actionText: 'Étudier les Catégories',
        });
    }

    if (testProgress.weakCategories.length > 0) {
        recommendations.push({
            type: 'study_category',
            title: 'Se Concentrer sur les Points Faibles',
            description: 'Vous devez vous améliorer dans certaines catégories.',
            actionText: 'Pratiquer les Points Faibles',
            categoryIds: testProgress.weakCategories,
        });
    }

    if (testProgress.incorrectQuestions.length > 0) {
        recommendations.push({
            type: 'review_questions',
            title: 'Réviser les Questions Incorrectes',
            description: 'Révisez les questions auxquelles vous avez répondu incorrectement précédemment.',
            actionText: 'Réviser les Questions',
            questionIds: testProgress.incorrectQuestions.slice(-20),
        });
    }

    return recommendations;
};

export const calculateTestScore = (correctAnswers: number, totalQuestions: number): number => {
    if (totalQuestions === 0) return 0;
    return Math.round((correctAnswers / totalQuestions) * 100);
};
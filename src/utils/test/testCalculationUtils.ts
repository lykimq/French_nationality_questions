import { MEMORY_LIMITS, PERFORMANCE_THRESHOLDS } from '../../constants/testConstants';
import { safeAverage, applyMemoryLimits } from './testDataUtils';
import type {
    TestSession,
    TestProgress,
    TestStatistics,
    TestRecommendation,
    ImprovementTrend
} from '../../types';

// Calculate updated progress after test completion
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
        // These will be updated after statistics calculation
        weakCategories: [],
        strongCategories: [],
    };
};

// Update test statistics after test completion
export const updateTestStatistics = (
    session: TestSession,
    currentStatistics: TestStatistics,
    updatedProgress: TestProgress
): TestStatistics => {
    const newStatistics = { ...currentStatistics };

    // Update category performance
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

    // Update time statistics safely
    const allTimes = session.answers.map(a => a.timeSpent).filter(time => time > 0);
    if (allTimes.length > 0) {
        newStatistics.timeStats.averageTimePerQuestion = Math.round(safeAverage(allTimes));
        newStatistics.timeStats.fastestTime = Math.min(newStatistics.timeStats.fastestTime, ...allTimes);
        newStatistics.timeStats.slowestTime = Math.max(newStatistics.timeStats.slowestTime, ...allTimes);
    }

    // Update mastered/struggling questions with memory limits
    session.answers.forEach(answer => {
        if (answer.isCorrect) {
            if (!newStatistics.masteredQuestions.includes(answer.questionId)) {
                newStatistics.masteredQuestions.push(answer.questionId);
            }
            // Remove from struggling
            const strugglingIndex = newStatistics.strugglingQuestions.indexOf(answer.questionId);
            if (strugglingIndex > -1) {
                newStatistics.strugglingQuestions.splice(strugglingIndex, 1);
            }
        } else {
            if (!newStatistics.strugglingQuestions.includes(answer.questionId)) {
                newStatistics.strugglingQuestions.push(answer.questionId);
            }
            // Remove from mastered
            const masteredIndex = newStatistics.masteredQuestions.indexOf(answer.questionId);
            if (masteredIndex > -1) {
                newStatistics.masteredQuestions.splice(masteredIndex, 1);
            }
        }
    });

    // Apply memory limits to prevent unbounded growth
    newStatistics.masteredQuestions = applyMemoryLimits(
        newStatistics.masteredQuestions,
        MEMORY_LIMITS.MAX_MASTERED_QUESTIONS
    );
    newStatistics.strugglingQuestions = applyMemoryLimits(
        newStatistics.strugglingQuestions,
        MEMORY_LIMITS.MAX_STRUGGLING_QUESTIONS
    );

    // Update improvement trend
    newStatistics.improvementTrend = calculateImprovementTrend(updatedProgress.recentScores);

    return newStatistics;
};

// Calculate improvement trend based on recent scores
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

// Update weak and strong categories based on statistics
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

// Generate test recommendations based on progress
export const generateRecommendations = (
    testProgress: TestProgress
): TestRecommendation[] => {
    const recommendations: TestRecommendation[] = [];

    // Performance-based recommendations
    if (testProgress.averageScore >= PERFORMANCE_THRESHOLDS.EXCELLENT) {
        recommendations.push({
            type: 'good_job',
            title_vi: 'Thành tích xuất sắc!',
            title_fr: 'Performance Excellente !',
            description_vi: 'Bạn đang thể hiện rất tốt. Hãy tiếp tục luyện tập để duy trì trình độ.',
            description_fr: 'Vous performez très bien. Continuez à pratiquer pour maintenir votre niveau.',
            actionText_vi: 'Làm bài phỏng vấn thử',
            actionText_fr: 'Passer un Entretien Fictif',
        });
    } else if (testProgress.averageScore < PERFORMANCE_THRESHOLDS.WEAK) {
        recommendations.push({
            type: 'practice_more',
            title_vi: 'Cần luyện tập thêm',
            title_fr: 'Besoin de Plus de Pratique',
            description_vi: 'Tập trung nghiên cứu tài liệu kỹ hơn trước khi làm thêm bài kiểm tra.',
            description_fr: 'Concentrez-vous sur l\'étude approfondie des matériaux avant de passer plus de tests.',
            actionText_vi: 'Học các chủ đề',
            actionText_fr: 'Étudier les Catégories',
        });
    }

    // Weak categories recommendation
    if (testProgress.weakCategories.length > 0) {
        recommendations.push({
            type: 'study_category',
            title_vi: 'Tập trung vào điểm yếu',
            title_fr: 'Se Concentrer sur les Points Faibles',
            description_vi: 'Bạn cần cải thiện ở một số chủ đề.',
            description_fr: 'Vous devez vous améliorer dans certaines catégories.',
            actionText_vi: 'Luyện tập điểm yếu',
            actionText_fr: 'Pratiquer les Points Faibles',
            categoryIds: testProgress.weakCategories,
        });
    }

    // Review incorrect questions
    if (testProgress.incorrectQuestions.length > 0) {
        recommendations.push({
            type: 'review_questions',
            title_vi: 'Xem lại câu hỏi sai',
            title_fr: 'Réviser les Questions Incorrectes',
            description_vi: 'Xem lại những câu hỏi bạn đã trả lời sai trước đây.',
            description_fr: 'Révisez les questions auxquelles vous avez répondu incorrectement précédemment.',
            actionText_vi: 'Xem lại câu hỏi',
            actionText_fr: 'Réviser les Questions',
            questionIds: testProgress.incorrectQuestions.slice(-20),
        });
    }

    return recommendations;
};

// Calculate test score
export const calculateTestScore = (correctAnswers: number, totalQuestions: number): number => {
    if (totalQuestions === 0) return 0;
    return Math.round((correctAnswers / totalQuestions) * 100);
};
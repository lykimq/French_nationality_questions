/**
 * Utility functions for Spaced Repetition System (SRS) and question mastery tracking.
 * This implements a simplified SM2-like algorithm for optimal learning.
 */

export enum MasteryLevel {
    NEW = 'NEW',
    LEARNING = 'LEARNING',
    REVIEW = 'REVIEW',
    MASTERED = 'MASTERED',
}

export enum PerformanceRating {
    AGAIN = 0, // Did not know it at all
    HARD = 1,  // Struggled to remember
    GOOD = 2,  // Correct, but took some effort
    EASY = 3,  // Instant recall
}

export interface QuestionMastery {
    id: number | string;
    level: MasteryLevel;
    lastReview?: number; // timestamp
    nextReview?: number; // timestamp
    interval: number; // in days
    easeFactor: number; // multiplier for interval
    streak: number;
}

const INITIAL_EASE_FACTOR = 2.5;
const MIN_EASE_FACTOR = 1.3;

/**
 * Calculates the next interval and ease factor based on performance.
 */
export const calculateNextReview = (
    current: QuestionMastery,
    rating: PerformanceRating
): QuestionMastery => {
    let { interval, easeFactor, streak, level } = current;

    // Update Ease Factor based on rating (simplified SM2)
    // easeFactor = easeFactor + (0.1 - (3 - rating) * (0.08 + (3 - rating) * 0.02))
    const easeAdjustment = 0.1 - (3 - rating) * (0.08 + (3 - rating) * 0.02);
    easeFactor = Math.max(MIN_EASE_FACTOR, easeFactor + easeAdjustment);

    if (rating === PerformanceRating.AGAIN) {
        // Lapser: reset interval but keep ease factor (minus a penalty)
        interval = 0; 
        streak = 0;
        level = MasteryLevel.LEARNING;
        easeFactor = Math.max(MIN_EASE_FACTOR, easeFactor - 0.2);
    } else {
        streak += 1;
        
        // Calculate new interval based on rating
        if (interval === 0) {
            // New or lapsed question
            if (rating === PerformanceRating.HARD) interval = 1;
            else if (rating === PerformanceRating.GOOD) interval = 2;
            else if (rating === PerformanceRating.EASY) interval = 4;
        } else {
            // Review session
            const multi = rating === PerformanceRating.HARD ? 1.2 : 
                          rating === PerformanceRating.GOOD ? easeFactor :
                          easeFactor * 1.3; // Easy bonus
            interval = Math.max(interval + 1, Math.round(interval * multi));
        }

        // Determine level based on interval
        if (interval >= 21) {
            level = MasteryLevel.MASTERED;
        } else if (interval >= 7) {
            level = MasteryLevel.REVIEW;
        } else {
            level = MasteryLevel.LEARNING;
        }
    }

    const now = Date.now();
    const nextReview = now + interval * 24 * 60 * 60 * 1000;

    return {
        ...current,
        level,
        lastReview: now,
        nextReview: interval === 0 ? undefined : nextReview,
        interval,
        easeFactor,
        streak,
    };
};

/**
 * Predicts the next review interval without updating the state.
 * Returns a formatted string (e.g. "<10m", "2j", "1m").
 */
export const predictNextReview = (
    current: QuestionMastery,
    rating: PerformanceRating
): string => {
    const next = calculateNextReview(current, rating);
    const interval = next.interval;
    
    if (interval === 0) return '<10m';
    if (interval < 30) return `${interval}j`;
    
    const months = Math.floor(interval / 30);
    if (months < 12) return `${months}m`;
    
    return `${Math.floor(months / 12)}a`;
};

/**
 * Resolves stored mastery for a question id. Keys match AsyncStorage (string keys, e.g. "livret_12").
 */
export const getMasteryForQuestionId = (
    masteryMap: Record<number, QuestionMastery>,
    rawId: number | string
): QuestionMastery | undefined => {
    const map = masteryMap as unknown as Record<string, QuestionMastery | undefined>;
    return map[String(rawId)];
};

/**
 * Initial mastery state for a new question.
 */
export const createInitialMastery = (questionId: number | string): QuestionMastery => ({
    id: questionId,
    level: MasteryLevel.NEW,
    interval: 0,
    easeFactor: INITIAL_EASE_FACTOR,
    streak: 0,
});

/**
 * Prioritizes questions for a review session.
 */
export const prioritizeQuestions = (
    questions: { id: number | string }[],
    masteryMap: Record<number, QuestionMastery>
): (number | string)[] => {
    const now = Date.now();
    
    return questions
        .map(q => {
            const mastery = getMasteryForQuestionId(masteryMap, q.id) ?? createInitialMastery(q.id);
            let priority = 0;

            if (mastery.level === MasteryLevel.NEW) {
                priority = 50; // New questions have baseline priority
            } else if (mastery.nextReview && mastery.nextReview <= now) {
                // Overdue questions: priority increases with how overdue they are
                const overdueDays = (now - mastery.nextReview) / (24 * 60 * 60 * 1000);
                priority = 100 + overdueDays * 10;
            } else if (mastery.level === MasteryLevel.LEARNING) {
                priority = 80; // Currently learning, keep it fresh
            }

            return { id: q.id, priority };
        })
        .sort((a, b) => b.priority - a.priority)
        .map(item => item.id);
};

/**
 * Calculates mastery statistics for a given set of questions.
 */
export const getCategoryMasteryStats = (
    questions: readonly { id: number | string }[],
    masteryMap: Record<number, QuestionMastery>
) => {
    const total = questions.length;
    if (total === 0) return { total: 0, mastered: 0, learning: 0, newCount: 0, percentage: 0 };

    let mastered = 0;
    let learning = 0;
    let reviewCount = 0;
    let newCount = 0;

    questions.forEach(q => {
        const mastery = getMasteryForQuestionId(masteryMap, q.id);
        
        if (!mastery || mastery.level === MasteryLevel.NEW) {
            newCount++;
        } else if (mastery.level === MasteryLevel.MASTERED) {
            mastered++;
        } else if (mastery.level === MasteryLevel.REVIEW) {
            reviewCount++;
        } else {
            learning++;
        }
    });

    const totalScore = mastered + (reviewCount * 0.5) + (learning * 0.2);
    const percentage = Math.round((totalScore / total) * 100);

    return {
        total,
        mastered,
        learning: learning + reviewCount,
        newCount,
        percentage
    };
};

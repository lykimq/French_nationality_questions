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
    id: number;
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
        // Start over but keep some history
        interval = 0; // Immediate re-review
        streak = 0;
        level = MasteryLevel.LEARNING;
    } else {
        streak += 1;
        
        // Calculate new interval
        if (interval === 0) {
            interval = 1; // First success = 1 day
        } else if (interval === 1) {
            interval = 3; // Second success = 3 days
        } else {
            interval = Math.round(interval * easeFactor);
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
 * Initial mastery state for a new question.
 */
export const createInitialMastery = (questionId: number): QuestionMastery => ({
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
    questions: { id: number }[],
    masteryMap: Record<number, QuestionMastery>
): number[] => {
    const now = Date.now();
    
    return questions
        .map(q => {
            const mastery = masteryMap[q.id] || createInitialMastery(q.id);
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

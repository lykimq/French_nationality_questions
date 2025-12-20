export interface FormationQuestion {
    readonly id: number;
    readonly question: string;
    readonly explanation: string;
    readonly image: string | null;
}

export interface FormationCategory {
    readonly id: string;
    readonly title: string;
    readonly description: string;
    readonly questions: readonly FormationQuestion[];
}

export interface FlashCardState {
    isFlipped: boolean;
    currentIndex: number;
    totalCards: number;
}

export interface FlashCardProgress {
    categoryId: string;
    currentIndex: number;
    totalCards: number;
    viewedCards: Set<number>;
}


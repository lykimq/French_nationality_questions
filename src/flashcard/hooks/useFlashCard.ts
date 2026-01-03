import { useReducer, useCallback, useMemo, useRef } from 'react';
import type { FormationQuestion, FlashCardState } from '../types';

interface UseFlashCardProps {
    questions: readonly FormationQuestion[];
    key?: string;
}

type FlashCardAction =
    | { type: 'NEXT' }
    | { type: 'PREVIOUS' }
    | { type: 'GO_TO'; index: number }
    | { type: 'FLIP' }
    | { type: 'RESET' };

interface FlashCardReducerState {
    currentIndex: number;
    isFlipped: boolean;
    viewedCards: Set<number>;
}

const createInitialState = (questionsLength: number): FlashCardReducerState => ({
    currentIndex: 0,
    isFlipped: false,
    viewedCards: questionsLength > 0 ? new Set([0]) : new Set(),
});

const flashCardReducer = (
    state: FlashCardReducerState,
    action: FlashCardAction
): FlashCardReducerState => {
    switch (action.type) {
        case 'NEXT': {
            const newIndex = state.currentIndex + 1;
            return {
                ...state,
                currentIndex: newIndex,
                isFlipped: false,
                viewedCards: new Set([...state.viewedCards, newIndex]),
            };
        }
        case 'PREVIOUS': {
            const newIndex = state.currentIndex - 1;
            return {
                ...state,
                currentIndex: newIndex,
                isFlipped: false,
                viewedCards: new Set([...state.viewedCards, newIndex]),
            };
        }
        case 'GO_TO': {
            return {
                ...state,
                currentIndex: action.index,
                isFlipped: false,
                viewedCards: new Set([...state.viewedCards, action.index]),
            };
        }
        case 'FLIP': {
            return {
                ...state,
                isFlipped: !state.isFlipped,
            };
        }
        case 'RESET': {
            return {
                ...state,
                currentIndex: 0,
                isFlipped: false,
                viewedCards: new Set([0]),
            };
        }
        default:
            return state;
    }
};

export const useFlashCard = ({ questions, key }: UseFlashCardProps) => {
    // Generate a stable key for questions array to detect changes
    const questionsKey = useMemo(() => {
        if (key) return key;
        return questions.length > 0 ? questions.map(q => q.id).join(',') : '';
    }, [questions, key]);

    // Create initial state based on questions length
    const initialState = useMemo(
        () => createInitialState(questions.length),
        [questionsKey] // Reset when questions change
    );

    const [state, dispatch] = useReducer(flashCardReducer, initialState);

    const totalCards = questions.length;
    
    // Normalize index to handle edge cases
    const normalizedIndex = useMemo(() => {
        if (totalCards === 0) return 0;
        return Math.max(0, Math.min(state.currentIndex, totalCards - 1));
    }, [state.currentIndex, totalCards]);

    const currentQuestion = useMemo(
        () => questions[normalizedIndex] || null,
        [questions, normalizedIndex]
    );

    const hasNext = totalCards > 0 && normalizedIndex < totalCards - 1;
    const hasPrevious = normalizedIndex > 0;

    const flipCard = useCallback(() => {
        dispatch({ type: 'FLIP' });
    }, []);

    const nextCard = useCallback(() => {
        if (hasNext) {
            dispatch({ type: 'NEXT' });
        }
    }, [hasNext]);

    const previousCard = useCallback(() => {
        if (hasPrevious) {
            dispatch({ type: 'PREVIOUS' });
        }
    }, [hasPrevious]);

    const goToCard = useCallback((index: number) => {
        if (index >= 0 && index < totalCards) {
            dispatch({ type: 'GO_TO', index });
        }
    }, [totalCards]);

    const reset = useCallback(() => {
        dispatch({ type: 'RESET' });
    }, []);

    const flashCardState: FlashCardState = useMemo(
        () => ({
            isFlipped: state.isFlipped,
            currentIndex: normalizedIndex,
            totalCards,
        }),
        [state.isFlipped, normalizedIndex, totalCards]
    );

    return {
        state: flashCardState,
        currentQuestion,
        hasNext,
        hasPrevious,
        viewedCards: state.viewedCards,
        flipCard,
        nextCard,
        previousCard,
        goToCard,
        reset,
    };
};


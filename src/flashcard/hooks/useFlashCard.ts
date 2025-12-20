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
    | { type: 'RESET' }
    | { type: 'RESET_QUESTIONS'; questionsKey: string };

interface FlashCardReducerState {
    currentIndex: number;
    isFlipped: boolean;
    viewedCards: Set<number>;
    questionsKey: string;
    totalCards: number;
}

const createInitialState = (questions: readonly FormationQuestion[], questionsKey: string): FlashCardReducerState => ({
    currentIndex: 0,
    isFlipped: false,
    viewedCards: questions.length > 0 ? new Set([0]) : new Set(),
    questionsKey,
    totalCards: questions.length,
});

const flashCardReducer = (
    state: FlashCardReducerState,
    action: FlashCardAction,
    questions: readonly FormationQuestion[]
): FlashCardReducerState => {
    const totalCards = questions.length;
    switch (action.type) {
        case 'NEXT': {
            if (state.currentIndex >= totalCards - 1) {
                return state;
            }
            const newIndex = state.currentIndex + 1;
            return {
                ...state,
                currentIndex: newIndex,
                isFlipped: false,
                viewedCards: new Set([...state.viewedCards, newIndex]),
                totalCards,
            };
        }
        case 'PREVIOUS': {
            if (state.currentIndex <= 0) {
                return state;
            }
            const newIndex = state.currentIndex - 1;
            return {
                ...state,
                currentIndex: newIndex,
                isFlipped: false,
                viewedCards: new Set([...state.viewedCards, newIndex]),
                totalCards,
            };
        }
        case 'GO_TO': {
            if (action.index < 0 || action.index >= totalCards) {
                return state;
            }
            return {
                ...state,
                currentIndex: action.index,
                isFlipped: false,
                viewedCards: new Set([...state.viewedCards, action.index]),
                totalCards,
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
        case 'RESET_QUESTIONS': {
            if (state.questionsKey === action.questionsKey) {
                return state;
            }
            return createInitialState(questions, action.questionsKey);
        }
        default:
            return state;
    }
};

export const useFlashCard = ({ questions, key }: UseFlashCardProps) => {
    const questionsKey = useMemo(() => {
        if (key) return key;
        return questions.length > 0 ? questions.map(q => q.id).join(',') : '';
    }, [questions, key]);

    const questionsRef = useRef<readonly FormationQuestion[]>(questions);
    const questionsKeyRef = useRef<string>(questionsKey);
    
    questionsRef.current = questions;
    questionsKeyRef.current = questionsKey;

    const stableReducer = useCallback(
        (state: FlashCardReducerState, action: FlashCardAction): FlashCardReducerState => {
            const currentQuestionsKey = questionsKeyRef.current;
            const currentQuestions = questionsRef.current;
            const currentTotalCards = currentQuestions.length;
            
            if (state.questionsKey !== currentQuestionsKey) {
                return createInitialState(currentQuestions, currentQuestionsKey);
            }
            
            if (action.type === 'RESET_QUESTIONS') {
                if (state.questionsKey === action.questionsKey) {
                    return {
                        ...state,
                        totalCards: currentTotalCards,
                    };
                }
                return createInitialState(currentQuestions, action.questionsKey);
            }
            
            const newState = flashCardReducer(state, action, currentQuestions);
            if (newState.totalCards !== currentTotalCards) {
                return {
                    ...newState,
                    totalCards: currentTotalCards,
                };
            }
            return newState;
        },
        []
    );

    const initialState = useMemo(
        () => createInitialState(questions, questionsKey),
        [questions, questionsKey]
    );

    const [state, dispatch] = useReducer(stableReducer, initialState);

    const totalCards = questions.length;
    const normalizedIndex = useMemo(() => {
        if (totalCards === 0) return 0;
        if (state.currentIndex >= totalCards) return 0;
        if (state.currentIndex < 0) return 0;
        return state.currentIndex;
    }, [state.currentIndex, totalCards]);

    const currentQuestion = useMemo(
        () => {
            if (questions.length === 0 || normalizedIndex >= questions.length) {
                return null;
            }
            return questions[normalizedIndex] || null;
        },
        [questions, normalizedIndex]
    );

    const hasNext = normalizedIndex < totalCards - 1;
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


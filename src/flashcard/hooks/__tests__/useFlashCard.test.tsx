/**
 * Integration tests for flashcard study hook
 *
 * Purpose: Tests the flashcard study session functionality:
 * - Initializing with first question
 * - Navigating between cards (next/previous)
 * - Flipping cards to reveal answers
 * - Resetting study session
 *
 * These tests ensure the flashcard study flow works correctly, allowing users
 * to study questions by flipping cards and navigating through the deck.
 */
import { renderHook, act } from "@testing-library/react-native";
import { useFlashCard } from "../useFlashCard";
import type { FormationQuestion } from "../../types";

const mockQuestions: FormationQuestion[] = [
    { id: 1, question: "Question 1", explanation: "Answer 1", image: null },
    { id: 2, question: "Question 2", explanation: "Answer 2", image: null },
    { id: 3, question: "Question 3", explanation: "Answer 3", image: null },
];

describe("useFlashCard Integration", () => {
    it("should initialize with first question", () => {
        const { result } = renderHook(() =>
            useFlashCard({ questions: mockQuestions })
        );

        expect(result.current.currentQuestion?.id).toBe(1);
        expect(result.current.state.currentIndex).toBe(0);
        expect(result.current.state.isFlipped).toBe(false);
    });

    it("should navigate to next card", () => {
        const { result } = renderHook(() =>
            useFlashCard({ questions: mockQuestions })
        );

        act(() => {
            result.current.nextCard();
        });

        expect(result.current.currentQuestion?.id).toBe(2);
        expect(result.current.state.currentIndex).toBe(1);
        expect(result.current.hasNext).toBe(true);
    });

    it("should flip card when flipCard is called", () => {
        const { result } = renderHook(() =>
            useFlashCard({ questions: mockQuestions })
        );

        expect(result.current.state.isFlipped).toBe(false);

        act(() => {
            result.current.flipCard();
        });

        expect(result.current.state.isFlipped).toBe(true);
    });

    it("should navigate to previous card", () => {
        const { result } = renderHook(() =>
            useFlashCard({ questions: mockQuestions })
        );

        act(() => {
            result.current.nextCard();
        });

        act(() => {
            result.current.previousCard();
        });

        expect(result.current.currentQuestion?.id).toBe(1);
        expect(result.current.state.currentIndex).toBe(0);
    });

    it("should reset to first card when reset is called", () => {
        const { result } = renderHook(() =>
            useFlashCard({ questions: mockQuestions })
        );

        act(() => {
            result.current.nextCard();
            result.current.nextCard();
            result.current.reset();
        });

        expect(result.current.currentQuestion?.id).toBe(1);
        expect(result.current.state.currentIndex).toBe(0);
        expect(result.current.state.isFlipped).toBe(false);
    });
});

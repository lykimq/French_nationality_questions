/**
 * Unit tests for civic exam scoring logic
 *
 * Purpose: Tests the critical exam scoring and pass/fail determination logic:
 * - Calculating exam scores as percentages
 * - Determining if an exam is passed (80% threshold)
 * - Validating passing threshold by correct answer count
 * - Computing complete exam results with all metadata
 *
 * These tests ensure exam results are calculated correctly, which is critical for
 * the civic exam feature - users must pass with 80% or higher to succeed.
 */
import {
    calculateCivicExamScore,
    isCivicExamPassed,
    isCivicExamPassedByCount,
    calculateCivicExamResult,
} from "../civicExamScoring";
import { CIVIC_EXAM_CONFIG } from "../../constants/civicExamConstants";

describe("civicExamScoring", () => {
    describe("calculateCivicExamScore", () => {
        it("should calculate score as percentage correctly", () => {
            expect(calculateCivicExamScore(32, 40)).toBe(80);
            expect(calculateCivicExamScore(20, 40)).toBe(50);
            expect(calculateCivicExamScore(40, 40)).toBe(100);
        });

        it("should return 0 for zero total questions", () => {
            expect(calculateCivicExamScore(0, 0)).toBe(0);
            expect(calculateCivicExamScore(10, 0)).toBe(0);
        });

        it("should round score correctly", () => {
            expect(calculateCivicExamScore(33, 40)).toBe(83);
            expect(calculateCivicExamScore(1, 3)).toBe(33);
        });
    });

    describe("isCivicExamPassed", () => {
        it("should return true for passing score (80% or higher)", () => {
            expect(isCivicExamPassed(80)).toBe(true);
            expect(isCivicExamPassed(85)).toBe(true);
            expect(isCivicExamPassed(100)).toBe(true);
        });

        it("should return false for failing score (below 80%)", () => {
            expect(isCivicExamPassed(79)).toBe(false);
            expect(isCivicExamPassed(50)).toBe(false);
            expect(isCivicExamPassed(0)).toBe(false);
        });
    });

    describe("isCivicExamPassedByCount", () => {
        it("should return true when correct answers meet passing threshold", () => {
            expect(
                isCivicExamPassedByCount(CIVIC_EXAM_CONFIG.PASSING_SCORE)
            ).toBe(true);
            expect(
                isCivicExamPassedByCount(CIVIC_EXAM_CONFIG.PASSING_SCORE + 1)
            ).toBe(true);
        });

        it("should return false when correct answers below threshold", () => {
            expect(
                isCivicExamPassedByCount(CIVIC_EXAM_CONFIG.PASSING_SCORE - 1)
            ).toBe(false);
            expect(isCivicExamPassedByCount(0)).toBe(false);
        });
    });

    describe("calculateCivicExamResult", () => {
        it("should calculate complete exam result correctly", () => {
            const result = calculateCivicExamResult(32, 40, 1800);

            expect(result.score).toBe(80);
            expect(result.passed).toBe(true);
            expect(result.correctAnswers).toBe(32);
            expect(result.totalQuestions).toBe(40);
            expect(result.timeSpent).toBe(1800);
        });

        it("should mark exam as failed when score below 80%", () => {
            const result = calculateCivicExamResult(25, 40, 2000);

            expect(result.score).toBe(63);
            expect(result.passed).toBe(false);
        });
    });
});

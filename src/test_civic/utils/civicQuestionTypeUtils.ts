import type { QuestionType } from "../types";

export const normalizeCivicQuestionType = (
    questionType: string
): QuestionType => {
    const normalized = questionType.toLowerCase().trim();
    if (normalized === "situation" || normalized === "situational") {
        return "situational";
    }
    return "knowledge";
};

export const isValidCivicQuestionTypeRaw = (questionType: string): boolean => {
    const normalized = questionType.toLowerCase().trim();
    return (
        normalized === "knowledge" ||
        normalized === "situational" ||
        normalized === "situation"
    );
};

import {
    isValidCivicQuestionTypeRaw,
    normalizeCivicQuestionType,
} from "../civicQuestionTypeUtils";

describe("civicQuestionTypeUtils", () => {
    it("normalizeCivicQuestionType maps situational aliases", () => {
        expect(normalizeCivicQuestionType("situational")).toBe("situational");
        expect(normalizeCivicQuestionType("situation")).toBe("situational");
        expect(normalizeCivicQuestionType(" SITUATIONAL ")).toBe("situational");
    });

    it("normalizeCivicQuestionType defaults to knowledge", () => {
        expect(normalizeCivicQuestionType("knowledge")).toBe("knowledge");
        expect(normalizeCivicQuestionType("unknown")).toBe("knowledge");
    });

    it("isValidCivicQuestionTypeRaw accepts known raw values", () => {
        expect(isValidCivicQuestionTypeRaw("knowledge")).toBe(true);
        expect(isValidCivicQuestionTypeRaw("situation")).toBe(true);
        expect(isValidCivicQuestionTypeRaw("invalid")).toBe(false);
    });
});

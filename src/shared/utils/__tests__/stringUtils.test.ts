import {
    normalizeForComparison,
    normalizeForSearch,
    stripAccents,
} from "../stringUtils";

describe("stripAccents", () => {
    it("removes diacritics and lowercases", () => {
        expect(stripAccents("Amélie")).toBe("amelie");
        expect(stripAccents("Égalité")).toBe("egalite");
    });
});

describe("normalizeForSearch", () => {
    it("still normalizes punctuation after stripping accents", () => {
        expect(normalizeForSearch("L'été")).toBe("l'ete");
    });
});

describe("normalizeForComparison", () => {
    it("strips accents before alphanumeric filter", () => {
        expect(normalizeForComparison("français")).toBe("francais");
    });
});

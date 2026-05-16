import { readFileSync } from "fs";
import { join } from "path";
import { normalizeForSearch } from "../stringUtils";
import {
    buildSearchCatalog,
    createDefaultSearchFilters,
    searchQuestions,
} from "../searchQuestions";
import type { FrenchQuestionsData } from "../../../types/questionsData";

const sampleDataPath = join(
    __dirname,
    "../../../data/knowledge/formation/principes_et_valeurs.json"
);

const loadSampleCategory = (): FrenchQuestionsData => {
    const raw = JSON.parse(readFileSync(sampleDataPath, "utf8"));
    return {
        categories: [
            {
                id: raw.id,
                title: raw.title,
                icon: "book",
                description: raw.description || "",
                questions: raw.questions,
            },
        ],
    };
};

describe("normalizeForSearch", () => {
    it("matches curly and straight apostrophes", () => {
        const stored = "Qu\u2019est-ce qu\u2019une devise ?";
        const typed = "Qu'est-ce qu'une devise ?";
        expect(normalizeForSearch(stored)).toBe(normalizeForSearch(typed));
    });

    it("is case and accent insensitive", () => {
        expect(normalizeForSearch("République")).toBe(
            normalizeForSearch("republique")
        );
    });
});

describe("searchQuestions", () => {
    const catalog = buildSearchCatalog(loadSampleCategory(), {
        includeFormation: false,
        includeTestCivic: false,
        includeLocalLivret: false,
    });
    const filters = createDefaultSearchFilters(catalog.idRange);

    it("finds a question when the full text is typed with keyboard apostrophes", () => {
        const { results, totalCount } = searchQuestions(
            catalog,
            "Qu'est-ce qu'une devise ?",
            filters
        );
        expect(totalCount).toBeGreaterThan(0);
        const top = results[0];
        expect(top?.question).toMatch(/devise/i);
    });

    it("finds questions by keyword regardless of case", () => {
        const lower = searchQuestions(catalog, "devise", filters);
        const upper = searchQuestions(catalog, "DEVISE", filters);
        expect(lower.totalCount).toBeGreaterThan(0);
        expect(upper.totalCount).toBe(lower.totalCount);
    });

    it("indexes each question with a unique key", () => {
        expect(catalog.questionTokens.size).toBe(catalog.allQuestions.length);
    });

    it("finds formation-only questions when formation catalog is included", () => {
        const livretOnly = buildSearchCatalog(
            { categories: [] },
            {
                includeFormation: false,
                includeTestCivic: false,
                includeLocalLivret: false,
            }
        );
        const { totalCount: withoutFormation } = searchQuestions(
            livretOnly,
            "Le programme de cours est-il le même pour tous ?",
            createDefaultSearchFilters(livretOnly.idRange)
        );
        expect(withoutFormation).toBe(0);

        const withFormation = buildSearchCatalog({ categories: [] });
        const { results, totalCount } = searchQuestions(
            withFormation,
            "Le programme de cours est-il le même pour tous ?",
            createDefaultSearchFilters(withFormation.idRange)
        );
        expect(totalCount).toBeGreaterThan(0);
        expect(
            results.some((r) => r.rawQuestionId === "pv_f_62")
        ).toBe(true);
        expect(
            results.find((r) => r.rawQuestionId === "pv_f_62")?.contentSource
        ).toBe("formation");
    });

    it("does not exclude questions above numeric id 200", () => {
        const highIdCatalog: FrenchQuestionsData = {
            categories: [
                {
                    id: "test_cat",
                    title: "Test",
                    icon: "book",
                    description: "",
                    questions: [
                        {
                            id: "test_f_250",
                            question: "Question numero deux cent cinquante",
                            explanation: "Explication unique zyx",
                            image: null,
                        },
                    ],
                },
            ],
        };
        const highCatalog = buildSearchCatalog(highIdCatalog, {
            includeFormation: false,
            includeTestCivic: false,
            includeLocalLivret: false,
        });
        const { totalCount } = searchQuestions(
            highCatalog,
            "deux cent cinquante",
            createDefaultSearchFilters(highCatalog.idRange)
        );
        expect(totalCount).toBe(1);
    });

    it("indexes livret, formation, and civic exam bundles together", () => {
        const fullCatalog = buildSearchCatalog({ categories: [] });
        const sources = new Set(
            fullCatalog.allQuestions.map((q) => q.contentSource)
        );
        expect(sources.has("livret")).toBe(true);
        expect(sources.has("formation")).toBe(true);
        expect(sources.has("test_civic")).toBe(true);
        expect(fullCatalog.questionTokens.size).toBe(
            fullCatalog.allQuestions.length
        );
    });

    it("finds civic exam questions in the unified catalog", () => {
        const catalog = buildSearchCatalog({ categories: [] });
        const { totalCount } = searchQuestions(
            catalog,
            "Quelle est la devise de la République française",
            createDefaultSearchFilters(catalog.idRange)
        );
        expect(totalCount).toBeGreaterThan(0);
    });
});

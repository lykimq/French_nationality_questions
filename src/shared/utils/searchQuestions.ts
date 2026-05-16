import { DATA_FILES } from "../config/dataPaths";
import { LOCAL_DATA_MAP } from "../config/dataMaps";
import type {
    FrenchCategory,
    FrenchQuestionsData,
} from "../../types/questionsData";
import { extractNumericId } from "./idUtils";
import {
    buildQuestionTokens,
    getQuestionSearchKey,
    scoreTokens,
    textContainsQuery,
    tokenize,
} from "./searchIndex";
import { normalizeForSearch } from "./stringUtils";

export type SearchContentSource = "livret" | "formation" | "test_civic";

export interface SearchResultQuestion {
    id: number;
    questionKey: string;
    rawQuestionId: string;
    question: string;
    explanation: string;
    categoryId: string;
    categoryTitle?: string;
    image?: string | null;
    matchScore?: number;
    matches?: string[];
    hasImage?: boolean;
    contentSource: SearchContentSource;
}

export interface SearchFilters {
    categories: string[];
    hasImage: "all" | "with" | "without";
    questionRange: { min: number; max: number };
    searchIn: ("question" | "explanation" | "both")[];
}

export interface CatalogIdRange {
    min: number;
    max: number;
}

export interface SearchSuggestion {
    text: string;
    type: "keyword" | "category" | "id" | "question";
    count?: number;
}

export interface SearchCatalog {
    allQuestions: SearchResultQuestion[];
    questionTokens: Map<string, string[]>;
    idRange: CatalogIdRange;
}

export interface SearchQuestionsResult {
    results: SearchResultQuestion[];
    totalCount: number;
}

export const MAX_SEARCH_RESULTS = 50;

export const createDefaultSearchFilters = (
    idRange: CatalogIdRange
): SearchFilters => ({
    categories: [],
    hasImage: "all",
    questionRange: { min: idRange.min, max: idRange.max },
    searchIn: ["both"],
});

export const isQuestionRangeFilterActive = (
    range: { min: number; max: number },
    catalogRange: CatalogIdRange
): boolean =>
    range.min > catalogRange.min || range.max < catalogRange.max;

export interface BuildSearchCatalogOptions {
    includeLocalLivret?: boolean;
    includeFormation?: boolean;
    includeTestCivic?: boolean;
}

type DataBundleConfig = {
    DIRECTORY: string;
    FILES: readonly string[];
};

const LOCAL_SEARCH_BUNDLES: ReadonlyArray<{
    bundle: DataBundleConfig;
    source: SearchContentSource;
    optionKey: keyof BuildSearchCatalogOptions;
}> = [
    {
        bundle: DATA_FILES.SUBCATEGORIES,
        source: "livret",
        optionKey: "includeLocalLivret",
    },
    {
        bundle: DATA_FILES.FORMATION,
        source: "formation",
        optionKey: "includeFormation",
    },
    {
        bundle: DATA_FILES.TEST_CIVIC,
        source: "test_civic",
        optionKey: "includeTestCivic",
    },
];

const getCategoryRegistryKey = (
    contentSource: SearchContentSource,
    categoryId: string
): string => `${contentSource}:${categoryId}`;

const toFrenchCategory = (raw: unknown): FrenchCategory | null => {
    if (!raw || typeof raw !== "object") return null;
    const cat = raw as Record<string, unknown>;
    if (typeof cat.id !== "string" || !Array.isArray(cat.questions)) {
        return null;
    }
    return {
        id: cat.id,
        title: typeof cat.title === "string" ? cat.title : cat.id,
        icon: typeof cat.icon === "string" ? cat.icon : "book",
        description: typeof cat.description === "string" ? cat.description : "",
        questions: cat.questions as FrenchCategory["questions"],
    };
};

const buildCivicSearchableText = (question: Record<string, unknown>): string => {
    const parts: string[] = [];
    if (typeof question.explanation === "string") {
        parts.push(question.explanation);
    }
    if (typeof question.correctAnswer === "string") {
        parts.push(question.correctAnswer);
    }
    if (Array.isArray(question.incorrectAnswers)) {
        for (const answer of question.incorrectAnswers) {
            if (typeof answer === "string") {
                parts.push(answer);
            }
        }
    }
    return parts.join("\n");
};

const toTestCivicCategory = (
    raw: unknown,
    fileName: string
): FrenchCategory | null => {
    if (!raw || typeof raw !== "object") return null;
    const cat = raw as Record<string, unknown>;
    if (!Array.isArray(cat.questions)) {
        return null;
    }

    const fileStem = fileName.replace(/\.json$/, "");
    const categoryId = `test_civic__${fileStem}`;
    const title =
        typeof cat.themeTitle === "string"
            ? `${cat.themeTitle} (Examen civique)`
            : categoryId;

    const questions = cat.questions
        .filter(
            (q): q is Record<string, unknown> =>
                !!q && typeof q === "object" && typeof (q as { id?: unknown }).id !== "undefined"
        )
        .map((q) => ({
            id: String(q.id),
            question: typeof q.question === "string" ? q.question : "",
            explanation: buildCivicSearchableText(q),
            image:
                typeof q.image === "string" || q.image === null
                    ? (q.image as string | null)
                    : null,
        }));

    if (questions.length === 0) {
        return null;
    }

    return {
        id: categoryId,
        title,
        icon: "school",
        description: "",
        questions,
    };
};

const loadCategoriesFromBundle = (
    bundle: DataBundleConfig,
    contentSource: SearchContentSource
): FrenchCategory[] => {
    const categories: FrenchCategory[] = [];
    for (const file of bundle.FILES) {
        const path = `${bundle.DIRECTORY}${file}`;
        const raw = LOCAL_DATA_MAP[path];
        const category =
            contentSource === "test_civic"
                ? toTestCivicCategory(raw, file)
                : toFrenchCategory(raw);
        if (category) {
            categories.push(category);
        }
    }
    return categories;
};

const appendCategoryQuestions = (
    allQuestions: SearchResultQuestion[],
    category: FrenchCategory,
    contentSource: SearchContentSource,
    trackNumericId: (numericId: number) => void
) => {
    category.questions.forEach((question) => {
        const rawQuestionId = String(question.id);
        const numericId = extractNumericId(question.id) ?? 0;
        if (numericId > 0) {
            trackNumericId(numericId);
        }

        allQuestions.push({
            id: numericId,
            questionKey: getQuestionSearchKey(
                contentSource,
                category.id,
                rawQuestionId
            ),
            rawQuestionId,
            question: question.question || "",
            explanation: question.explanation || "",
            categoryId: category.id,
            categoryTitle: category.title || category.id || "",
            image: question.image,
            hasImage: !!question.image,
            contentSource,
        });
    });
};

const isBundleIncluded = (
    options: BuildSearchCatalogOptions,
    optionKey: keyof BuildSearchCatalogOptions
): boolean => options[optionKey] !== false;

export const buildSearchCatalog = (
    questionsData: FrenchQuestionsData = { categories: [] },
    options: BuildSearchCatalogOptions = {}
): SearchCatalog => {
    const allQuestions: SearchResultQuestion[] = [];
    const loadedCategoryKeys = new Set<string>();
    let minId = Number.POSITIVE_INFINITY;
    let maxId = 0;

    const trackNumericId = (numericId: number) => {
        minId = Math.min(minId, numericId);
        maxId = Math.max(maxId, numericId);
    };

    const addCategory = (
        category: FrenchCategory,
        contentSource: SearchContentSource
    ) => {
        const registryKey = getCategoryRegistryKey(contentSource, category.id);
        if (loadedCategoryKeys.has(registryKey)) {
            return;
        }
        loadedCategoryKeys.add(registryKey);
        appendCategoryQuestions(
            allQuestions,
            category,
            contentSource,
            trackNumericId
        );
    };

    questionsData.categories.forEach((category) => {
        addCategory(category, "livret");
    });

    for (const { bundle, source, optionKey } of LOCAL_SEARCH_BUNDLES) {
        if (!isBundleIncluded(options, optionKey)) {
            continue;
        }
        loadCategoriesFromBundle(bundle, source).forEach((category) => {
            addCategory(category, source);
        });
    }

    const idRange: CatalogIdRange = {
        min: Number.isFinite(minId) ? minId : 1,
        max: maxId > 0 ? maxId : 1,
    };

    const questionTokens = buildQuestionTokens(allQuestions);

    return { allQuestions, questionTokens, idRange };
};

const filterQuestionsByAdvancedFilters = (
    questions: SearchResultQuestion[],
    filters: SearchFilters,
    catalogRange: CatalogIdRange
): SearchResultQuestion[] => {
    let filtered = questions;

    if (filters.categories.length > 0) {
        const categorySet = new Set(filters.categories);
        filtered = filtered.filter((q) => categorySet.has(q.categoryId));
    }

    if (filters.hasImage !== "all") {
        const hasImageFilter = filters.hasImage === "with";
        filtered = filtered.filter((q) => q.hasImage === hasImageFilter);
    }

    if (isQuestionRangeFilterActive(filters.questionRange, catalogRange)) {
        const { min, max } = filters.questionRange;
        filtered = filtered.filter((q) => q.id >= min && q.id <= max);
    }

    return filtered;
};

const scoreQuestionMatch = (
    item: SearchResultQuestion,
    trimmedQuery: string,
    normalizedQuery: string,
    queryTokens: string[],
    tokens: string[],
    filters: SearchFilters
): { matchScore: number; matches: string[] } => {
    let matchScore = 0;
    const matches: string[] = [];

    const searchInQuestion =
        filters.searchIn.includes("question") ||
        filters.searchIn.includes("both");
    const searchInExplanation =
        filters.searchIn.includes("explanation") ||
        filters.searchIn.includes("both");

    const questionText = item.question || "";
    const explanationText = item.explanation || "";
    const categoryText = item.categoryTitle || "";

    if (searchInQuestion) {
        const questionMatch = textContainsQuery(questionText, trimmedQuery);
        if (questionMatch.matched) {
            matchScore += questionMatch.score;
            matches.push(
                questionMatch.score >= 80
                    ? "question_exact"
                    : "question_partial"
            );
        }

        if (
            matchScore === 0 ||
            (questionMatch.matched && questionMatch.score < 80)
        ) {
            const tokenScore = scoreTokens(queryTokens, tokens);
            if (tokenScore > 0) {
                matchScore += tokenScore * 2;
                if (matches.length === 0) {
                    matches.push("question_word");
                }
            }
        }
    }

    if (searchInExplanation && matchScore < 80) {
        const explanationMatch = textContainsQuery(
            explanationText,
            trimmedQuery
        );
        if (explanationMatch.matched) {
            matchScore += explanationMatch.score * 0.8;
            matches.push(
                explanationMatch.score >= 50
                    ? "explanation_exact"
                    : "explanation_partial"
            );
        } else if (matchScore === 0) {
            const explanationTokens = tokenize(explanationText);
            const explanationTokenScore = scoreTokens(
                queryTokens,
                explanationTokens
            );
            if (explanationTokenScore > 0) {
                matchScore += explanationTokenScore * 2;
                if (!matches.some((m) => m.includes("explanation"))) {
                    matches.push("explanation_word");
                }
            }
        }
    }

    if (categoryText && normalizeForSearch(categoryText).includes(normalizedQuery)) {
        matchScore += 20;
        matches.push("category");
    }

    return { matchScore, matches };
};

export const searchQuestions = (
    catalog: SearchCatalog,
    query: string,
    filters: SearchFilters = createDefaultSearchFilters(catalog.idRange)
): SearchQuestionsResult => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
        return { results: [], totalCount: 0 };
    }

    const normalizedQuery = normalizeForSearch(trimmedQuery);
    const queryTokens = tokenize(normalizedQuery);

    if (queryTokens.length === 0 && !/^\d+$/.test(normalizedQuery)) {
        return { results: [], totalCount: 0 };
    }

    let filteredQuestions = filterQuestionsByAdvancedFilters(
        catalog.allQuestions,
        filters,
        catalog.idRange
    );

    const queryId = /^\d+$/.test(normalizedQuery)
        ? parseInt(normalizedQuery, 10)
        : null;

    if (queryId !== null) {
        const idMatches = filteredQuestions
            .filter((q) => q.id === queryId)
            .map((item) => ({
                ...item,
                matchScore: 1000,
                matches: ["ID"] as string[],
            }));
        if (idMatches.length > 0) {
            return {
                results: idMatches.slice(0, MAX_SEARCH_RESULTS),
                totalCount: idMatches.length,
            };
        }
    }

    const results = filteredQuestions
        .map((item) => {
            const tokens = catalog.questionTokens.get(item.questionKey) || [];
            const { matchScore, matches } = scoreQuestionMatch(
                item,
                trimmedQuery,
                normalizedQuery,
                queryTokens,
                tokens,
                filters
            );
            return { ...item, matchScore, matches };
        })
        .filter((item) => (item.matchScore ?? 0) > 0)
        .sort((a, b) => {
            if ((b.matchScore ?? 0) !== (a.matchScore ?? 0)) {
                return (b.matchScore ?? 0) - (a.matchScore ?? 0);
            }
            const aHasExact =
                a.matches?.some((m) => m.includes("exact")) ?? false;
            const bHasExact =
                b.matches?.some((m) => m.includes("exact")) ?? false;
            if (aHasExact !== bHasExact) {
                return bHasExact ? 1 : -1;
            }
            return a.questionKey.localeCompare(b.questionKey);
        });

    return {
        results: results.slice(0, MAX_SEARCH_RESULTS),
        totalCount: results.length,
    };
};

const scoreSuggestionMatch = (text: string, normalizedQuery: string): number => {
    const normalizedText = normalizeForSearch(text);
    if (normalizedText.startsWith(normalizedQuery)) {
        return 1000 - normalizedText.length;
    }
    const words = normalizedText.split(/\s+/);
    for (const word of words) {
        if (word.startsWith(normalizedQuery)) {
            return 500 - word.length;
        }
    }
    if (normalizedText.includes(normalizedQuery)) {
        return 100 - normalizedText.length;
    }
    const textTokens = tokenize(normalizedText);
    const queryTokens = tokenize(normalizedQuery);
    let tokenScore = 0;
    for (const qt of queryTokens) {
        if (
            textTokens.some((tt) => tt.startsWith(qt) || qt.startsWith(tt))
        ) {
            tokenScore += 10;
        }
    }
    return tokenScore;
};

export const generateSearchSuggestions = (
    catalog: SearchCatalog,
    query: string,
    availableCategories: Array<{ id: string; title: string; count: number }>
): SearchSuggestion[] => {
    if (query.length < 2) return [];

    const suggestions: SearchSuggestion[] = [];
    const normalizedQuery = normalizeForSearch(query);

    const categorySuggestions: Array<{
        text: string;
        type: "category";
        count: number;
        score: number;
    }> = [];

    for (const cat of availableCategories) {
        if (!cat.title) continue;
        const score = scoreSuggestionMatch(cat.title, normalizedQuery);
        if (score > 0) {
            categorySuggestions.push({
                text: cat.title || cat.id || "",
                type: "category",
                count: cat.count,
                score,
            });
        }
    }

    categorySuggestions
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
        .forEach((cat) => {
            suggestions.push({
                text: cat.text,
                type: cat.type,
                count: cat.count,
            });
        });

    const questionSuggestions: Array<{ text: string; score: number }> = [];
    for (const q of catalog.allQuestions) {
        const score = scoreSuggestionMatch(q.question, normalizedQuery);
        if (score >= 400) {
            questionSuggestions.push({ text: q.question, score });
        }
    }
    questionSuggestions
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
        .forEach((entry) => {
            suggestions.push({
                text: entry.text,
                type: "question",
            });
        });

    const keywordMap = new Map<string, { count: number; score: number }>();
    for (const tokens of catalog.questionTokens.values()) {
        for (const word of tokens) {
            if (word.length < 2) continue;
            const score = scoreSuggestionMatch(word, normalizedQuery);
            if (score > 0) {
                const existing = keywordMap.get(word);
                if (existing) {
                    existing.count++;
                    existing.score = Math.max(existing.score, score);
                } else {
                    keywordMap.set(word, { count: 1, score });
                }
            }
        }
    }

    Array.from(keywordMap.entries())
        .sort(([, aData], [, bData]) => {
            if (bData.score !== aData.score) return bData.score - aData.score;
            if (bData.count !== aData.count) return bData.count - aData.count;
            return 0;
        })
        .slice(0, 6)
        .forEach(([keyword, data]) => {
            if (keyword.length >= 2) {
                suggestions.push({
                    text: keyword,
                    type: "keyword",
                    count: data.count,
                });
            }
        });

    if (/^\d+$/.test(query.trim())) {
        const id = parseInt(query.trim(), 10);
        const matchCount = catalog.allQuestions.filter((q) => q.id === id).length;
        if (matchCount > 0) {
            suggestions.unshift({
                text: `Question #${id}`,
                type: "id",
                count: matchCount,
            });
        }
    }

    return suggestions.slice(0, 8);
};

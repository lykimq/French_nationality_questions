import type { SearchResultQuestion } from "./searchQuestions";

export type SearchResultNavigationTarget =
    | { type: "livret"; categoryId: string; rawQuestionId: string }
    | { type: "formation"; categoryId: string }
    | { type: "test_civic" };

export const getSearchResultNavigationTarget = (
    item: SearchResultQuestion
): SearchResultNavigationTarget => {
    switch (item.contentSource) {
        case "formation":
            return { type: "formation", categoryId: item.categoryId };
        case "test_civic":
            return { type: "test_civic" };
        default:
            return {
                type: "livret",
                categoryId: item.categoryId,
                rawQuestionId: item.rawQuestionId,
            };
    }
};

import type { NavigationProp, ParamListBase } from "@react-navigation/native";
import type { FrenchQuestionsData } from "../../types/questionsData";
import { sortQuestionsById } from "./questionUtils";
import type { SearchResultQuestion } from "./searchQuestions";

export type SearchResultNavigationTarget =
    | { type: "livret"; categoryId: string; rawQuestionId: string }
    | { type: "formation"; categoryId: string }
    | { type: "test_civic" };

export type SearchResultNavigator = Pick<
    NavigationProp<ParamListBase>,
    "navigate" | "getParent"
>;

export type SearchResultNavigationOrigin = "homeStack" | "tabRoot";

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

export const navigateToFlashCardCategory = (
    navigation: SearchResultNavigator,
    categoryId: string
): void => {
    navigation.getParent?.()?.navigate("FlashCardTab", {
        screen: "FlashCard",
        params: { categoryId },
    });
};

export const openSearchResult = (
    navigation: SearchResultNavigator,
    item: SearchResultQuestion,
    questionsData: FrenchQuestionsData,
    origin: SearchResultNavigationOrigin
): void => {
    const target = getSearchResultNavigationTarget(item);
    const tabNavigation = navigation.getParent?.();

    if (target.type === "formation") {
        navigateToFlashCardCategory(navigation, target.categoryId);
        return;
    }

    if (target.type === "test_civic") {
        tabNavigation?.navigate("CivicExamTab");
        return;
    }

    const category = questionsData.categories.find(
        (c) => c.id === target.categoryId
    );
    const sorted = sortQuestionsById(category?.questions || []);
    const initialIndex = sorted.findIndex(
        (q) => String(q.id) === String(target.rawQuestionId)
    );
    const params = {
        categoryId: target.categoryId,
        initialIndex: initialIndex >= 0 ? initialIndex : 0,
    };

    if (origin === "homeStack") {
        navigation.navigate("CategoryQuestions", params);
        return;
    }

    tabNavigation?.navigate("HomeTab", {
        screen: "CategoryQuestions",
        params,
    });
};

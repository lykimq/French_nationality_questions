import type { NavigationProp, ParamListBase } from "@react-navigation/native";
import type { FrenchQuestionsData } from "../../types/questionsData";
import { findQuestionIndexById } from "./questionUtils";
import type { SearchResultQuestion } from "./searchQuestions";

export type SearchResultNavigationTarget =
    | { type: "livret"; categoryId: string; rawQuestionId: string }
    | { type: "formation"; categoryId: string; rawQuestionId: string }
    | { type: "test_civic" };

export type SearchResultNavigator = Pick<
    NavigationProp<ParamListBase>,
    "navigate" | "getParent"
> & {
    push?: (screen: string, params?: object) => void;
};

export type SearchResultNavigationOrigin = "homeStack" | "tabRoot";

export type CategoryQuestionsParams = {
    categoryId: string;
    questionId: string | number;
    initialIndex: number;
};

export const getSearchResultNavigationTarget = (
    item: SearchResultQuestion
): SearchResultNavigationTarget => {
    switch (item.contentSource) {
        case "formation":
            return {
                type: "formation",
                categoryId: item.categoryId,
                rawQuestionId: item.rawQuestionId,
            };
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

export const buildCategoryQuestionsParams = (
    questionsData: FrenchQuestionsData,
    categoryId: string,
    questionId: string | number
): CategoryQuestionsParams | null => {
    const category = questionsData.categories.find((c) => c.id === categoryId);
    if (!category) {
        return null;
    }

    const questionIndex = findQuestionIndexById(
        category.questions || [],
        questionId
    );

    return {
        categoryId,
        questionId,
        initialIndex: questionIndex >= 0 ? questionIndex : 0,
    };
};

export const navigateToFlashCardCategory = (
    navigation: SearchResultNavigator,
    categoryId: string,
    questionId?: string | number
): void => {
    navigation.getParent?.()?.navigate("FlashCardTab", {
        screen: "FlashCard",
        params: {
            categoryId,
            ...(questionId != null && questionId !== ""
                ? { questionId }
                : {}),
        },
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
        navigateToFlashCardCategory(
            navigation,
            target.categoryId,
            target.rawQuestionId
        );
        return;
    }

    if (target.type === "test_civic") {
        tabNavigation?.navigate("CivicExamTab");
        return;
    }

    const params = buildCategoryQuestionsParams(
        questionsData,
        target.categoryId,
        target.rawQuestionId
    );
    if (!params) {
        return;
    }

    if (origin === "homeStack") {
        if (navigation.push) {
            navigation.push("CategoryQuestions", params);
        } else {
            navigation.navigate("CategoryQuestions", params);
        }
        return;
    }

    tabNavigation?.navigate("HomeTab", {
        state: {
            routes: [
                { name: "Home" },
                { name: "CategoryQuestions", params },
            ],
            index: 1,
        },
    });
};

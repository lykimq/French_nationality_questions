import {
    getSearchResultNavigationTarget,
    openSearchResult,
    buildCategoryQuestionsParams,
    type SearchResultNavigator,
} from "../searchNavigation";
import type { SearchResultQuestion } from "../searchQuestions";
import type { FrenchQuestionsData } from "../../../types/questionsData";

const livretItem: SearchResultQuestion = {
    questionKey: "livret-1",
    id: 1,
    rawQuestionId: "livret_1",
    question: "Test?",
    explanation: "Exp",
    image: null,
    categoryId: "cat-a",
    categoryTitle: "Cat A",
    contentSource: "livret",
    hasImage: false,
};

const formationItem: SearchResultQuestion = {
    ...livretItem,
    questionKey: "formation-1",
    rawQuestionId: "hgc_f_2",
    contentSource: "formation",
    categoryId: "histoire",
};

const questionsData: FrenchQuestionsData = {
    categories: [
        {
            id: "cat-a",
            title: "Cat A",
            icon: "book",
            description: "",
            questions: [
                {
                    id: "livret_1",
                    question: "Q1",
                    explanation: "E1",
                    image: null,
                    categoryId: "cat-a",
                },
                {
                    id: "livret_2",
                    question: "Q2",
                    explanation: "E2",
                    image: null,
                    categoryId: "cat-a",
                },
            ],
        },
    ],
};

describe("searchNavigation", () => {
    it("getSearchResultNavigationTarget maps content sources", () => {
        expect(getSearchResultNavigationTarget(livretItem).type).toBe("livret");
        expect(getSearchResultNavigationTarget(formationItem)).toEqual({
            type: "formation",
            categoryId: "histoire",
            rawQuestionId: "hgc_f_2",
        });
        expect(
            getSearchResultNavigationTarget({
                ...livretItem,
                contentSource: "test_civic",
            }).type
        ).toBe("test_civic");
    });

    it("buildCategoryQuestionsParams resolves index by question id", () => {
        expect(
            buildCategoryQuestionsParams(questionsData, "cat-a", "livret_2")
        ).toEqual({
            categoryId: "cat-a",
            questionId: "livret_2",
            initialIndex: 1,
        });
    });

    it("openSearchResult pushes CategoryQuestions from home stack for livret", () => {
        const push = jest.fn();
        const navigate = jest.fn();
        const navigation = { navigate, push, getParent: jest.fn() };

        openSearchResult(navigation, livretItem, questionsData, "homeStack");

        expect(push).toHaveBeenCalledWith("CategoryQuestions", {
            categoryId: "cat-a",
            questionId: "livret_1",
            initialIndex: 0,
        });
        expect(navigate).not.toHaveBeenCalled();
    });

    it("openSearchResult opens the selected livret question from search tab", () => {
        const tabNavigate = jest.fn();
        const navigation = {
            navigate: jest.fn(),
            push: jest.fn(),
            getParent: () => ({ navigate: tabNavigate }),
        };

        openSearchResult(
            navigation as SearchResultNavigator,
            { ...livretItem, rawQuestionId: "livret_2" },
            questionsData,
            "tabRoot"
        );

        expect(tabNavigate).toHaveBeenCalledWith("HomeTab", {
            state: {
                routes: [
                    { name: "Home" },
                    {
                        name: "CategoryQuestions",
                        params: {
                            categoryId: "cat-a",
                            questionId: "livret_2",
                            initialIndex: 1,
                        },
                    },
                ],
                index: 1,
            },
        });
    });

    it("openSearchResult navigates to FlashCard with question id for formation", () => {
        const tabNavigate = jest.fn();
        const navigation = {
            navigate: jest.fn(),
            push: jest.fn(),
            getParent: () => ({ navigate: tabNavigate }),
        };

        openSearchResult(
            navigation as SearchResultNavigator,
            formationItem,
            questionsData,
            "homeStack"
        );

        expect(tabNavigate).toHaveBeenCalledWith("FlashCardTab", {
            screen: "FlashCard",
            params: {
                categoryId: "histoire",
                questionId: "hgc_f_2",
            },
        });
    });
});

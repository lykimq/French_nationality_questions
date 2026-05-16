import {
    getSearchResultNavigationTarget,
    openSearchResult,
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
    contentSource: "formation",
    categoryId: "principes",
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
            ],
        },
    ],
};

describe("searchNavigation", () => {
    it("getSearchResultNavigationTarget maps content sources", () => {
        expect(getSearchResultNavigationTarget(livretItem).type).toBe("livret");
        expect(getSearchResultNavigationTarget(formationItem).type).toBe(
            "formation"
        );
        expect(
            getSearchResultNavigationTarget({
                ...livretItem,
                contentSource: "test_civic",
            }).type
        ).toBe("test_civic");
    });

    it("openSearchResult navigates from home stack for livret", () => {
        const navigate = jest.fn();
        const navigation = { navigate, getParent: jest.fn() };

        openSearchResult(navigation, livretItem, questionsData, "homeStack");

        expect(navigate).toHaveBeenCalledWith("CategoryQuestions", {
            categoryId: "cat-a",
            initialIndex: 0,
        });
    });

    it("openSearchResult navigates to FlashCard tab for formation", () => {
        const tabNavigate = jest.fn();
        const navigation = {
            navigate: jest.fn(),
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
            params: { categoryId: "principes" },
        });
    });

    it("openSearchResult navigates to HomeTab from search tab for livret", () => {
        const tabNavigate = jest.fn();
        const navigation = {
            navigate: jest.fn(),
            getParent: () => ({ navigate: tabNavigate }),
        };

        openSearchResult(
            navigation as SearchResultNavigator,
            livretItem,
            questionsData,
            "tabRoot"
        );

        expect(tabNavigate).toHaveBeenCalledWith("HomeTab", {
            screen: "CategoryQuestions",
            params: {
                categoryId: "cat-a",
                initialIndex: 0,
            },
        });
    });
});

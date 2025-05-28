import {
    HistorySubcategory,
    Question,
    QuestionType,
    Difficulty,
    Language
} from '../types/history';

// Function to get all questions from a specific subcategory
export const getSubcategoryQuestions = (
    subcategory: HistorySubcategory,
    language: 'fr' | 'vi' = 'fr'
): Question[] => {
    return subcategory.questions;
};

// Function to get a random question from a specific subcategory
export const getRandomQuestion = (
    subcategory: HistorySubcategory,
    language: 'fr' | 'vi' = 'fr'
): Question => {
    const questions = subcategory.questions;
    const randomIndex = Math.floor(Math.random() * questions.length);
    return questions[randomIndex];
};

// Function to get questions by time period
export const getQuestionsByPeriod = (
    subcategory: HistorySubcategory,
    startYear: number,
    endYear: number,
    language: 'fr' | 'vi' = 'fr'
): Question[] => {
    // This is a simple implementation. You might want to add year metadata to questions
    // for more accurate filtering
    return subcategory.questions.filter((question: Question) => {
        const explanation = question.explanation.toLowerCase();
        for (let year = startYear; year <= endYear; year++) {
            if (explanation.includes(year.toString())) {
                return true;
            }
        }
        return false;
    });
};

// Function to search questions by keyword
export const searchQuestions = (
    subcategory: HistorySubcategory,
    keyword: string,
    language: 'fr' | 'vi' = 'fr'
): Question[] => {
    const searchTerm = keyword.toLowerCase();
    return subcategory.questions.filter((question: Question) => {
        return (
            question.question.toLowerCase().includes(searchTerm) ||
            question.explanation.toLowerCase().includes(searchTerm)
        );
    });
};

// Function to get questions by difficulty level (you'll need to add difficulty metadata to questions)
export const getQuestionsByDifficulty = (
    subcategory: HistorySubcategory,
    difficulty: 'easy' | 'medium' | 'hard',
    language: 'fr' | 'vi' = 'fr'
): Question[] => {
    // This is a placeholder. You'll need to add difficulty levels to your questions
    return subcategory.questions;
};

// Function to get related questions based on a given question
export const getRelatedQuestions = (
    subcategory: HistorySubcategory,
    questionId: number,
    language: 'fr' | 'vi' = 'fr'
): Question[] => {
    const currentQuestion = subcategory.questions.find((q: Question) => q.id === questionId);
    if (!currentQuestion) return [];

    // Find questions with similar keywords in their content
    const keywords = extractKeywords(currentQuestion.question + ' ' + currentQuestion.explanation);
    return subcategory.questions.filter((q: Question) => {
        if (q.id === questionId) return false;
        const qKeywords = extractKeywords(q.question + ' ' + q.explanation);
        return hasCommonElements(keywords, qKeywords);
    });
};

// Helper function to extract keywords from text
const extractKeywords = (text: string): string[] => {
    const commonWords = new Set(['le', 'la', 'les', 'un', 'une', 'des', 'et', 'ou', 'à', 'de']);
    return text
        .toLowerCase()
        .split(/\W+/)
        .filter(word => word.length > 2 && !commonWords.has(word));
};

// Helper function to check if two arrays have common elements
const hasCommonElements = (arr1: string[], arr2: string[]): boolean => {
    const set = new Set(arr1);
    return arr2.some(item => set.has(item));
};

// Function to get questions by category type
export const getQuestionsByType = (
    subcategory: HistorySubcategory,
    type: 'dates' | 'people' | 'events' | 'places',
    language: 'fr' | 'vi' = 'fr'
): Question[] => {
    const typeKeywords = {
        dates: ['année', 'date', 'quand', 'depuis', 'khi nào', 'năm'],
        people: ['qui', 'personne', 'ai', 'người'],
        events: ['événement', 'guerre', 'révolution', 'sự kiện', 'chiến tranh', 'cách mạng'],
        places: ['où', 'lieu', 'ville', 'pays', 'ở đâu', 'thành phố', 'quốc gia']
    };

    const keywords = typeKeywords[type];
    return subcategory.questions.filter((question: Question) => {
        const text = (question.question + ' ' + question.explanation).toLowerCase();
        return keywords.some(keyword => text.includes(keyword));
    });
};

// Function to get the progress of answered questions
export const getSubcategoryProgress = (
    subcategory: HistorySubcategory,
    answeredQuestionIds: number[]
): {
    total: number;
    answered: number;
    percentage: number;
} => {
    const total = subcategory.questions.length;
    const answered = subcategory.questions.filter((q: Question) => answeredQuestionIds.includes(q.id)).length;
    return {
        total,
        answered,
        percentage: (answered / total) * 100
    };
};
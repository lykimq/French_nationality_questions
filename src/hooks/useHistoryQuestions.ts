import { useState, useCallback } from 'react';
import {
    HistorySubcategory,
    Question,
    QuestionType,
    Difficulty,
    Language
} from '../types/history';
import {
    getSubcategoryQuestions,
    getRandomQuestion,
    getQuestionsByPeriod,
    searchQuestions,
    getQuestionsByDifficulty,
    getRelatedQuestions,
    getQuestionsByType,
    getSubcategoryProgress
} from '../utils/historyUtils';

interface UseHistoryQuestionsProps {
    subcategory: HistorySubcategory;
    language?: Language;
}

interface UseHistoryQuestionsReturn {
    questions: Question[];
    currentQuestion: Question | null;
    answeredQuestions: Set<number>;
    progress: {
        total: number;
        answered: number;
        percentage: number;
    };
    setCurrentQuestion: (question: Question) => void;
    getNextQuestion: () => void;
    markQuestionAsAnswered: (questionId: number) => void;
    searchByKeyword: (keyword: string) => Question[];
    filterByPeriod: (startYear: number, endYear: number) => Question[];
    filterByType: (type: QuestionType) => Question[];
    filterByDifficulty: (difficulty: Difficulty) => Question[];
    getRelated: (questionId: number) => Question[];
}

export const useHistoryQuestions = ({
    subcategory,
    language = 'fr'
}: UseHistoryQuestionsProps): UseHistoryQuestionsReturn => {
    const [questions] = useState<Question[]>(getSubcategoryQuestions(subcategory, language));
    const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
    const [answeredQuestions, setAnsweredQuestions] = useState<Set<number>>(new Set());

    const getNextQuestion = useCallback(() => {
        const unansweredQuestions = questions.filter(q => !answeredQuestions.has(q.id));
        if (unansweredQuestions.length > 0) {
            const randomIndex = Math.floor(Math.random() * unansweredQuestions.length);
            setCurrentQuestion(unansweredQuestions[randomIndex]);
        } else {
            setCurrentQuestion(getRandomQuestion(subcategory, language));
        }
    }, [subcategory, language, questions, answeredQuestions]);

    const markQuestionAsAnswered = useCallback((questionId: number) => {
        setAnsweredQuestions(prev => new Set([...prev, questionId]));
    }, []);

    const searchByKeyword = useCallback((keyword: string): Question[] => {
        return searchQuestions(subcategory, keyword, language);
    }, [subcategory, language]);

    const filterByPeriod = useCallback((startYear: number, endYear: number): Question[] => {
        return getQuestionsByPeriod(subcategory, startYear, endYear, language);
    }, [subcategory, language]);

    const filterByType = useCallback((type: QuestionType): Question[] => {
        return getQuestionsByType(subcategory, type, language);
    }, [subcategory, language]);

    const filterByDifficulty = useCallback((difficulty: Difficulty): Question[] => {
        return getQuestionsByDifficulty(subcategory, difficulty, language);
    }, [subcategory, language]);

    const getRelated = useCallback((questionId: number): Question[] => {
        return getRelatedQuestions(subcategory, questionId, language);
    }, [subcategory, language]);

    const progress = getSubcategoryProgress(subcategory, Array.from(answeredQuestions));

    return {
        questions,
        currentQuestion,
        answeredQuestions,
        progress,
        setCurrentQuestion,
        getNextQuestion,
        markQuestionAsAnswered,
        searchByKeyword,
        filterByPeriod,
        filterByType,
        filterByDifficulty,
        getRelated
    };
};
import { useState, useMemo, useEffect, useCallback } from 'react';
import { useData } from '../shared/contexts/DataContext';
import { buildQuestionTokens, tokenize, scoreTokens } from '../shared/utils/searchIndex';
import { extractNumericId } from '../shared/utils/idUtils';

// Define the search result question type
export interface SearchResultQuestion {
    id: number;
    question: string;
    explanation: string;
    categoryId: string;
    categoryTitle?: string;
    image?: string | null;
    matchScore?: number;
    matches?: string[];
    hasImage?: boolean;
}

// Advanced search filters interface
export interface SearchFilters {
    categories: string[];
    hasImage: 'all' | 'with' | 'without';
    questionRange: { min: number; max: number };
    searchIn: ('question' | 'explanation' | 'both')[];
}

// Search suggestion interface
export interface SearchSuggestion {
    text: string;
    type: 'keyword' | 'category' | 'id';
    count?: number;
}

export const useSearch = () => {
    const { questionsData } = useData();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SearchResultQuestion[]>([]);
    const [searchHistory, setSearchHistory] = useState<string[]>([]);
    const [searchSuggestions, setSearchSuggestions] = useState<SearchSuggestion[]>([]);

    // Advanced search filters
    const [filters, setFilters] = useState<SearchFilters>({
        categories: [],
        hasImage: 'all',
        questionRange: { min: 1, max: 200 },
        searchIn: ['both'],
    });

    // Create a comprehensive list of all questions
    const allQuestions = useMemo(() => {
        const questions: SearchResultQuestion[] = [];

        questionsData.categories.forEach(category => {
            category.questions.forEach(question => {
                const normalizedId = extractNumericId(question.id) ?? 0;

                questions.push({
                    id: normalizedId,
                    question: question.question,
                    explanation: question.explanation || '',
                    categoryId: category.id,
                    categoryTitle: category.title,
                    image: question.image,
                    hasImage: !!question.image,
                });
            });
        });

        return questions;
    }, [questionsData]);

    const questionTokens = useMemo(() => buildQuestionTokens(allQuestions), [allQuestions]);

    // Get available categories for filter
    const availableCategories = useMemo(() => {
        const categories = new Map<string, { id: string; title: string; count: number }>();

        allQuestions.forEach(q => {
            const existing = categories.get(q.categoryId);
            if (existing) {
                existing.count++;
            } else {
                categories.set(q.categoryId, {
                    id: q.categoryId,
                    title: q.categoryTitle || q.categoryId,
                    count: 1
                });
            }
        });

        return Array.from(categories.values()).sort((a, b) => b.count - a.count);
    }, [allQuestions]);

    // Generate search suggestions based on current query
    const generateSuggestions = useCallback((query: string): SearchSuggestion[] => {
        if (query.length < 2) return [];

        const suggestions: SearchSuggestion[] = [];
        const normalizedQuery = query.toLowerCase();

        // Add category suggestions
        availableCategories.forEach(cat => {
            if (cat.title.toLowerCase().includes(normalizedQuery)) {
                suggestions.push({
                    text: cat.title,
                    type: 'category',
                    count: cat.count
                });
            }
        });

        // Add common keyword suggestions based on question tokens
        const commonKeywords = new Map<string, number>();
        questionTokens.forEach(tokens => {
            tokens
                .filter(word => word.includes(normalizedQuery))
                .forEach(word => {
                    commonKeywords.set(word, (commonKeywords.get(word) || 0) + 1);
                });
        });

        // Add top keyword suggestions
        Array.from(commonKeywords.entries())
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .forEach(([keyword, count]) => {
                suggestions.push({
                    text: keyword,
                    type: 'keyword',
                    count
                });
            });

        // Add ID suggestion if query is numeric
        if (/^\d+$/.test(query)) {
            const id = parseInt(query);
            const matchingQuestion = allQuestions.find(q => q.id === id);
            if (matchingQuestion) {
                suggestions.push({
                    text: `Question #${id}`,
                    type: 'id'
                });
            }
        }

        return suggestions.slice(0, 8);
    }, [availableCategories, questionTokens]);

    // Enhanced search function with advanced filters
    const performSearch = useCallback((query: string, appliedFilters: SearchFilters = filters) => {
        if (query.trim() === '') {
            setSearchResults([]);
            return;
        }

        const normalizedQuery = query.toLowerCase().trim();
        const queryTokens = tokenize(normalizedQuery);
        let filteredQuestions = allQuestions;

        // Apply category filter
        if (appliedFilters.categories.length > 0) {
            filteredQuestions = filteredQuestions.filter(q =>
                appliedFilters.categories.includes(q.categoryId)
            );
        }

        // Apply image filter
        if (appliedFilters.hasImage !== 'all') {
            filteredQuestions = filteredQuestions.filter(q =>
                appliedFilters.hasImage === 'with' ? q.hasImage : !q.hasImage
            );
        }

        // Apply question ID range filter
        filteredQuestions = filteredQuestions.filter(q =>
            q.id >= appliedFilters.questionRange.min && q.id <= appliedFilters.questionRange.max
        );

        const results = filteredQuestions.map(item => {
            let matchScore = 0;
            let matches: string[] = [];

            // Check if searching by ID
            if (item.id.toString() === normalizedQuery) {
                matchScore = 1000;
                matches.push('ID');
            }

            // Get text content
            const questionText = (item.question || '').toLowerCase();
            const explanationText = (item.explanation || '').toLowerCase();
            const categoryText = (item.categoryTitle || '').toLowerCase();
            const tokens = questionTokens.get(item.id) || [];

            if (appliedFilters.searchIn.includes('question') || appliedFilters.searchIn.includes('both')) {
                // Exact phrase match
                if (questionText.includes(normalizedQuery)) {
                    matchScore += 100;
                    matches.push('question_exact');
                }

                // Token-based matching
                const tokenScore = scoreTokens(queryTokens, tokens);
                if (tokenScore > 0) {
                    matchScore += tokenScore * 10;
                    matches.push('question_word');
                }
            }

            if (appliedFilters.searchIn.includes('explanation') || appliedFilters.searchIn.includes('both')) {
                if (explanationText.includes(normalizedQuery)) {
                    matchScore += 80;
                    matches.push('explanation_exact');
                }

                const explanationScore = scoreTokens(queryTokens, tokens);
                if (explanationScore > 0) {
                    matchScore += explanationScore * 5;
                    matches.push('explanation_word');
                }
            }

            // Category name matching
            if (categoryText.includes(normalizedQuery)) {
                matchScore += 20;
                matches.push('category');
            }

            return {
                ...item,
                matchScore,
                matches
            };
        }).filter(item => item.matchScore > 0)
            .sort((a, b) => b.matchScore - a.matchScore);

        setSearchResults(results);

        // Add to search history
        if (query.trim() && !searchHistory.includes(query.trim())) {
            setSearchHistory(prev => [query.trim(), ...prev.slice(0, 9)]);
        }
    }, [allQuestions, filters, searchHistory, questionTokens]);

    // Handle suggestions and debounced search
    useEffect(() => {
        if (searchQuery.length >= 2 && searchQuery.length <= 3) {
            setSearchSuggestions(generateSuggestions(searchQuery));
        } else {
            setSearchSuggestions([]);
        }

        const timeoutId = setTimeout(() => {
            performSearch(searchQuery);
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchQuery, generateSuggestions, performSearch]);

    const getSearchStats = useCallback(() => {
        const totalQuestions = allQuestions.length;
        const mainQuestions = questionsData.categories.reduce((sum, cat) => sum + cat.questions.length, 0);
        const historyQuestions = totalQuestions - mainQuestions;

        return { totalQuestions, mainQuestions, historyQuestions };
    }, [allQuestions, questionsData.categories]);

    return {
        searchQuery,
        setSearchQuery,
        searchResults,
        searchSuggestions,
        filters,
        setFilters,
        searchHistory,
        setSearchHistory,
        availableCategories,
        getSearchStats,
        performSearch
    };
};

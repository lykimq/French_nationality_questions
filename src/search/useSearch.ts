import { useState, useMemo, useEffect, useCallback } from 'react';
import { useData } from '../shared/contexts/DataContext';

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
                questions.push({
                    ...question,
                    categoryId: category.id,
                    categoryTitle: category.title,
                    hasImage: !!(question as any).image,
                });
            });
        });

        return questions;
    }, [questionsData]);

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

        // Add common keyword suggestions based on question content
        const commonKeywords = new Map<string, number>();
        allQuestions.forEach(q => {
            const text = q.question;
            const words = text.toLowerCase().split(/\s+/).filter(word =>
                word.length > 3 && word.includes(normalizedQuery)
            );

            words.forEach(word => {
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
    }, [availableCategories, allQuestions]);

    // Enhanced search function with advanced filters
    const performSearch = useCallback((query: string, appliedFilters: SearchFilters = filters) => {
        if (query.trim() === '') {
            setSearchResults([]);
            return;
        }

        const normalizedQuery = query.toLowerCase().trim();
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

            if (appliedFilters.searchIn.includes('question') || appliedFilters.searchIn.includes('both')) {
                // Exact phrase match
                if (questionText.includes(normalizedQuery)) {
                    matchScore += 100;
                    matches.push('question_exact');
                }

                // Word-based matching
                const queryWords = normalizedQuery.split(/\s+/);
                queryWords.forEach(word => {
                    if (word.length > 2 && questionText.includes(word)) {
                        matchScore += 50;
                        matches.push('question_word');
                    }
                });
            }

            if (appliedFilters.searchIn.includes('explanation') || appliedFilters.searchIn.includes('both')) {
                if (explanationText.includes(normalizedQuery)) {
                    matchScore += 80;
                    matches.push('explanation_exact');
                }

                const queryWords = normalizedQuery.split(/\s+/);
                queryWords.forEach(word => {
                    if (word.length > 2 && explanationText.includes(word)) {
                        matchScore += 30;
                        matches.push('explanation_word');
                    }
                });
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
    }, [allQuestions, filters, searchHistory]);

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

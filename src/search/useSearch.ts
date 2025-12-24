import { useState, useMemo, useEffect, useCallback } from 'react';
import { useData } from '../shared/contexts/DataContext';
import { buildQuestionTokens, tokenize, scoreTokens, textContainsQuery } from '../shared/utils/searchIndex';
import { extractNumericId } from '../shared/utils/idUtils';
import { normalizeForSearch } from '../shared/utils/textNormalization';

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
    const [isSearching, setIsSearching] = useState(false);
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
                    question: question.question || '',
                    explanation: question.explanation || '',
                    categoryId: category.id,
                    categoryTitle: category.title || category.id || '',
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

    // Generate search suggestions based on current query (optimized for accuracy and performance)
    const generateSuggestions = useCallback((query: string): SearchSuggestion[] => {
        if (query.length < 2) return [];

        const suggestions: SearchSuggestion[] = [];
        const normalizedQuery = normalizeForSearch(query);
        const queryTokens = tokenize(normalizedQuery);
        const firstToken = queryTokens[0] || normalizedQuery;

        // Score function for better relevance ranking
        const scoreMatch = (text: string, query: string): number => {
            const normalizedText = normalizeForSearch(text);
            // Exact prefix match - highest score
            if (normalizedText.startsWith(normalizedQuery)) {
                return 1000 - normalizedText.length; // Shorter exact matches rank higher
            }
            // Word starts with query - high score
            const words = normalizedText.split(/\s+/);
            for (const word of words) {
                if (word.startsWith(normalizedQuery)) {
                    return 500 - word.length;
                }
            }
            // Contains query - medium score
            if (normalizedText.includes(normalizedQuery)) {
                return 100 - normalizedText.length;
            }
            // Token-based match
            const textTokens = tokenize(normalizedText);
            const queryTokens = tokenize(normalizedQuery);
            let tokenScore = 0;
            for (const qt of queryTokens) {
                if (textTokens.some(tt => tt.startsWith(qt) || qt.startsWith(tt))) {
                    tokenScore += 10;
                }
            }
            return tokenScore;
        };

        // Add category suggestions with scoring
        const categorySuggestions: Array<{ text: string; type: 'category'; count: number; score: number }> = [];
        for (const cat of availableCategories) {
            if (!cat.title) continue;
            const score = scoreMatch(cat.title, query);
            if (score > 0) {
                categorySuggestions.push({
                    text: cat.title || cat.id || '',
                    type: 'category',
                    count: cat.count,
                    score
                });
            }
        }
        // Sort categories by score and add top 3
        categorySuggestions
            .sort((a, b) => b.score - a.score)
            .slice(0, 3)
            .forEach(cat => {
                suggestions.push({
                    text: cat.text,
                    type: cat.type,
                    count: cat.count
                });
            });

        // Add keyword suggestions with better matching and scoring
        const keywordMap = new Map<string, { count: number; score: number }>();
        const maxKeywordsToCheck = 200; // Increased for better coverage
        let checkedCount = 0;
        
        for (const tokens of questionTokens.values()) {
            if (checkedCount >= maxKeywordsToCheck) break;
            for (const word of tokens) {
                if (checkedCount >= maxKeywordsToCheck) break;
                if (word.length < 2) continue; // Skip very short words
                checkedCount++;
                
                const score = scoreMatch(word, normalizedQuery);
                if (score > 0) {
                    const existing = keywordMap.get(word);
                    if (existing) {
                        existing.count++;
                        existing.score = Math.max(existing.score, score); // Keep best score
                    } else {
                        keywordMap.set(word, { count: 1, score });
                    }
                }
            }
        }

        // Sort keywords by score first, then by count, then by length
        Array.from(keywordMap.entries())
            .sort(([aWord, aData], [bWord, bData]) => {
                // First by score (relevance)
                if (bData.score !== aData.score) return bData.score - aData.score;
                // Then by count (frequency)
                if (bData.count !== aData.count) return bData.count - aData.count;
                // Finally by length (prefer shorter, more specific words)
                return aWord.length - bWord.length;
            })
            .slice(0, 6) // Get top 6 keywords
            .forEach(([keyword, data]) => {
                if (keyword && keyword.length >= 2) {
                    suggestions.push({
                        text: keyword,
                        type: 'keyword',
                        count: data.count
                    });
                }
            });

        // Add ID suggestion if query is numeric (highest priority)
        if (/^\d+$/.test(query)) {
            const id = parseInt(query);
            const matchingQuestion = allQuestions.find(q => q.id === id);
            if (matchingQuestion) {
                suggestions.unshift({ // Add at beginning for highest priority
                    text: `Question #${id}`,
                    type: 'id'
                });
            }
        }

        return suggestions.slice(0, 8);
    }, [availableCategories, questionTokens, allQuestions]);

    // Enhanced search function with advanced filters (optimized for performance)
    const performSearch = useCallback((query: string, appliedFilters: SearchFilters = filters) => {
        const trimmedQuery = query.trim();
        if (trimmedQuery === '') {
            setSearchResults([]);
            setIsSearching(false);
            return;
        }

        setIsSearching(true);

        // Use setTimeout to make search asynchronous and non-blocking, allowing UI to update immediately
        setTimeout(() => {
            const normalizedQuery = normalizeForSearch(trimmedQuery);
            const queryTokens = tokenize(normalizedQuery);
            
            // Early exit if no query tokens
            if (queryTokens.length === 0 && !/^\d+$/.test(normalizedQuery)) {
                setSearchResults([]);
                setIsSearching(false);
                return;
            }

            // Pre-filter questions for better performance
            let filteredQuestions = allQuestions;

            // Apply category filter (use Set for O(1) lookup)
            if (appliedFilters.categories.length > 0) {
                const categorySet = new Set(appliedFilters.categories);
                filteredQuestions = filteredQuestions.filter(q => categorySet.has(q.categoryId));
            }

            // Apply image filter
            if (appliedFilters.hasImage !== 'all') {
                const hasImageFilter = appliedFilters.hasImage === 'with';
                filteredQuestions = filteredQuestions.filter(q => q.hasImage === hasImageFilter);
            }

            // Apply question ID range filter
            const { min, max } = appliedFilters.questionRange;
            if (min > 1 || max < 200) {
                filteredQuestions = filteredQuestions.filter(q => q.id >= min && q.id <= max);
            }

            // Pre-compute search settings for performance
            const searchInQuestion = appliedFilters.searchIn.includes('question') || appliedFilters.searchIn.includes('both');
            const searchInExplanation = appliedFilters.searchIn.includes('explanation') || appliedFilters.searchIn.includes('both');
            const queryId = /^\d+$/.test(normalizedQuery) ? parseInt(normalizedQuery) : null;

            // Early exit for exact ID match - fastest path
            if (queryId !== null) {
                const exactMatch = filteredQuestions.find(q => q.id === queryId);
                if (exactMatch) {
                    setSearchResults([{
                        ...exactMatch,
                        matchScore: 1000,
                        matches: ['ID']
                    }]);
                    setIsSearching(false);
                    if (query.trim() && !searchHistory.includes(query.trim())) {
                        setSearchHistory(prev => [query.trim(), ...prev.slice(0, 9)]);
                    }
                    return;
                }
            }

            const results = filteredQuestions.map(item => {
                let matchScore = 0;
                const matches: string[] = [];

                // Get text content and tokens (cached)
                const questionText = item.question || '';
                const explanationText = item.explanation || '';
                const categoryText = item.categoryTitle || '';
                const tokens = questionTokens.get(item.id) || [];

                // Search in question
                if (searchInQuestion) {
                    const questionMatch = textContainsQuery(questionText, trimmedQuery);
                    if (questionMatch.matched) {
                        matchScore += questionMatch.score;
                        matches.push(questionMatch.score >= 50 ? 'question_exact' : 'question_partial');
                    }

                    // Token-based matching (only if no high-scoring match for performance)
                    if (matchScore === 0 || (questionMatch.matched && questionMatch.score < 50)) {
                        const tokenScore = scoreTokens(queryTokens, tokens);
                        if (tokenScore > 0) {
                            matchScore += tokenScore * 3;
                            if (matches.length === 0) {
                                matches.push('question_word');
                            }
                        }
                    }
                }

                // Search in explanation (only if needed and no strong question match)
                if (searchInExplanation && matchScore < 50) {
                    const explanationMatch = textContainsQuery(explanationText, trimmedQuery);
                    if (explanationMatch.matched) {
                        matchScore += explanationMatch.score * 0.8;
                        matches.push(explanationMatch.score >= 50 ? 'explanation_exact' : 'explanation_partial');
                    } else if (matchScore === 0) {
                        // Token-based matching for explanation (only if no phrase match)
                        const explanationTokens = tokenize(explanationText);
                        const explanationTokenScore = scoreTokens(queryTokens, explanationTokens);
                        if (explanationTokenScore > 0) {
                            matchScore += explanationTokenScore * 2;
                            if (!matches.some(m => m.includes('explanation'))) {
                                matches.push('explanation_word');
                            }
                        }
                    }
                }

                // Category name matching (lightweight check)
                if (categoryText && categoryText.toLowerCase().includes(normalizedQuery)) {
                    matchScore += 20;
                    matches.push('category');
                }

                return {
                    ...item,
                    matchScore,
                    matches
                };
            }).filter(item => item.matchScore > 0)
                .sort((a, b) => {
                    // Sort by score first
                    if (b.matchScore !== a.matchScore) {
                        return b.matchScore - a.matchScore;
                    }
                    // If scores are equal, prioritize exact matches
                    const aHasExact = a.matches?.some(m => m.includes('exact')) || false;
                    const bHasExact = b.matches?.some(m => m.includes('exact')) || false;
                    if (aHasExact !== bHasExact) {
                        return bHasExact ? 1 : -1;
                    }
                    // Finally, sort by ID
                    return a.id - b.id;
                });

            setSearchResults(results);
            setIsSearching(false);

            // Add to search history
            if (query.trim() && !searchHistory.includes(query.trim())) {
                setSearchHistory(prev => [query.trim(), ...prev.slice(0, 9)]);
            }
        }, 0);
    }, [allQuestions, filters, searchHistory, questionTokens]);

    // Handle suggestions only (no automatic search)
    useEffect(() => {
        const queryLength = searchQuery.length;
        
        // Show suggestions for queries of length 2-6
        if (queryLength >= 2 && queryLength <= 6) {
            setSearchSuggestions(generateSuggestions(searchQuery));
        } else {
            setSearchSuggestions([]);
        }
    }, [searchQuery, generateSuggestions]);

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
        performSearch,
        isSearching
    };
};

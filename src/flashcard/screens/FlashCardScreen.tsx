import React, { useState, useRef, useCallback, useMemo } from 'react';
import {
    StyleSheet,
    View,
    TouchableOpacity,
    Animated,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { Dimensions } from 'react-native';

import { useTheme } from '../../shared/contexts/ThemeContext';
import { FormattedText, QuestionListModal, type QuestionListItem } from '../../shared/components';
import { FlashCard } from '../components';
import { useFlashCard } from '../hooks';
import { loadFlashCardData, getCategoryById } from '../utils';
import { sortQuestionsById } from '../../shared/utils/questionUtils';
import { useMastery } from '../../shared/contexts/MasteryContext';
import { PerformanceRating, prioritizeQuestions } from '../../shared/utils/MasteryUtils';
import { sharedStyles } from '../../shared/utils';
import { Icon3D } from '../../shared/components';
import type { FormationCategory } from '../types';
import type { FlashCardStackParamList } from '../navigation/FlashCardStack';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;
const VELOCITY_THRESHOLD = 400;

type FlashCardScreenNavigationProp = NativeStackNavigationProp<FlashCardStackParamList>;
type FlashCardScreenRouteProp = {
    key: string;
    name: 'FlashCard';
    params: { categoryId: string };
};

type CategoryDataState = {
    data: { [key: string]: FormationCategory } | null;
    loading: boolean;
    error: string | null;
};

let globalFlashCardDataCache: { [key: string]: FormationCategory } | null = null;
let globalFlashCardDataPromise: Promise<{ [key: string]: FormationCategory } | null> | null = null;

const FlashCardScreen: React.FC = () => {
    const route = useRoute<FlashCardScreenRouteProp>();
    const navigation = useNavigation<FlashCardScreenNavigationProp>();
    const { theme } = useTheme();
    const { categoryId } = route.params;

    const [dataState, setDataState] = useState<CategoryDataState>(() => ({
        data: globalFlashCardDataCache,
        loading: globalFlashCardDataCache === null,
        error: null,
    }));

    const loadCategoryData = useCallback(async () => {
        if (globalFlashCardDataCache) {
            setDataState({
                data: globalFlashCardDataCache,
                loading: false,
                error: null,
            });
            return;
        }

        if (globalFlashCardDataPromise) {
            try {
                const data = await globalFlashCardDataPromise;
                globalFlashCardDataCache = data;
                setDataState({
                    data,
                    loading: false,
                    error: data ? null : 'Impossible de charger les données',
                });
            } catch (err) {
                setDataState({
                    data: null,
                    loading: false,
                    error: 'Erreur lors du chargement des données',
                });
            }
            return;
        }

        setDataState((prev) => ({ ...prev, loading: true, error: null }));

        const loadPromise = (async (): Promise<{ [key: string]: FormationCategory } | null> => {
            try {
                const data = await loadFlashCardData();
                globalFlashCardDataCache = data;
                globalFlashCardDataPromise = null;
                setDataState({
                    data,
                    loading: false,
                    error: data ? null : 'Impossible de charger les données',
                });
                return data;
            } catch (err) {
                globalFlashCardDataPromise = null;
                setDataState({
                    data: null,
                    loading: false,
                    error: 'Erreur lors du chargement des données',
                });
                return null;
            }
        })();

        globalFlashCardDataPromise = loadPromise;
        await loadPromise;
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadCategoryData();
        }, [categoryId, loadCategoryData])
    );

    const { masteryMap } = useMastery();

    const category = useMemo(() => {
        if (!dataState.data || !categoryId) {
            return null;
        }

        if (categoryId === 'recommended') {
            // Flatten all questions from all categories
            const allQuestions = Object.values(dataState.data).flatMap(cat => cat.questions);
            const prioritizedIds = prioritizeQuestions(allQuestions, masteryMap);
            
            // Take the top 30 questions for the recommended session
            const recommendedQuestions = prioritizedIds
                .slice(0, 30)
                .map(id => allQuestions.find(q => q.id === id))
                .filter((q): q is any => q !== undefined);

            return {
                id: 'recommended',
                title: 'Session Recommandée',
                description: 'Pratique personnalisée basée sur votre progression',
                questions: recommendedQuestions,
                icon: 'sparkles'
            };
        }

        const cat = getCategoryById(dataState.data, categoryId);
        if (!cat) {
            return null;
        }
        const sortedQuestions = sortQuestionsById(cat.questions);
        return {
            ...cat,
            questions: sortedQuestions,
        };
    }, [dataState.data, categoryId, masteryMap]);

    const isLoading = dataState.loading;
    const error = category ? null : (dataState.error || 'Catégorie non trouvée');

    const translateX = useRef(new Animated.Value(0)).current;
    const opacity = useRef(new Animated.Value(1)).current;
    const [isAnimating, setIsAnimating] = useState(false);
    const [isQuestionListVisible, setIsQuestionListVisible] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const prevQuestionIdRef = useRef<number | null>(null);

    const {
        state,
        currentQuestion,
        hasNext,
        hasPrevious,
        flipCard,
        nextCard,
        previousCard,
        goToCard,
    } = useFlashCard({
        questions: category?.questions || [],
        key: categoryId,
    });

    const { updateMastery } = useMastery();

    const currentQuestionId = currentQuestion?.id ?? null;
    if (currentQuestionId !== prevQuestionIdRef.current && !isAnimating) {
        prevQuestionIdRef.current = currentQuestionId;
        translateX.setValue(0);
        opacity.setValue(1);
    }

    const animateTransition = useCallback(
        (direction: 'left' | 'right', callback: () => void, rating?: PerformanceRating) => {
            if (isAnimating) return;

            setIsAnimating(true);

            // If a rating is provided, update mastery
            if (rating !== undefined && currentQuestion) {
                updateMastery(currentQuestion.id, rating);
            }

            Animated.parallel([
                Animated.timing(translateX, {
                    toValue: direction === 'left' ? -SCREEN_WIDTH * 1.5 : SCREEN_WIDTH * 1.5,
                    duration: 250,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 0,
                    duration: 250,
                    useNativeDriver: true,
                }),
            ]).start(() => {
                if (hasNext || direction === 'right') { // Allow 'right' for previous card
                    callback();
                    setIsAnimating(false);
                    requestAnimationFrame(() => {
                        requestAnimationFrame(() => {
                            translateX.setValue(0);
                            opacity.setValue(1);
                        });
                    });
                } else {
                    // Last card completed
                    setShowSuccess(true);
                    setIsAnimating(false);
                }
            });
        },
        [isAnimating, translateX, opacity, currentQuestion, updateMastery, hasNext]
    );

    const handleNextPress = useCallback(() => {
        if (hasNext) animateTransition('left', nextCard);
    }, [hasNext, animateTransition, nextCard]);

    const handlePreviousPress = useCallback(() => {
        if (hasPrevious) animateTransition('right', previousCard);
    }, [hasPrevious, animateTransition, previousCard]);

    const handleQuestionSelect = useCallback((index: number) => {
        if (index >= 0 && index < state.totalCards) {
            const direction = index > state.currentIndex ? 'left' : 'right';
            animateTransition(direction, () => {
                goToCard(index);
                setIsQuestionListVisible(false);
            });
        }
    }, [state.currentIndex, state.totalCards, animateTransition, goToCard]);

    const questionListData: QuestionListItem[] = useMemo(() => {
        if (!category?.questions) return [];
        return category.questions.map((q: any, index: number) => ({
            index,
            id: q.id,
            questionText: q.question,
        }));
    }, [category?.questions]);

    const progress = state.totalCards > 0 ? (state.currentIndex + 1) / state.totalCards : 0;

    const panGesture = Gesture.Pan()
        .activeOffsetX([-10, 10])
        .failOffsetY([-20, 20])
        .onUpdate((event) => {
            if (!isAnimating) {
                translateX.setValue(event.translationX);
            }
        })
        .onEnd((event) => {
            if (isAnimating) return;

            const { translationX, velocityX } = event;
            const shouldNavigate =
                Math.abs(translationX) > SWIPE_THRESHOLD ||
                Math.abs(velocityX) > VELOCITY_THRESHOLD;

            if (shouldNavigate) {
                if (translationX > 0) {
                    // Swipe Right = Mastered (EASY)
                    if (hasPrevious && translationX > SWIPE_THRESHOLD * 2) {
                        // Deep swipe right = previous card
                        handlePreviousPress();
                    } else {
                        animateTransition('right', nextCard, PerformanceRating.EASY);
                    }
                } else if (translationX < 0) {
                    // Swipe Left = Review (HARD)
                    animateTransition('left', nextCard, PerformanceRating.HARD);
                }
            } else {
                Animated.parallel([
                    Animated.spring(translateX, {
                        toValue: 0,
                        useNativeDriver: true,
                        tension: 50,
                        friction: 8,
                    }),
                    Animated.spring(opacity, {
                        toValue: 1,
                        useNativeDriver: true,
                        tension: 50,
                        friction: 8,
                    }),
                ]).start();
            }
        });

    // Interpolations for advanced swipe effects
    const rotate = translateX.interpolate({
        inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
        outputRange: ['-10deg', '0deg', '10deg'],
        extrapolate: 'clamp',
    });

    const masteredOpacity = translateX.interpolate({
        inputRange: [0, SWIPE_THRESHOLD],
        outputRange: [0, 1],
        extrapolate: 'clamp',
    });

    const reviewOpacity = translateX.interpolate({
        inputRange: [-SWIPE_THRESHOLD, 0],
        outputRange: [1, 0],
        extrapolate: 'clamp',
    });

    if (showSuccess) {
        return (
            <View
                style={[
                    styles.container,
                    {
                        backgroundColor: theme.colors.background,
                        justifyContent: 'center',
                        alignItems: 'center',
                        padding: 20,
                    },
                ]}
            >
                <Icon3D name="checkmark-circle" size={100} color={theme.colors.success} variant="gradient" />
                <FormattedText
                    style={[
                        styles.categoryTitle,
                        { color: theme.colors.text, fontSize: 24, marginTop: 24 },
                    ]}
                >
                    Félicitations !
                </FormattedText>
                <FormattedText
                    style={[
                        styles.pageIndicator,
                        { color: theme.colors.textSecondary, marginTop: 8, textAlign: 'center' },
                    ]}
                >
                    Vous avez terminé cette session. Votre progression a été enregistrée.
                </FormattedText>
                
                <TouchableOpacity
                    style={[styles.backButton, { backgroundColor: theme.colors.primary, marginTop: 40, width: '100%' }]}
                    onPress={() => navigation.goBack()}
                >
                    <FormattedText style={[styles.backButtonText, { color: theme.colors.buttonText, textAlign: 'center' }]}>
                        Continuer
                    </FormattedText>
                </TouchableOpacity>
            </View>
        );
    }

    if (isLoading) {
        return (
            <View
                style={[
                    styles.container,
                    {
                        backgroundColor: theme.colors.background,
                        justifyContent: 'center',
                        alignItems: 'center',
                    },
                ]}
            >
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <FormattedText
                    style={[
                        styles.loadingText,
                        { color: theme.colors.textMuted, marginTop: 16 },
                    ]}
                >
                    Chargement...
                </FormattedText>
            </View>
        );
    }

    if (error || !category) {
        return (
            <View
                style={[
                    styles.container,
                    {
                        backgroundColor: theme.colors.background,
                        justifyContent: 'center',
                        alignItems: 'center',
                        padding: 20,
                    },
                ]}
            >
                <Ionicons name="alert-circle" size={48} color={theme.colors.error} />
                <FormattedText
                    style={[
                        styles.errorText,
                        { color: theme.colors.text, marginTop: 16, textAlign: 'center' },
                    ]}
                >
                    {error || 'Catégorie non trouvée'}
                </FormattedText>
                <TouchableOpacity
                    style={[styles.backButton, { backgroundColor: theme.colors.primary, marginTop: 20 }]}
                    onPress={() => navigation.goBack()}
                >
                    <FormattedText style={[styles.backButtonText, { color: theme.colors.buttonText }]}>
                        Retour
                    </FormattedText>
                </TouchableOpacity>
            </View>
        );
    }

    if (!currentQuestion) {
        return (
            <View
                style={[
                    styles.container,
                    {
                        backgroundColor: theme.colors.background,
                        justifyContent: 'center',
                        alignItems: 'center',
                    },
                ]}
            >
                <FormattedText style={[styles.errorText, { color: theme.colors.text }]}>
                    Aucune question disponible
                </FormattedText>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <SafeAreaView style={styles.safeArea} edges={['top']}>
                <View
                    style={[
                        styles.navigationBar,
                        {
                            backgroundColor: theme.colors.card,
                            borderBottomColor: theme.colors.divider,
                        },
                    ]}
                >
                    <TouchableOpacity
                        style={styles.navButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="arrow-back" size={24} color={theme.colors.primary} />
                    </TouchableOpacity>
                    <View style={styles.navigationInfo}>
                        <FormattedText
                            style={[styles.categoryTitle, { color: theme.colors.text }]}
                            numberOfLines={1}
                        >
                            {category.title}
                        </FormattedText>
                        <FormattedText
                            style={[styles.pageIndicator, { color: theme.colors.textSecondary }]}
                        >
                            {state.currentIndex + 1} / {state.totalCards}
                        </FormattedText>
                        {state.totalCards > 1 && (
                            <TouchableOpacity
                                style={[styles.jumpButton, { backgroundColor: theme.colors.primary + '20' }]}
                                onPress={() => setIsQuestionListVisible(true)}
                            >
                                <FormattedText style={[styles.jumpButtonText, { color: theme.colors.primary }]}>
                                    Liste des questions
                                </FormattedText>
                            </TouchableOpacity>
                        )}
                    </View>
                    <TouchableOpacity
                        style={styles.navButton}
                        onPress={handleNextPress}
                        disabled={!hasNext}
                    >
                        <Ionicons
                            name="chevron-forward"
                            size={24}
                            color={!hasNext ? theme.colors.textMuted : theme.colors.primary}
                        />
                    </TouchableOpacity>
                </View>

                {/* Progress Bar */}
                {state.totalCards > 1 && (
                    <View style={[styles.progressBarContainer, { backgroundColor: theme.colors.card }]}>
                        <View style={[styles.progressBarBackground, { backgroundColor: theme.colors.divider }]}>
                            <Animated.View
                                style={[
                                    styles.progressBarFill,
                                    {
                                        width: `${progress * 100}%`,
                                        backgroundColor: theme.colors.primary,
                                    }
                                ]}
                            />
                        </View>
                    </View>
                )}

                <GestureDetector gesture={panGesture}>
                    <View style={styles.content}>
                        <Animated.View
                            style={[
                                styles.cardContainer,
                                {
                                    transform: [
                                        { translateX },
                                        { rotate }
                                    ],
                                    opacity: opacity,
                                },
                            ]}
                        >
                            {/* Visual Stamps */}
                            <Animated.View style={[
                                sharedStyles.stampContainer, 
                                sharedStyles.masteredStamp, 
                                { opacity: masteredOpacity }
                            ]}>
                                <FormattedText style={[sharedStyles.stampText, { color: '#4CAF50' }]}>Savoir</FormattedText>
                            </Animated.View>

                            <Animated.View style={[
                                sharedStyles.stampContainer, 
                                sharedStyles.reviewStamp, 
                                { opacity: reviewOpacity }
                            ]}>
                                <FormattedText style={[sharedStyles.stampText, { color: '#FF5722' }]}>À revoir</FormattedText>
                            </Animated.View>

                            <FlashCard
                                key={`card-${currentQuestion.id}-${state.currentIndex}`}
                                question={currentQuestion}
                                isFlipped={state.isFlipped}
                                onFlip={flipCard}
                            />
                        </Animated.View>
                    </View>
                </GestureDetector>

                <View
                    style={[
                        styles.footer,
                        {
                            backgroundColor: theme.colors.card,
                            borderTopColor: theme.colors.divider,
                        },
                    ]}
                >
                    <TouchableOpacity
                        style={[styles.footerButton, !hasPrevious && styles.footerButtonDisabled]}
                        onPress={handlePreviousPress}
                        disabled={!hasPrevious}
                    >
                        <Ionicons
                            name="chevron-back"
                            size={20}
                            color={!hasPrevious ? theme.colors.textMuted : theme.colors.primary}
                        />
                        <FormattedText
                            style={[
                                styles.footerButtonText,
                                {
                                    color: !hasPrevious
                                        ? theme.colors.textMuted
                                        : theme.colors.primary,
                                },
                            ]}
                        >
                            Précédent
                        </FormattedText>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.footerButton, !hasNext && styles.footerButtonDisabled]}
                        onPress={handleNextPress}
                        disabled={!hasNext}
                    >
                        <FormattedText
                            style={[
                                styles.footerButtonText,
                                {
                                    color: !hasNext ? theme.colors.textMuted : theme.colors.primary,
                                },
                            ]}
                        >
                            Suivant
                        </FormattedText>
                        <Ionicons
                            name="chevron-forward"
                            size={20}
                            color={!hasNext ? theme.colors.textMuted : theme.colors.primary}
                        />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            {/* Question List Modal */}
            <QuestionListModal
                visible={isQuestionListVisible}
                onClose={() => setIsQuestionListVisible(false)}
                questions={questionListData}
                currentIndex={state.currentIndex}
                totalCount={state.totalCards}
                onSelectQuestion={handleQuestionSelect}
                title={category?.title}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
    navigationBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        zIndex: 1,
    },
    navButton: {
        padding: 8,
    },
    navigationInfo: {
        flex: 1,
        alignItems: 'center',
        marginHorizontal: 16,
    },
    categoryTitle: {
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 2,
    },
    pageIndicator: {
        fontSize: 14,
        fontWeight: '500',
        textAlign: 'center',
    },
    jumpButton: {
        marginTop: 6,
        paddingVertical: 4,
        paddingHorizontal: 12,
        borderRadius: 6,
        alignSelf: 'center',
    },
    jumpButtonText: {
        fontSize: 12,
        fontWeight: '500',
    },
    progressBarContainer: {
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderBottomWidth: 1,
    },
    progressBarBackground: {
        height: 4,
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 2,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardContainer: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderTopWidth: 1,
    },
    footerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 16,
        gap: 8,
    },
    footerButtonDisabled: {
        opacity: 0.5,
    },
    footerButtonText: {
        fontSize: 16,
        fontWeight: '500',
    },
    loadingText: {
        fontSize: 16,
    },
    errorText: {
        fontSize: 16,
    },
    backButton: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
    },
    backButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
});

export default FlashCardScreen;


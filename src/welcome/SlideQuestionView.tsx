import React, { useRef, useEffect, useState, useCallback } from 'react';
import { View, Animated, Dimensions, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../shared/contexts/ThemeContext';
import QuestionCard from '../search/QuestionCard';
import { FormattedText } from '../shared/components';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;
const VELOCITY_THRESHOLD = 400;

export interface SlideQuestionViewProps {
    question: any; // Using any to support both Question types (should be unified)
    currentIndex: number;
    totalCount: number;
    title?: string; // For category title
    onNext: () => void;
    onPrevious: () => void;
    hasNext: boolean;
    hasPrevious: boolean;
}

const SlideQuestionView: React.FC<SlideQuestionViewProps> = ({
    question,
    currentIndex,
    totalCount,
    title,
    onNext,
    onPrevious,
    hasNext,
    hasPrevious
}) => {
    const { theme } = useTheme();
    const translateX = useRef(new Animated.Value(0)).current;
    const opacity = useRef(new Animated.Value(1)).current;
    const scrollViewRef = useRef<ScrollView>(null);
    const [isAnimating, setIsAnimating] = useState(false);

    // Track the question ID to detect changes for animation reset
    const prevQuestionIdRef = useRef<string | null>(null);

    console.log('[SlideQuestionView] Render', {
        questionId: question?.id,
        currentIndex,
        totalCount,
        hasNext,
        hasPrevious,
        isAnimating
    });

    // Reset scroll when question changes
    const handleScrollReset = useCallback(() => {
        console.log('[SlideQuestionView] Resetting scroll position');
        scrollViewRef.current?.scrollTo({ y: 0, animated: false });
    }, []);

    // Effect to handle animation reset when question changes
    useEffect(() => {
        const currentId = question?.id;
        if (currentId !== prevQuestionIdRef.current) {
            console.log('[SlideQuestionView] Question changed from', prevQuestionIdRef.current, 'to', currentId);

            // If we were animating, this is likely the completion of the state update
            if (isAnimating) {
                console.log('[SlideQuestionView] Resetting animation values after question change');
                translateX.setValue(0);
                opacity.setValue(1);
                setIsAnimating(false);
                handleScrollReset();
            } else {
                // Initial load or external update
                translateX.setValue(0);
                opacity.setValue(1);
            }
            prevQuestionIdRef.current = currentId;
        }
    }, [question?.id, isAnimating, handleScrollReset, translateX, opacity]);

    const animateTransition = useCallback((direction: 'left' | 'right', callback: () => void) => {
        if (isAnimating) {
            console.log('[SlideQuestionView] Already animating, ignoring');
            return;
        }

        console.log('[SlideQuestionView] Starting animation', direction);
        setIsAnimating(true);

        Animated.parallel([
            Animated.timing(translateX, {
                toValue: direction === 'left' ? -SCREEN_WIDTH : SCREEN_WIDTH,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.timing(opacity, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            })
        ]).start(() => {
            console.log('[SlideQuestionView] Animation finished, calling callback');
            callback();
            // Note: We do NOT reset animation here. We wait for the prop change in useEffect.
            // This ensures the old question stays hidden until the new one is ready.
        });
    }, [isAnimating, translateX, opacity]);

    const handleNextPress = useCallback(() => {
        if (hasNext) {
            animateTransition('left', onNext);
        }
    }, [hasNext, animateTransition, onNext]);

    const handlePreviousPress = useCallback(() => {
        if (hasPrevious) {
            animateTransition('right', onPrevious);
        }
    }, [hasPrevious, animateTransition, onPrevious]);

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
            const shouldNavigate = Math.abs(translationX) > SWIPE_THRESHOLD || Math.abs(velocityX) > VELOCITY_THRESHOLD;

            if (shouldNavigate) {
                if (translationX > 0 && hasPrevious) {
                    handlePreviousPress();
                } else if (translationX < 0 && hasNext) {
                    handleNextPress();
                } else {
                    // Snap back if navigation is not possible
                    Animated.parallel([
                        Animated.spring(translateX, {
                            toValue: 0,
                            useNativeDriver: true,
                            tension: 50,
                            friction: 8,
                            restDisplacementThreshold: 0.01,
                            restSpeedThreshold: 0.01,
                        }),
                        Animated.spring(opacity, {
                            toValue: 1,
                            useNativeDriver: true,
                            tension: 50,
                            friction: 8,
                            restDisplacementThreshold: 0.01,
                            restSpeedThreshold: 0.01,
                        })
                    ]).start();
                }
            } else {
                // Snap back
                Animated.parallel([
                    Animated.spring(translateX, {
                        toValue: 0,
                        useNativeDriver: true,
                        tension: 50,
                        friction: 8,
                        restDisplacementThreshold: 0.01,
                        restSpeedThreshold: 0.01,
                    }),
                    Animated.spring(opacity, {
                        toValue: 1,
                        useNativeDriver: true,
                        tension: 50,
                        friction: 8,
                        restDisplacementThreshold: 0.01,
                        restSpeedThreshold: 0.01,
                    })
                ]).start();
            }
        });

    if (!question) {
        console.warn('[SlideQuestionView] No question provided');
        return null;
    }

    // Helper to get text safely
    const getQuestionText = (q: any) => q.question || '';
    const getExplanationText = (q: any) => q.explanation || '';

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            {/* Navigation Bar */}
            <View style={[styles.navigationBar, { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.divider }]}>
                <TouchableOpacity
                    style={styles.navButton}
                    onPress={handlePreviousPress}
                    disabled={!hasPrevious}
                >
                    <Ionicons
                        name="chevron-back"
                        size={24}
                        color={!hasPrevious ? theme.colors.textMuted : theme.colors.primary}
                    />
                </TouchableOpacity>
                <View style={styles.navigationInfo}>
                    {title && (
                        <FormattedText style={[styles.categoryTitle, { color: theme.colors.text }]}>
                            {title}
                        </FormattedText>
                    )}
                    <FormattedText style={[styles.pageIndicator, { color: theme.colors.textSecondary }]}>
                        {currentIndex + 1} / {totalCount}
                    </FormattedText>
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

            {/* Content */}
            <GestureDetector gesture={panGesture}>
                <Animated.View
                    style={[
                        styles.content,
                        {
                            transform: [{ translateX }],
                            opacity: opacity
                        }
                    ]}
                >
                    <ScrollView
                        ref={scrollViewRef}
                        style={styles.scrollView}
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={true}
                        bounces={true}
                    >
                        {question && (
                            <QuestionCard
                                key={question.id} // Force remount on question change
                                id={question.id}
                                question={getQuestionText(question)}
                                explanation={getExplanationText(question)}
                                image={question.image || null}
                                alwaysExpanded={true}
                            />
                        )}
                    </ScrollView>
                </Animated.View>
            </GestureDetector>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    navigationBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        zIndex: 1,
    },
    navButton: {
        padding: 10,
    },
    navigationInfo: {
        flex: 1,
        alignItems: 'center',
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
    content: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 40,
    },
});

export default SlideQuestionView;

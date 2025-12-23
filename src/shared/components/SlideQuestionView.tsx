import React, { useRef, useEffect, useState, useCallback } from 'react';
import { View, Animated, Dimensions, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useTheme } from '../contexts/ThemeContext';
import { useIcon3D } from '../hooks';
import QuestionCard from './QuestionCard';
import FormattedText from './FormattedText';
import Icon3D from './Icon3D';
import { createLogger } from '../utils/logger';

const logger = createLogger('SlideQuestionView');
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;
const VELOCITY_THRESHOLD = 400;

export interface SlideQuestionViewProps {
    question: any;
    currentIndex: number;
    totalCount: number;
    title?: string;
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
    const { getIcon } = useIcon3D();
    const translateX = useRef(new Animated.Value(0)).current;
    const opacity = useRef(new Animated.Value(1)).current;
    const scrollViewRef = useRef<ScrollView>(null);
    const [isAnimating, setIsAnimating] = useState(false);

    const chevronBackIcon = getIcon('chevronBack');
    const chevronForwardIcon = getIcon('chevronForward');

    // Track the question ID to detect changes for animation reset
    const prevQuestionIdRef = useRef<string | null>(null);

    // Reset scroll when question changes
    const handleScrollReset = useCallback(() => {
        scrollViewRef.current?.scrollTo({ y: 0, animated: false });
    }, []);

    // Effect to handle animation reset when question changes
    useEffect(() => {
        const currentId = question?.id;
        if (currentId !== prevQuestionIdRef.current) {
            if (isAnimating) {
                translateX.setValue(0);
                opacity.setValue(1);
                setIsAnimating(false);
                handleScrollReset();
            } else {
                translateX.setValue(0);
                opacity.setValue(1);
            }
            prevQuestionIdRef.current = currentId;
        }
    }, [question?.id, isAnimating, handleScrollReset, translateX, opacity]);

    const animateTransition = useCallback((direction: 'left' | 'right', callback: () => void) => {
        if (isAnimating) return;

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
            callback();
        });
    }, [isAnimating, translateX, opacity]);

    const handleNextPress = useCallback(() => {
        if (hasNext) animateTransition('left', onNext);
    }, [hasNext, animateTransition, onNext]);

    const handlePreviousPress = useCallback(() => {
        if (hasPrevious) animateTransition('right', onPrevious);
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
                        })
                    ]).start();
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
                    })
                ]).start();
            }
        });

    if (!question) return null;

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            {/* Navigation Bar */}
            <View style={[styles.navigationBar, { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.divider }]}>
                <TouchableOpacity
                    style={styles.navButton}
                    onPress={handlePreviousPress}
                    disabled={!hasPrevious}
                >
                    <Icon3D
                        name={chevronBackIcon.name}
                        size={20}
                        color={!hasPrevious ? theme.colors.textMuted : theme.colors.primary}
                        variant={hasPrevious ? chevronBackIcon.variant : 'default'}
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
                    <Icon3D
                        name={chevronForwardIcon.name}
                        size={20}
                        color={!hasNext ? theme.colors.textMuted : theme.colors.primary}
                        variant={hasNext ? chevronForwardIcon.variant : 'default'}
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
                        <QuestionCard
                            key={question.id}
                            id={question.id}
                            question={question.question}
                            explanation={question.explanation}
                            image={question.image || null}
                            alwaysExpanded={true}
                        />
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

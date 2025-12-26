import React, { useRef, useEffect, useCallback } from 'react';
import { StyleSheet, View, TouchableOpacity, Pressable, Animated, Dimensions, ScrollView, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../shared/contexts/ThemeContext';
import { FormattedText } from '../../shared/components';
import { formatExplanation } from '../../shared/utils/questionUtils';
import { normalizeForComparison } from '../../shared/utils/textNormalization';
import { sharedStyles } from '../../shared/utils';
import { useFirebaseImage } from '../../shared/hooks/useFirebaseImage';
import type { FormationQuestion } from '../types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CARD_PADDING = 20;
const CARD_HEIGHT = Math.min(SCREEN_HEIGHT * 0.6, 600);

interface FlashCardProps {
    question: FormationQuestion;
    isFlipped: boolean;
    onFlip: () => void;
}

const FlashCard: React.FC<FlashCardProps> = ({ question, isFlipped, onFlip }) => {
    const { theme } = useTheme();

    useEffect(() => {
        // Reset scroll position when question changes
        scrollViewRef.current?.scrollTo({ y: 0, animated: false });
    }, [question.id]);

    const flipAnimation = useRef(new Animated.Value(0)).current;
    const prevQuestionIdRef = useRef<number | null>(null);
    const animationRef = useRef<Animated.CompositeAnimation | null>(null);
    const { imageSource, isLoading: imageLoading, error: imageError } = useFirebaseImage(question.image);
    const scrollViewRef = useRef<ScrollView>(null);

    const resetAnimation = useCallback(() => {
        if (animationRef.current) {
            animationRef.current.stop();
            animationRef.current = null;
        }
        flipAnimation.setValue(0);
    }, [flipAnimation]);

    useEffect(() => {
        if (prevQuestionIdRef.current !== question.id) {
            prevQuestionIdRef.current = question.id;
            resetAnimation();
        }
    }, [question.id, resetAnimation]);

    useEffect(() => {
        if (animationRef.current) {
            animationRef.current.stop();
        }
        const anim = Animated.spring(flipAnimation, {
            toValue: isFlipped ? 1 : 0,
            friction: 8,
            tension: 10,
            useNativeDriver: true,
        });
        animationRef.current = anim;
        anim.start(() => {
            animationRef.current = null;
        });
    }, [isFlipped, flipAnimation]);

    const frontInterpolate = flipAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '180deg'],
    });

    const backInterpolate = flipAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: ['180deg', '360deg'],
    });

    const frontOpacity = flipAnimation.interpolate({
        inputRange: [0, 0.5, 0.5, 1],
        outputRange: [1, 1, 0, 0],
    });

    const backOpacity = flipAnimation.interpolate({
        inputRange: [0, 0.5, 0.5, 1],
        outputRange: [0, 0, 1, 1],
    });

    const questionText = question.question || '';
    // Remove markdown image links from explanation if image is displayed separately
    let explanationText = question.explanation || '';

    // Robust Deduplication Logic
    const normalizedQuestion = normalizeForComparison(questionText);

    // Split by newline to check the first paragraph/line
    const lines = explanationText.split('\n');
    if (lines.length > 0) {
        const firstLine = lines[0];
        const normalizedFirstLine = normalizeForComparison(firstLine);

        // If the first line is substantially similar to the question (contains it or is contained by it)
        // or effectively equal, remove it.
        if (normalizedFirstLine.length > 0 &&
            (normalizedFirstLine.includes(normalizedQuestion) || normalizedQuestion.includes(normalizedFirstLine))) {
            explanationText = lines.slice(1).join('\n').trim();
        }
    }

    explanationText = formatExplanation(explanationText);

    return (
        <View style={styles.container}>
            {/* Front Card */}
            <View
                style={styles.cardContainer}
                pointerEvents={isFlipped ? 'none' : 'auto'}
            >
                <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={onFlip}
                    style={styles.cardTouchable}
                >
                    <Animated.View
                        style={[
                            styles.card,
                            styles.frontCard,
                            {
                                backgroundColor: theme.colors.card,
                                borderColor: theme.colors.border,
                                transform: [{ rotateY: frontInterpolate }],
                                opacity: frontOpacity,
                            },
                        ]}
                    >
                        <View style={styles.cardContent}>
                            <View style={[styles.badge, { backgroundColor: theme.colors.primary + '15' }]}>
                                <Ionicons
                                    name="help-circle"
                                    size={20}
                                    color={theme.colors.primary}
                                />
                                <FormattedText style={[styles.badgeText, { color: theme.colors.primary }]}>
                                    Question
                                </FormattedText>
                            </View>
                            <FormattedText style={[styles.frontQuestionText, { color: theme.colors.text }]}>
                                {questionText}
                            </FormattedText>
                            <View style={styles.flipHint}>
                                <Ionicons
                                    name="refresh"
                                    size={20}
                                    color={theme.colors.textMuted}
                                />
                                <FormattedText style={[styles.flipHintText, { color: theme.colors.textMuted }]}>
                                    Appuyez pour voir la réponse
                                </FormattedText>
                            </View>
                        </View>
                    </Animated.View>
                </TouchableOpacity>
            </View>

            {/* Back Card */}
            <View
                style={styles.cardContainer}
                pointerEvents={isFlipped ? 'auto' : 'none'}
            >
                <Animated.View
                    style={[
                        styles.card,
                        styles.backCard,
                        {
                            backgroundColor: theme.colors.card,
                            borderColor: theme.colors.border,
                            transform: [{ rotateY: backInterpolate }],
                            opacity: backOpacity,
                        },
                    ]}
                >
                    <View style={styles.backCardContent}>

                        <Pressable onPress={onFlip} style={styles.headerPressable}>
                            <View style={[styles.badge, { backgroundColor: theme.colors.success + '15' }]}>
                                <Ionicons
                                    name="checkmark-circle"
                                    size={20}
                                    color={theme.colors.success}
                                />
                                <FormattedText style={[styles.badgeText, { color: theme.colors.success }]}>
                                    Réponse
                                </FormattedText>
                            </View>
                        </Pressable>

                        <View style={styles.scrollContainer}>
                            <ScrollView
                                ref={scrollViewRef}
                                style={styles.explanationScrollView}
                                contentContainerStyle={styles.explanationScrollContent}
                                showsVerticalScrollIndicator={false}
                                showsHorizontalScrollIndicator={false}
                                persistentScrollbar={false}
                                nestedScrollEnabled={true}
                                bounces={true}
                                alwaysBounceVertical={false}
                                scrollEnabled={true}
                                removeClippedSubviews={false}
                                scrollEventThrottle={16}
                            >
                                <Pressable onPress={onFlip} style={styles.contentPressable}>
                                    {/* Question Context */}
                                    <View style={styles.explanationTextContainer}>
                                        <FormattedText style={[styles.contextQuestionText, { color: theme.colors.primary }]}>
                                            {questionText}
                                        </FormattedText>
                                        <View style={[styles.separator, { backgroundColor: theme.colors.border }]} />
                                    </View>

                                    {/* Display image if available */}
                                    {question.image && (
                                        <>
                                            {imageLoading && (
                                                <View style={[styles.imageLoading, { backgroundColor: theme.colors.surface }]}>
                                                    <ActivityIndicator size="large" color={theme.colors.primary} />
                                                </View>
                                            )}
                                            {!imageLoading && imageSource && !imageError && (
                                                <View style={[styles.imageContainer, { borderColor: theme.colors.border }]}>
                                                    <Image
                                                        source={imageSource}
                                                        style={styles.image}
                                                        resizeMode="contain"
                                                    />
                                                </View>
                                            )}
                                            {!imageLoading && imageError && (
                                                <View style={[styles.imageFallback, { backgroundColor: theme.colors.surface }]}>
                                                    <Ionicons name="image-outline" size={32} color={theme.colors.textMuted} />
                                                </View>
                                            )}
                                        </>
                                    )}

                                    <View style={styles.explanationTextContainer}>
                                        <FormattedText
                                            style={[styles.explanationText, { color: theme.colors.text }]}
                                        >
                                            {explanationText}
                                        </FormattedText>
                                    </View>
                                </Pressable>
                            </ScrollView>
                        </View>

                        <TouchableOpacity
                            onPress={onFlip}
                            style={styles.flipHint}
                            activeOpacity={0.7}
                        >
                            <Ionicons
                                name="refresh"
                                size={20}
                                color={theme.colors.textMuted}
                            />
                            <FormattedText style={[styles.flipHintText, { color: theme.colors.textMuted }]}>
                                Appuyez pour voir la question
                            </FormattedText>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: SCREEN_WIDTH - CARD_PADDING * 2,
        height: CARD_HEIGHT,
        alignSelf: 'center',
    },
    cardContainer: {
        position: 'absolute',
        width: '100%',
        height: '100%',
    },
    cardTouchable: {
        width: '100%',
        height: '100%',
    },
    card: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        borderRadius: 16,
        borderWidth: 1,
        padding: 24,
        ...sharedStyles.mediumShadow,
        backfaceVisibility: 'hidden',
    },
    frontCard: {
        justifyContent: 'center',
    },
    backCard: {
        justifyContent: 'flex-start',
    },
    cardContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backCardContent: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        width: '100%',
    },
    badge: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginBottom: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    badgeText: {
        fontSize: 14,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    frontQuestionText: {
        fontSize: 22,
        fontWeight: '700',
        textAlign: 'center',
        lineHeight: 32,
        marginBottom: 24,
    },
    contextQuestionText: {
        fontSize: 16,
        fontWeight: '700',
        lineHeight: 24,
        marginBottom: 12,
        opacity: 0.9,
    },
    separator: {
        height: 1,
        width: '100%',
        marginBottom: 16,
        opacity: 0.2,
    },
    scrollContainer: {
        flex: 1,
        width: '100%',
        position: 'relative',
    },
    explanationScrollView: {
        flex: 1,
        width: '100%',
    },
    explanationScrollContent: {
        paddingBottom: 16,
        flexGrow: 1,
    },
    headerPressable: {
        width: '100%',
        alignItems: 'center',
        marginBottom: 8,
    },
    contentPressable: {
        flex: 1,
    },
    explanationTextContainer: {
        width: '100%',
        flexShrink: 0,
    },
    explanationText: {
        fontFamily: 'San Francisco',
        fontSize: 17, // Slightly larger for better readability
        lineHeight: 28, // ~1.6x line height
        color: '#2c3e50', // Dark grey/blue instead of pure black for softer contrast
        flexShrink: 0,
        marginBottom: 8,
    },
    imageContainer: {
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 16,
        borderWidth: 1,
        backgroundColor: '#f5f5f5',
    },
    image: {
        width: '100%',
        height: 200,
    },
    hiddenImage: {
        opacity: 0,
    },
    imageLoading: {
        width: '100%',
        height: 200,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 12,
    },
    imageFallback: {
        width: '100%',
        height: 120,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        borderRadius: 12,
    },
    flipHint: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 16,
        gap: 8,
        opacity: 0.7,
    },
    flipHintText: {
        fontSize: 13,
        fontWeight: '500',
    },
});

export default FlashCard;


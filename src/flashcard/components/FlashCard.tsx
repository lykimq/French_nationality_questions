import React, { useRef, useEffect, useCallback } from 'react';
import { StyleSheet, View, TouchableOpacity, Pressable, Animated, Dimensions, ScrollView, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../shared/contexts/ThemeContext';
import { FormattedText } from '../../shared/components';
import { formatExplanation } from '../../shared/utils/questionUtils';
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
    const [contentHeight, setContentHeight] = React.useState(0);
    const [scrollViewHeight, setScrollViewHeight] = React.useState(0);
    const [scrollOffset, setScrollOffset] = React.useState(0);

    // Derived state for scrollability with buffer
    const isScrollable = contentHeight > scrollViewHeight + 1;

    useEffect(() => {
        // Reset scroll state when question changes
        setScrollOffset(0);
        setContentHeight(0);
    }, [question.id]);

    const handleScroll = (event: any) => {
        const { contentOffset } = event.nativeEvent;
        setScrollOffset(contentOffset.y);
    };

    const handleContentSizeChange = (_contentWidth: number, contentHeight: number) => {
        setContentHeight(contentHeight);
    };

    const handleLayout = (event: any) => {
        const { height } = event.nativeEvent.layout;
        setScrollViewHeight(height);
    };

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
            if (isFlipped) {
                // Flash scroll indicators after animation completes
                scrollViewRef.current?.flashScrollIndicators();
            }
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
    if (question.image) {
        // Remove markdown image links like [Voir l'image](pics/xxx.png)
        explanationText = explanationText.replace(/\[Voir l'image\]\([^)]+\)/g, '').trim();
    }

    // Remove repeated question from explanation if present
    if (explanationText.trim().startsWith(questionText.trim())) {
        explanationText = explanationText.substring(questionText.length).trim();
    }

    explanationText = formatExplanation(explanationText);

    // Calculate scrollbar thumb metrics
    let thumbHeight = 0;
    let thumbTop = 0;

    if (isScrollable && contentHeight > 0 && scrollViewHeight > 0) {
        // Calculate proportional height
        thumbHeight = (scrollViewHeight / contentHeight) * scrollViewHeight;
        // Ensure minimum thumb height
        thumbHeight = Math.max(thumbHeight, 30);

        // Calculate position
        const maxScrollOffset = contentHeight - scrollViewHeight;
        // Avoid division by zero
        if (maxScrollOffset > 0) {
            const scrollRatio = scrollOffset / maxScrollOffset;
            const maxThumbTop = scrollViewHeight - thumbHeight;
            thumbTop = scrollRatio * maxThumbTop;

            // Clamp values
            thumbTop = Math.max(0, Math.min(thumbTop, maxThumbTop));
        }
    }

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
                                key={question.id}
                                ref={scrollViewRef}
                                style={styles.explanationScrollView}
                                contentContainerStyle={styles.explanationScrollContent}
                                showsVerticalScrollIndicator={false}
                                persistentScrollbar={false}
                                nestedScrollEnabled={true}
                                bounces={true}
                                alwaysBounceVertical={false}
                                scrollEnabled={true}
                                removeClippedSubviews={false}
                                onScroll={handleScroll}
                                onContentSizeChange={handleContentSizeChange}
                                onLayout={handleLayout}
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
                                        // Removed numberOfLines={0} to allow full text display
                                        >
                                            {explanationText}
                                        </FormattedText>
                                    </View>
                                </Pressable>
                            </ScrollView>

                            {/* Custom Scrollbar */}
                            {isScrollable && (
                                <View style={[styles.customScrollbarTrack]}>
                                    <View
                                        style={[
                                            styles.customScrollbarThumb,
                                            {
                                                height: thumbHeight,
                                                top: thumbTop,
                                                backgroundColor: theme.colors.textMuted + '80' // Semi-transparent
                                            }
                                        ]}
                                    />
                                </View>
                            )}
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
        paddingRight: 6,
    },
    explanationScrollView: {
        flex: 1,
        width: '100%',
    },
    explanationScrollContent: {
        paddingBottom: 16,
        paddingHorizontal: 4,
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
        fontSize: 16,
        lineHeight: 24,
        textAlign: 'justify',
        flexShrink: 0,
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
    customScrollbarTrack: {
        position: 'absolute',
        right: -4,
        top: 0,
        bottom: 0,
        width: 4,
        backgroundColor: 'transparent',
    },
    customScrollbarThumb: {
        width: 4,
        borderRadius: 2,
        position: 'absolute',
        right: 0,
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


import React, { useRef, useEffect, useCallback } from 'react';
import { StyleSheet, View, TouchableOpacity, Animated, Dimensions, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../shared/contexts/ThemeContext';
import { FormattedText } from '../../shared/components';
import { formatExplanation } from '../../shared/utils/questionUtils';
import { sharedStyles } from '../../shared/utils';
import type { FormationQuestion } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_PADDING = 20;

interface FlashCardProps {
    question: FormationQuestion;
    isFlipped: boolean;
    onFlip: () => void;
}

const FlashCard: React.FC<FlashCardProps> = ({ question, isFlipped, onFlip }) => {
    const { theme } = useTheme();
    const flipAnimation = useRef(new Animated.Value(0)).current;
    const prevQuestionIdRef = useRef<number | null>(null);
    const animationRef = useRef<Animated.CompositeAnimation | null>(null);

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
    const explanationText = formatExplanation(question.explanation || '');

    return (
        <View style={styles.container}>
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
                        <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary + '15' }]}>
                            <Ionicons
                                name="help-circle"
                                size={32}
                                color={theme.colors.primary}
                            />
                        </View>
                        <FormattedText style={[styles.label, { color: theme.colors.textSecondary }]}>
                            Question
                        </FormattedText>
                        <FormattedText style={[styles.questionText, { color: theme.colors.text }]}>
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
                    <View style={styles.cardContent}>
                        <View style={[styles.iconContainer, { backgroundColor: theme.colors.success + '15' }]}>
                            <Ionicons
                                name="checkmark-circle"
                                size={32}
                                color={theme.colors.success}
                            />
                        </View>
                        <FormattedText style={[styles.label, { color: theme.colors.textSecondary }]}>
                            Réponse
                        </FormattedText>
                        <ScrollView
                            style={styles.explanationScrollView}
                            contentContainerStyle={styles.explanationScrollContent}
                            showsVerticalScrollIndicator={true}
                        >
                            <FormattedText style={[styles.explanationText, { color: theme.colors.text }]}>
                                {explanationText}
                            </FormattedText>
                        </ScrollView>
                        <View style={styles.flipHint}>
                            <Ionicons
                                name="refresh"
                                size={20}
                                color={theme.colors.textMuted}
                            />
                            <FormattedText style={[styles.flipHintText, { color: theme.colors.textMuted }]}>
                                Appuyez pour voir la question
                            </FormattedText>
                        </View>
                    </View>
                </Animated.View>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: SCREEN_WIDTH - CARD_PADDING * 2,
        height: 400,
        alignSelf: 'center',
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
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 16,
    },
    questionText: {
        fontSize: 20,
        fontWeight: '600',
        textAlign: 'center',
        lineHeight: 28,
        marginBottom: 24,
    },
    explanationScrollView: {
        flex: 1,
        width: '100%',
    },
    explanationScrollContent: {
        paddingBottom: 8,
    },
    explanationText: {
        fontSize: 16,
        lineHeight: 24,
        textAlign: 'justify',
    },
    flipHint: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 16,
        gap: 8,
    },
    flipHintText: {
        fontSize: 12,
        fontStyle: 'italic',
    },
});

export default FlashCard;


import React, { useState, useRef } from 'react';
import { View, TouchableOpacity, Animated, Dimensions, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { useTheme } from '../../../shared/contexts/ThemeContext';
import { QuestionCard } from '../../search/components';
import { Question, QuestionSlideViewProps, MultiLangText } from '../../../types';
import { FormattedText } from '../../../shared/components';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25; // Reduced threshold for easier swipe
const VELOCITY_THRESHOLD = 400; // Reduced velocity threshold

const QuestionSlideView: React.FC<QuestionSlideViewProps> = ({ questions, language }) => {
    const { theme } = useTheme();
    const [currentIndex, setCurrentIndex] = useState(0);
    const translateX = useRef(new Animated.Value(0)).current;

    const navigateToPrevious = () => {
        if (currentIndex > 0) {
            Animated.timing(translateX, {
                toValue: SCREEN_WIDTH,
                duration: 200,
                useNativeDriver: true,
            }).start(() => {
                setCurrentIndex(currentIndex - 1);
                translateX.setValue(0);
            });
        }
    };

    const navigateToNext = () => {
        if (currentIndex < questions.length - 1) {
            Animated.timing(translateX, {
                toValue: -SCREEN_WIDTH,
                duration: 200,
                useNativeDriver: true,
            }).start(() => {
                setCurrentIndex(currentIndex + 1);
                translateX.setValue(0);
            });
        }
    };

    const panGesture = Gesture.Pan()
        .activeOffsetX([-10, 10])
        .failOffsetY([-20, 20])
        .onUpdate((event) => {
            translateX.setValue(event.translationX);
        })
        .onEnd((event) => {
            const { translationX, velocityX } = event;

            // Determine if the swipe was fast enough or far enough to trigger navigation
            const shouldNavigate = Math.abs(translationX) > SWIPE_THRESHOLD || Math.abs(velocityX) > VELOCITY_THRESHOLD;

            if (shouldNavigate) {
                if (translationX > 0 && currentIndex > 0) {
                    // Swipe right to go to previous
                    navigateToPrevious();
                } else if (translationX < 0 && currentIndex < questions.length - 1) {
                    // Swipe left to go to next
                    navigateToNext();
                } else {
                    // Snap back if we can't navigate
                    Animated.spring(translateX, {
                        toValue: 0,
                        useNativeDriver: true,
                        tension: 50,
                        friction: 8,
                        restDisplacementThreshold: 0.01,
                        restSpeedThreshold: 0.01,
                    }).start();
                }
            } else {
                // Snap back if the swipe wasn't far/fast enough
                Animated.spring(translateX, {
                    toValue: 0,
                    useNativeDriver: true,
                    tension: 50,
                    friction: 8,
                    restDisplacementThreshold: 0.01,
                    restSpeedThreshold: 0.01,
                }).start();
            }
        });

    const getLocalizedQuestion = (question: Question): string | MultiLangText => {
        if (language === 'vi') {
            // Check if question is already a MultiLangText object
            if (typeof question.question === 'object' && question.question !== null) {
                return question.question; // Already a MultiLangText object
            }
            // If it's a string, create MultiLangText object with question_vi
            else if ('question_vi' in question) {
                return {
                    fr: String(question.question || ''),
                    vi: String((question as any).question_vi || '')
                };
            }
        }
        return question.question || '';
    };

    const getLocalizedExplanation = (question: Question): string | MultiLangText => {
        if (language === 'vi') {
            // Check if explanation is already a MultiLangText object
            if (typeof question.explanation === 'object' && question.explanation !== null) {
                return question.explanation; // Already a MultiLangText object
            }
            // If it's a string, create MultiLangText object with explanation_vi
            else if ('explanation_vi' in question) {
                return {
                    fr: String(question.explanation || ''),
                    vi: String((question as any).explanation_vi || '')
                };
            }
        }
        return question.explanation || '';
    };

    const currentQuestion = questions[currentIndex];

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={[styles.navigationBar, { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.divider }]}>
                <TouchableOpacity
                    style={styles.navButton}
                    onPress={navigateToPrevious}
                    disabled={currentIndex === 0}
                >
                    <Ionicons
                        name="chevron-back"
                        size={24}
                        color={currentIndex === 0 ? theme.colors.textMuted : theme.colors.primary}
                    />
                </TouchableOpacity>
                <FormattedText style={[styles.pageIndicator, { color: theme.colors.textSecondary }]}>
                    {currentIndex + 1} / {questions.length}
                </FormattedText>
                <TouchableOpacity
                    style={styles.navButton}
                    onPress={navigateToNext}
                    disabled={currentIndex === questions.length - 1}
                >
                    <Ionicons
                        name="chevron-forward"
                        size={24}
                        color={currentIndex === questions.length - 1 ? theme.colors.textMuted : theme.colors.primary}
                    />
                </TouchableOpacity>
            </View>

            <GestureDetector gesture={panGesture}>
                <Animated.View
                    style={[
                        styles.content,
                        {
                            transform: [{ translateX }]
                        }
                    ]}
                >
                    <ScrollView
                        style={styles.scrollView}
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={true}
                        bounces={true}
                    >
                        <QuestionCard
                            key={currentQuestion.id}
                            id={currentQuestion.id}
                            question={getLocalizedQuestion(currentQuestion)}
                            explanation={getLocalizedExplanation(currentQuestion)}
                            image={('image' in currentQuestion ? (currentQuestion as any).image : null) as string | null | undefined}
                            language={language}
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
    pageIndicator: {
        fontSize: 16,
        fontWeight: '600',
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

export default QuestionSlideView;
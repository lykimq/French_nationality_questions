import React, { useState, useRef } from 'react';
import { View, TouchableOpacity, Animated, Dimensions, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PanGestureHandler, State, PanGestureHandlerStateChangeEvent } from 'react-native-gesture-handler';
import { useTheme } from '../contexts/ThemeContext';
import QuestionCard from './QuestionCard';
import { Question, QuestionSlideViewProps } from '../types';
import FormattedText from './FormattedText';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25; // Reduced threshold for easier swipe
const VELOCITY_THRESHOLD = 400; // Reduced velocity threshold

const QuestionSlideView: React.FC<QuestionSlideViewProps> = ({ questions, language }) => {
    const { theme } = useTheme();
    const [currentIndex, setCurrentIndex] = useState(0);
    const translateX = useRef(new Animated.Value(0)).current;
    const panRef = useRef(null);

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

    const onGestureEvent = Animated.event(
        [{ nativeEvent: { translationX: translateX } }],
        { useNativeDriver: true }
    );

    const onHandlerStateChange = (event: PanGestureHandlerStateChangeEvent) => {
        if (event.nativeEvent.oldState === State.ACTIVE) {
            const { translationX, velocityX } = event.nativeEvent;

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
        }
    };

    const getLocalizedQuestion = (question: Question) => {
        if (language === 'vi' && 'question_vi' in question) {
            return question.question_vi || question.question;
        }
        return question.question;
    };

    const getLocalizedExplanation = (question: Question) => {
        if (language === 'vi' && 'explanation_vi' in question) {
            return question.explanation_vi || question.explanation || '';
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

            <PanGestureHandler
                ref={panRef}
                onGestureEvent={onGestureEvent}
                onHandlerStateChange={onHandlerStateChange}
                activeOffsetX={[-10, 10]} // Start gesture recognition earlier
                failOffsetY={[-20, 20]} // Allow more vertical movement before failing
            >
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
                            image={currentQuestion.image || null}
                            language={language}
                            alwaysExpanded={true}
                        />
                    </ScrollView>
                </Animated.View>
            </PanGestureHandler>
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
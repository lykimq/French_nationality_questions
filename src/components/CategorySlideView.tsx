import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, Dimensions, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PanGestureHandler, State, PanGestureHandlerStateChangeEvent } from 'react-native-gesture-handler';
import { useTheme } from '../contexts/ThemeContext';
import QuestionCard from './QuestionCard';
import { MultiLangText } from '../contexts/LanguageContext';
import FormattedText from './FormattedText';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;
const VELOCITY_THRESHOLD = 400;

interface MultilingualQuestion {
    id: number;
    question: string;
    question_vi: string;
    explanation?: string;
    explanation_vi?: string;
    image?: string | null;
}

interface CategorySlideViewProps {
    categories: Array<{
        id: string;
        title: string;
        title_vi?: string;
        questions: MultilingualQuestion[];
    }>;
    language: 'fr' | 'vi';
}

const CategorySlideView: React.FC<CategorySlideViewProps> = ({ categories, language }) => {
    const { theme } = useTheme();
    const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const translateX = useRef(new Animated.Value(0)).current;
    const panRef = useRef(null);

    const currentCategory = categories[currentCategoryIndex];
    const currentQuestion = currentCategory?.questions[currentQuestionIndex];
    const totalQuestions = currentCategory?.questions.length || 0;

    const navigateToPrevious = () => {
        if (currentQuestionIndex > 0) {
            // Navigate to previous question in current category
            Animated.timing(translateX, {
                toValue: SCREEN_WIDTH,
                duration: 200,
                useNativeDriver: true,
            }).start(() => {
                setCurrentQuestionIndex(currentQuestionIndex - 1);
                translateX.setValue(0);
            });
        } else if (currentCategoryIndex > 0) {
            // Navigate to last question of previous category
            Animated.timing(translateX, {
                toValue: SCREEN_WIDTH,
                duration: 200,
                useNativeDriver: true,
            }).start(() => {
                setCurrentCategoryIndex(currentCategoryIndex - 1);
                setCurrentQuestionIndex(categories[currentCategoryIndex - 1].questions.length - 1);
                translateX.setValue(0);
            });
        }
    };

    const navigateToNext = () => {
        if (currentQuestionIndex < totalQuestions - 1) {
            // Navigate to next question in current category
            Animated.timing(translateX, {
                toValue: -SCREEN_WIDTH,
                duration: 200,
                useNativeDriver: true,
            }).start(() => {
                setCurrentQuestionIndex(currentQuestionIndex + 1);
                translateX.setValue(0);
            });
        } else if (currentCategoryIndex < categories.length - 1) {
            // Navigate to first question of next category
            Animated.timing(translateX, {
                toValue: -SCREEN_WIDTH,
                duration: 200,
                useNativeDriver: true,
            }).start(() => {
                setCurrentCategoryIndex(currentCategoryIndex + 1);
                setCurrentQuestionIndex(0);
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
            const shouldNavigate = Math.abs(translationX) > SWIPE_THRESHOLD || Math.abs(velocityX) > VELOCITY_THRESHOLD;

            if (shouldNavigate) {
                if (translationX > 0) {
                    navigateToPrevious();
                } else {
                    navigateToNext();
                }
            } else {
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

    const getLocalizedQuestion = (question: MultilingualQuestion): MultiLangText => {
        return {
            fr: question.question,
            vi: question.question_vi
        };
    };

    const getLocalizedExplanation = (question: MultilingualQuestion): MultiLangText => {
        return {
            fr: question.explanation || '',
            vi: question.explanation_vi || ''
        };
    };

    const getLocalizedTitle = (category: { title: string; title_vi?: string }) => {
        if (language === 'fr') {
            return category.title;
        } else {
            return category.title_vi ? `${category.title_vi}\n${category.title}` : category.title;
        }
    };

    const isPreviousDisabled = currentCategoryIndex === 0 && currentQuestionIndex === 0;
    const isNextDisabled = currentCategoryIndex === categories.length - 1 && currentQuestionIndex === totalQuestions - 1;

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={[styles.navigationBar, { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.divider }]}>
                <TouchableOpacity
                    style={styles.navButton}
                    onPress={navigateToPrevious}
                    disabled={isPreviousDisabled}
                >
                    <Ionicons
                        name="chevron-back"
                        size={24}
                        color={isPreviousDisabled ? theme.colors.textMuted : theme.colors.primary}
                    />
                </TouchableOpacity>
                <View style={styles.navigationInfo}>
                    <FormattedText style={[styles.categoryTitle, { color: theme.colors.text }]}>
                        {language === 'fr' ? currentCategory.title : currentCategory.title_vi || currentCategory.title}
                    </FormattedText>
                    <FormattedText style={[styles.pageIndicator, { color: theme.colors.textSecondary }]}>
                        {currentQuestionIndex + 1} / {totalQuestions}
                    </FormattedText>
                </View>
                <TouchableOpacity
                    style={styles.navButton}
                    onPress={navigateToNext}
                    disabled={isNextDisabled}
                >
                    <Ionicons
                        name="chevron-forward"
                        size={24}
                        color={isNextDisabled ? theme.colors.textMuted : theme.colors.primary}
                    />
                </TouchableOpacity>
            </View>

            <PanGestureHandler
                ref={panRef}
                onGestureEvent={onGestureEvent}
                onHandlerStateChange={onHandlerStateChange}
                activeOffsetX={[-10, 10]}
                failOffsetY={[-20, 20]}
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
                        {currentQuestion && (
                            <QuestionCard
                                key={currentQuestion.id}
                                id={currentQuestion.id}
                                question={getLocalizedQuestion(currentQuestion)}
                                explanation={getLocalizedExplanation(currentQuestion)}
                                image={currentQuestion.image}
                                language={language}
                                alwaysExpanded={true}
                            />
                        )}
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
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 40,
    },
});

export default CategorySlideView;
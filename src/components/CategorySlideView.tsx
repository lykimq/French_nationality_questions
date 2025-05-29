import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, Dimensions, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PanGestureHandler, State, PanGestureHandlerStateChangeEvent } from 'react-native-gesture-handler';
import QuestionCard from './QuestionCard';
import { MultiLangText } from '../contexts/LanguageContext';

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

    return (
        <View style={styles.container}>
            <View style={styles.navigationBar}>
                <TouchableOpacity
                    style={styles.navButton}
                    onPress={navigateToPrevious}
                    disabled={currentCategoryIndex === 0 && currentQuestionIndex === 0}
                >
                    <Ionicons
                        name="chevron-back"
                        size={24}
                        color={currentCategoryIndex === 0 && currentQuestionIndex === 0 ? '#ccc' : '#3F51B5'}
                    />
                </TouchableOpacity>
                <View style={styles.navigationInfo}>
                    <Text style={styles.categoryTitle}>{currentCategory ? getLocalizedTitle(currentCategory) : ''}</Text>
                    <Text style={styles.pageIndicator}>
                        {currentQuestionIndex + 1} / {totalQuestions}
                    </Text>
                </View>
                <TouchableOpacity
                    style={styles.navButton}
                    onPress={navigateToNext}
                    disabled={currentCategoryIndex === categories.length - 1 && currentQuestionIndex === totalQuestions - 1}
                >
                    <Ionicons
                        name="chevron-forward"
                        size={24}
                        color={currentCategoryIndex === categories.length - 1 && currentQuestionIndex === totalQuestions - 1 ? '#ccc' : '#3F51B5'}
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
        backgroundColor: '#F5F5F5',
    },
    navigationBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        zIndex: 1,
    },
    navigationInfo: {
        flex: 1,
        alignItems: 'center',
    },
    categoryTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#3F51B5',
        marginBottom: 4,
    },
    navButton: {
        padding: 10,
    },
    pageIndicator: {
        fontSize: 14,
        color: '#666',
        fontWeight: '600',
    },
    content: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        flexGrow: 1,
    }
});

export default CategorySlideView;
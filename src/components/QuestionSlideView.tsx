import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, Dimensions, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PanGestureHandler, State, PanGestureHandlerStateChangeEvent } from 'react-native-gesture-handler';
import QuestionCard from './QuestionCard';
import { Question } from '../types/questions';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;

interface QuestionSlideViewProps {
    questions: Question[];
    language: 'fr' | 'vi';
}

const QuestionSlideView: React.FC<QuestionSlideViewProps> = ({ questions, language }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const translateX = useRef(new Animated.Value(0)).current;
    const panRef = useRef(null);

    const navigateToPrevious = () => {
        if (currentIndex > 0) {
            Animated.timing(translateX, {
                toValue: SCREEN_WIDTH,
                duration: 0,
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
                duration: 0,
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
            const shouldNavigate = Math.abs(translationX) > SWIPE_THRESHOLD || Math.abs(velocityX) > 500;

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
                        tension: 40,
                        friction: 7
                    }).start();
                }
            } else {
                // Snap back if the swipe wasn't far/fast enough
                Animated.spring(translateX, {
                    toValue: 0,
                    useNativeDriver: true,
                    tension: 40,
                    friction: 7
                }).start();
            }
        }
    };

    const getLocalizedQuestion = (question: Question) => {
        if (language === 'vi' && 'question_vi' in question) {
            return question.question_vi;
        }
        return question.question;
    };

    const getLocalizedAnswer = (question: Question) => {
        if (language === 'vi' && 'answer_vi' in question) {
            return question.answer_vi;
        }
        return question.answer;
    };

    const currentQuestion = questions[currentIndex];

    return (
        <View style={styles.container}>
            <View style={styles.navigationBar}>
                <TouchableOpacity
                    style={styles.navButton}
                    onPress={navigateToPrevious}
                    disabled={currentIndex === 0}
                >
                    <Ionicons
                        name="chevron-back"
                        size={24}
                        color={currentIndex === 0 ? '#ccc' : '#3F51B5'}
                    />
                </TouchableOpacity>
                <Text style={styles.pageIndicator}>
                    {currentIndex + 1} / {questions.length}
                </Text>
                <TouchableOpacity
                    style={styles.navButton}
                    onPress={navigateToNext}
                    disabled={currentIndex === questions.length - 1}
                >
                    <Ionicons
                        name="chevron-forward"
                        size={24}
                        color={currentIndex === questions.length - 1 ? '#ccc' : '#3F51B5'}
                    />
                </TouchableOpacity>
            </View>

            <PanGestureHandler
                ref={panRef}
                onGestureEvent={onGestureEvent}
                onHandlerStateChange={onHandlerStateChange}
            >
                <Animated.View
                    style={[
                        styles.content,
                        {
                            transform: [{ translateX }]
                        }
                    ]}
                >
                    <QuestionCard
                        key={currentQuestion.id}
                        id={currentQuestion.id}
                        question={getLocalizedQuestion(currentQuestion)}
                        answer={getLocalizedAnswer(currentQuestion)}
                        explanation={currentQuestion.explanation || ''}
                        image={currentQuestion.image}
                        language={language}
                        alwaysExpanded={true}
                    />
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
    },
    navButton: {
        padding: 10,
    },
    pageIndicator: {
        fontSize: 16,
        color: '#666',
        fontWeight: '600',
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    }
});

export default QuestionSlideView;
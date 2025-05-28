import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PanGestureHandler, State, PanGestureHandlerGestureEvent } from 'react-native-gesture-handler';
import QuestionCard from './QuestionCard';
import { slideViewStyles as styles } from '../styles/questionViews';
import { Question } from '../types/questions';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface QuestionSlideViewProps {
    questions: Question[];
    language: 'fr' | 'vi';
}

const QuestionSlideView: React.FC<QuestionSlideViewProps> = ({ questions, language }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const translateX = new Animated.Value(0);

    const handleGestureEvent = Animated.event(
        [{ nativeEvent: { translationX: translateX } }],
        { useNativeDriver: true }
    );

    const handleStateChange = (event: PanGestureHandlerGestureEvent) => {
        if (event.nativeEvent.state === State.END) {
            const { translationX, velocityX } = event.nativeEvent;

            if (Math.abs(translationX) > SCREEN_WIDTH * 0.4 || Math.abs(velocityX) > 500) {
                const direction = translationX > 0 ? -1 : 1;
                const nextIndex = Math.max(0, Math.min(questions.length - 1, currentIndex + direction));

                if (nextIndex !== currentIndex) {
                    setCurrentIndex(nextIndex);
                }
            }

            Animated.spring(translateX, {
                toValue: 0,
                useNativeDriver: true,
            }).start();
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
            <View style={styles.navigationIndicator}>
                <TouchableOpacity
                    style={styles.navButton}
                    onPress={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
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
                    onPress={() => setCurrentIndex(Math.min(questions.length - 1, currentIndex + 1))}
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
                onGestureEvent={handleGestureEvent}
                onHandlerStateChange={handleStateChange}
            >
                <Animated.View
                    style={[
                        styles.slideContent,
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
                    />
                </Animated.View>
            </PanGestureHandler>
        </View>
    );
};

export default QuestionSlideView;
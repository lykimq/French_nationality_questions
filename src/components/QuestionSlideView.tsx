import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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

    const navigateToPrevious = () => {
        setCurrentIndex(Math.max(0, currentIndex - 1));
    };

    const navigateToNext = () => {
        setCurrentIndex(Math.min(questions.length - 1, currentIndex + 1));
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

            <View style={styles.slideContent}>
                <View style={styles.middleNavigation}>
                    <TouchableOpacity
                        style={[styles.middleNavButton, currentIndex === 0 && styles.middleNavButtonDisabled]}
                        onPress={navigateToPrevious}
                        disabled={currentIndex === 0}
                    >
                        <Ionicons
                            name="chevron-back-circle"
                            size={40}
                            color={currentIndex === 0 ? '#ccc' : '#3F51B5'}
                        />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.middleNavButton, currentIndex === questions.length - 1 && styles.middleNavButtonDisabled]}
                        onPress={navigateToNext}
                        disabled={currentIndex === questions.length - 1}
                    >
                        <Ionicons
                            name="chevron-forward-circle"
                            size={40}
                            color={currentIndex === questions.length - 1 ? '#ccc' : '#3F51B5'}
                        />
                    </TouchableOpacity>
                </View>

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
            </View>
        </View>
    );
};

export default QuestionSlideView;
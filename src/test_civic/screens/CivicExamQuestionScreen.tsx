import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    StyleSheet,
    View,
    ScrollView,
    StatusBar,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useTheme } from '../../shared/contexts/ThemeContext';
import { useCivicExam } from '../hooks/useCivicExam';
import { FormattedText } from '../../shared/components';
import { sharedStyles } from '../../shared/utils';
import { CIVIC_EXAM_CONFIG } from '../constants/civicExamConstants';
import { getCivicExamQuestionText, getCivicExamExplanationText } from '../utils/civicExamQuestionUtils';
import { useTimer } from '../hooks/useTimer';
import { ExamHeader } from '../components/ExamHeader';
import { OptionButton } from '../components/OptionButton';
import { ExamFeedback } from '../components/ExamFeedback';
import { createLogger } from '../../shared/utils/logger';
import type { CivicExamStackParamList, CivicExamQuestion } from '../types';
import type { TestAnswer } from '../../test/types';

const logger = createLogger('CivicExamQuestionScreen');
type CivicExamQuestionScreenNavigationProp = NativeStackNavigationProp<CivicExamStackParamList>;

const CivicExamQuestionScreen = () => {
    const navigation = useNavigation<CivicExamQuestionScreenNavigationProp>();
    const { theme, themeMode } = useTheme();
    const {
        currentSession,
        currentQuestionIndex,
        getCurrentQuestion,
        submitAnswer,
        goToNextQuestion,
    } = useCivicExam();

    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [answerSubmitted, setAnswerSubmitted] = useState(false);
    const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null);
    const [questionStartTime, setQuestionStartTime] = useState<Date>(new Date());
    const previousQuestionIndexRef = useRef<number>(-1);

    const isExamMode = currentSession?.mode === 'civic_exam_naturalization';
    const isPracticeMode = currentSession?.isPracticeMode || false;

    const handleTimeUp = useCallback(() => {
        Alert.alert(
            'Temps écoulé',
            'Le temps est écoulé. Vous serez redirigé vers la révision.',
            [{ text: 'OK', onPress: () => navigation.navigate('CivicExamReview') }]
        );
    }, [navigation]);

    const { timeLeft, formattedTime } = useTimer({
        initialTime: CIVIC_EXAM_CONFIG.TIME_LIMIT_SECONDS,
        isActive: isExamMode && !!currentSession,
        onTimeUp: handleTimeUp
    });

    const currentQuestion = getCurrentQuestion() as (CivicExamQuestion & {
        options?: string[];
        correctAnswer?: number;
    }) | null;

    // Reset selected answer when question changes
    useEffect(() => {
        if (!currentQuestion || previousQuestionIndexRef.current === currentQuestionIndex) return;

        previousQuestionIndexRef.current = currentQuestionIndex;
        setSelectedAnswer(null);
        setAnswerSubmitted(false);
        setIsAnswerCorrect(null);
        setQuestionStartTime(new Date());
    }, [currentQuestionIndex, currentQuestion]);

    // Check if session is completed
    useEffect(() => {
        if (!currentSession || currentSession.isCompleted) {
            navigation.navigate('CivicExamHome');
        }
    }, [currentSession, navigation]);

    const handleAnswerSelect = async (index: number) => {
        if (!currentQuestion || answerSubmitted) return;

        setSelectedAnswer(index);

        if (isPracticeMode) {
            const isCorrect = currentQuestion.correctAnswer === index;
            setIsAnswerCorrect(isCorrect);
            setAnswerSubmitted(true);

            try {
                const timeSpent = Math.floor((new Date().getTime() - questionStartTime.getTime()) / 1000);
                await submitAnswer({
                    questionId: currentQuestion.id,
                    isCorrect,
                    userAnswer: index.toString(),
                    timeSpent,
                    timestamp: new Date(),
                }, false);
            } catch (error) {
                logger.error('Error submitting practice answer:', error);
            }
        }
    };

    const handleNextQuestion = () => {
        if (!currentSession) return;

        if (isPracticeMode) {
            if (currentQuestionIndex < currentSession.totalQuestions - 1) {
                goToNextQuestion();
            } else {
                navigation.navigate('CivicExamReview');
            }
        }
    };

    const handleSubmitAnswer = async () => {
        if (selectedAnswer === null || !currentQuestion || !currentSession) return;

        if (!isPracticeMode) {
            try {
                const timeSpent = Math.floor((new Date().getTime() - questionStartTime.getTime()) / 1000);
                const isCorrect = currentQuestion.correctAnswer === selectedAnswer;

                await submitAnswer({
                    questionId: currentQuestion.id,
                    isCorrect,
                    userAnswer: selectedAnswer.toString(),
                    timeSpent,
                    timestamp: new Date(),
                });

                if (currentQuestionIndex >= currentSession.totalQuestions - 1) {
                    navigation.navigate('CivicExamReview');
                }
            } catch (error) {
                logger.error('Error submitting exam answer:', error);
                Alert.alert('Erreur', 'Erreur lors de la soumission de la réponse');
            }
        }
    };

    if (!currentSession || !currentQuestion) {
        return (
            <View style={[styles.container, { backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <FormattedText style={[styles.loadingText, { color: theme.colors.textMuted, marginTop: 16 }]}>
                    Chargement...
                </FormattedText>
            </View>
        );
    }

    const progress = ((currentQuestionIndex + 1) / currentSession.totalQuestions) * 100;
    const options = currentQuestion.options || [];

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <StatusBar barStyle={themeMode === 'dark' ? 'light-content' : 'dark-content'} />

            <SafeAreaView style={{ flex: 1 }} edges={['top']}>
                <ExamHeader
                    currentQuestionIndex={currentQuestionIndex}
                    totalQuestions={currentSession.totalQuestions}
                    timeLeft={timeLeft}
                    formattedTime={formattedTime}
                    progress={progress}
                />

                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.contentContainer}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={[styles.questionCard, { backgroundColor: theme.colors.card }]}>
                        <View style={styles.questionHeader}>
                            <View style={[styles.questionNumberBadge, { backgroundColor: theme.colors.primary }]}>
                                <FormattedText style={[styles.questionNumber, { color: '#FFFFFF' }]}>
                                    {currentQuestionIndex + 1}
                                </FormattedText>
                            </View>
                        </View>
                        <FormattedText style={[styles.questionText, { color: theme.colors.text }]}>
                            {getCivicExamQuestionText(currentQuestion)}
                        </FormattedText>
                    </View>

                    <View style={[styles.optionsContainer, { backgroundColor: theme.colors.card }]}>
                        <FormattedText style={[styles.optionsTitle, { color: theme.colors.text }]}>
                            Choisissez votre réponse:
                        </FormattedText>
                        {options.map((option, index) => (
                            <OptionButton
                                key={index}
                                index={index}
                                option={option}
                                isSelected={selectedAnswer === index}
                                isCorrect={currentQuestion.correctAnswer === index}
                                showResult={isPracticeMode && answerSubmitted}
                                onPress={handleAnswerSelect}
                            />
                        ))}
                    </View>

                    {isPracticeMode && answerSubmitted && (
                        <ExamFeedback
                            isCorrect={isAnswerCorrect || false}
                            explanation={getCivicExamExplanationText(currentQuestion)}
                        />
                    )}
                </ScrollView>

                <View style={[styles.footer, { backgroundColor: theme.colors.card, borderTopColor: theme.colors.border }]}>
                    <TouchableOpacity
                        style={[
                            styles.submitButton,
                            {
                                backgroundColor: (selectedAnswer !== null || (isPracticeMode && answerSubmitted)) ? theme.colors.primary : theme.colors.textMuted,
                                opacity: (selectedAnswer !== null || (isPracticeMode && answerSubmitted)) ? 1 : 0.5,
                            }
                        ]}
                        onPress={isPracticeMode && answerSubmitted ? handleNextQuestion : handleSubmitAnswer}
                        disabled={selectedAnswer === null && !(isPracticeMode && answerSubmitted)}
                        activeOpacity={0.8}
                    >
                        <FormattedText style={[styles.submitButtonText, { color: '#FFFFFF' }]}>
                            {currentQuestionIndex < currentSession.totalQuestions - 1
                                ? 'Question suivante'
                                : 'Voir les résultats'
                            }
                        </FormattedText>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        ...sharedStyles.container,
    },
    scrollView: {
        flex: 1,
    },
    contentContainer: {
        padding: 20,
        paddingBottom: 100,
    },
    questionCard: {
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
    },
    questionHeader: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    questionNumberBadge: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    questionNumber: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    questionText: {
        fontSize: 18,
        fontWeight: '600',
        lineHeight: 26,
    },
    optionsContainer: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
    },
    optionsTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 16,
    },
    footer: {
        padding: 20,
        borderTopWidth: 1,
    },
    submitButton: {
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
    },
    submitButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    loadingText: {
        fontSize: 16,
    },
});

export default CivicExamQuestionScreen;

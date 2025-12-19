import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    StyleSheet,
    View,
    ScrollView,
    StatusBar,
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
import { getCivicExamExplanationText } from '../utils/civicExamQuestionUtils';
import { useCountdownTimer } from '../../shared/hooks/useCountdownTimer';
import { ExamHeader } from '../components/ExamHeader';
import { ExamFeedback } from '../components/ExamFeedback';
import { CivicExamQuestionCard } from '../components/CivicExamQuestionCard';
import { CivicExamOptions } from '../components/CivicExamOptions';
import { CivicExamFooter } from '../components/CivicExamFooter';
import { createLogger } from '../../shared/utils/logger';
import type { CivicExamStackParamList, CivicExamQuestion } from '../types';

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

    const { timeLeft, formattedTime } = useCountdownTimer({
        initialTime: CIVIC_EXAM_CONFIG.TIME_LIMIT_SECONDS,
        isActive: isExamMode && !!currentSession,
        onTimeUp: handleTimeUp,
        autoStart: true,
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
                    <CivicExamQuestionCard
                        currentQuestion={currentQuestion}
                        currentQuestionIndex={currentQuestionIndex}
                    />

                    <CivicExamOptions
                        currentQuestion={currentQuestion}
                        selectedAnswer={selectedAnswer}
                        answerSubmitted={answerSubmitted}
                        isPracticeMode={isPracticeMode}
                        onAnswerSelect={handleAnswerSelect}
                    />

                    {isPracticeMode && answerSubmitted && (
                        <ExamFeedback
                            isCorrect={isAnswerCorrect || false}
                            explanation={getCivicExamExplanationText(currentQuestion)}
                        />
                    )}
                </ScrollView>

                <CivicExamFooter
                    selectedAnswer={selectedAnswer}
                    answerSubmitted={answerSubmitted}
                    isPracticeMode={isPracticeMode}
                    currentQuestionIndex={currentQuestionIndex}
                    totalQuestions={currentSession.totalQuestions}
                    onNextQuestion={handleNextQuestion}
                    onSubmitAnswer={handleSubmitAnswer}
                />
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
    loadingText: {
        fontSize: 16,
    },
});

export default CivicExamQuestionScreen;

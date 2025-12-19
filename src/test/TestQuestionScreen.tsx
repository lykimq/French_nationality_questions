import React, { useState, useEffect, useCallback } from 'react';
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

import { useTheme } from '../shared/contexts/ThemeContext';
import { useTest, serializeTestResult } from './contexts/TestContext';
import { FormattedText } from '../shared/components';
import { TestAnswer, TestStackParamList } from '../types';
import { useTestTimer } from './hooks/useTestTimer';
import { TestHeader } from './components/TestHeader';
import { TestQuestionCard } from './components/TestQuestionCard';
import { TestAnswerSection } from './components/TestAnswerSection';
import { TestFooter } from './components/TestFooter';

type TestQuestionScreenNavigationProp = NativeStackNavigationProp<TestStackParamList>;

const TestQuestionScreen = () => {
    const navigation = useNavigation<TestQuestionScreenNavigationProp>();
    const { theme, themeMode } = useTheme();
    const {
        currentSession,
        currentQuestionIndex,
        getCurrentQuestion,
        submitAnswer,
        goToNextQuestion,
        finishTest,
        cancelTest,
    } = useTest();

    const [showAnswer, setShowAnswer] = useState(false);
    const [userFeedback, setUserFeedback] = useState<'correct' | 'incorrect' | null>(null);
    const [questionStartTime, setQuestionStartTime] = useState<Date>(new Date());
    const [isSubmitting, setIsSubmitting] = useState(false);

    const currentQuestion = getCurrentQuestion();

    const handleFinishTest = useCallback(async () => {
        try {
            const result = await finishTest();
            const serializedResult = serializeTestResult(result);
            navigation.navigate('TestResult', { testResult: serializedResult });
        } catch (error) {
            Alert.alert('Erreur', 'Erreur lors de la finalisation du test');
        }
    }, [finishTest, navigation]);

    const handleTimeUp = useCallback(() => {
        Alert.alert(
            'Temps écoulé',
            'Le temps est écoulé. Le test va se terminer.',
            [{ text: 'OK', onPress: handleFinishTest }]
        );
    }, [handleFinishTest]);

    const { timeLeft, formatTime } = useTestTimer({
        currentSession,
        onTimeUp: handleTimeUp
    });

    // Reset state when question changes
    useEffect(() => {
        setShowAnswer(false);
        setUserFeedback(null);
        setQuestionStartTime(new Date());
    }, [currentQuestionIndex, currentQuestion?.id]);

    // Check if session is completed or invalid
    useEffect(() => {
        if (!currentSession || currentSession.isCompleted) {
            navigation.navigate('Test', undefined);
        }
    }, [currentSession, navigation]);

    const handleUserFeedback = async (feedback: 'correct' | 'incorrect') => {
        if (!currentQuestion || isSubmitting) return;

        setIsSubmitting(true);
        setUserFeedback(feedback);

        try {
            const timeSpent = Math.floor((new Date().getTime() - questionStartTime.getTime()) / 1000);

            const answer: TestAnswer = {
                questionId: currentQuestion.id,
                isCorrect: feedback === 'correct',
                userAnswer: feedback === 'correct' ? 'User marked as correct' : 'User marked as incorrect',
                timeSpent,
                timestamp: new Date(),
            };

            await submitAnswer(answer, false);
        } catch (error) {
            Alert.alert('Erreur', 'Erreur lors de la soumission de la réponse');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancelTest = () => {
        Alert.alert(
            'Annuler le test',
            'Êtes-vous sûr de vouloir annuler ce test ?',
            [
                { text: 'Non', style: 'cancel' },
                {
                    text: 'Oui',
                    onPress: () => {
                        cancelTest();
                        navigation.goBack();
                    },
                },
            ]
        );
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

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <StatusBar barStyle={themeMode === 'dark' ? 'light-content' : 'dark-content'} />

            <SafeAreaView style={{ flex: 1 }} edges={['top']}>
                <TestHeader
                    currentQuestionIndex={currentQuestionIndex}
                    totalQuestions={currentSession.totalQuestions}
                    timeLeft={timeLeft}
                    onCancel={handleCancelTest}
                    formatTime={formatTime}
                />

                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.contentContainer}
                    showsVerticalScrollIndicator={false}
                >
                    <TestQuestionCard
                        currentQuestion={currentQuestion}
                        currentQuestionIndex={currentQuestionIndex}
                    />

                    <TestAnswerSection
                        currentQuestion={currentQuestion}
                        showAnswer={showAnswer}
                        userFeedback={userFeedback}
                        isSubmitting={isSubmitting}
                        onUserFeedback={handleUserFeedback}
                    />
                </ScrollView>

                <TestFooter
                    showAnswer={showAnswer}
                    userFeedback={userFeedback}
                    currentQuestionIndex={currentQuestionIndex}
                    totalQuestions={currentSession.totalQuestions}
                    onRevealAnswer={() => setShowAnswer(true)}
                    onNextQuestion={goToNextQuestion}
                    onFinishTest={handleFinishTest}
                />
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    contentContainer: {
        padding: 20,
        paddingBottom: 40,
    },
    loadingText: {
        fontSize: 16,
    },
});

export default TestQuestionScreen;
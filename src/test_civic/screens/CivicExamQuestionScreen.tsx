import { useState, useEffect, useRef, useCallback } from 'react';
import {
    StyleSheet,
    View,
    ScrollView,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect, CommonActions } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useTheme } from '../../shared/contexts/ThemeContext';
import { useCivicExam } from '../contexts/CivicExamContext';
import { FormattedText } from '../../shared/components';
import { sharedStyles } from '../../shared/utils';
import { CIVIC_EXAM_CONFIG } from '../constants/civicExamConstants';
import { getCivicExamExplanationText, isAnswerCorrect } from '../utils/civicExamQuestionUtils';
import { useCountdownTimer } from '../../shared/hooks/useCountdownTimer';
import { ExamHeader } from '../components/ExamHeader';
import { ExamFeedback } from '../components/ExamFeedback';
import { CivicExamQuestionCard } from '../components/CivicExamQuestionCard';
import { CivicExamOptions } from '../components/CivicExamOptions';
import { CivicExamFooter } from '../components/CivicExamFooter';
import { createLogger } from '../../shared/utils/logger';
import { useCivicExamTabBarOverlap } from '../utils/civicExamTabBarInset';
import type { CivicExamStackParamList, CivicExamQuestion } from '../types';

const logger = createLogger('CivicExamQuestionScreen');
type CivicExamQuestionScreenNavigationProp = NativeStackNavigationProp<CivicExamStackParamList>;

const CivicExamQuestionScreen = () => {
    const navigation = useNavigation<CivicExamQuestionScreenNavigationProp>();
    const { theme } = useTheme();
    const {
        currentSession,
        currentQuestionIndex,
        getCurrentQuestion,
        submitAnswer,
        goToNextQuestion,
        cancelExam,
        abandonPausedSession,
    } = useCivicExam();

    const tabBarOverlapPad = useCivicExamTabBarOverlap();

    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [answerSubmitted, setAnswerSubmitted] = useState(false);
    const [answerIsCorrect, setAnswerIsCorrect] = useState<boolean | null>(null);
    const [questionStartTime, setQuestionStartTime] = useState<Date>(new Date());
    const previousQuestionIndexRef = useRef<number>(-1);
    const isNavigatingAwayRef = useRef<boolean>(false);
    const prevTimedExamSessionIdRef = useRef<string | undefined>(undefined);

    const isPracticeMode = currentSession?.isPracticeMode || false;

    const navigateToHome = useCallback(() => {
        isNavigatingAwayRef.current = true;
        navigation.dispatch(
            CommonActions.reset({
                index: 0,
                routes: [{ name: 'CivicExamHome' }],
            })
        );
    }, [navigation]);

    const showExitAlert = useCallback(() => {
        if (isPracticeMode) {
            Alert.alert(
                'Mettre en pause',
                'Voulez-vous mettre en pause votre pratique ? Vous pourrez reprendre plus tard.',
                [
                    { text: 'Continuer', style: 'cancel' },
                    {
                        text: 'Abandonner',
                        style: 'destructive',
                        onPress: async () => {
                            await abandonPausedSession();
                            navigateToHome();
                        },
                    },
                    {
                        text: 'Pause',
                        style: 'default',
                        onPress: () => {
                            cancelExam();
                            navigateToHome();
                        },
                    },
                ],
                { cancelable: true }
            );
        } else {
            Alert.alert(
                'Quitter l\'examen',
                'Êtes-vous sûr de vouloir quitter l\'examen ? Votre progression sera perdue.',
                [
                    { text: 'Annuler', style: 'cancel' },
                    {
                        text: 'Quitter',
                        style: 'destructive',
                        onPress: () => {
                            cancelExam();
                            navigateToHome();
                        },
                    },
                ],
                { cancelable: true }
            );
        }
    }, [isPracticeMode, abandonPausedSession, cancelExam, navigateToHome]);

    const handleTimeUp = useCallback(() => {
        Alert.alert(
            'Temps écoulé',
            'Le temps est écoulé. Vous serez redirigé vers la révision.',
            [{ text: 'OK', onPress: () => navigation.navigate('CivicExamReview') }]
        );
    }, [navigation]);

    const { timeLeft, formattedTime, resetTimer } = useCountdownTimer({
        initialTime: CIVIC_EXAM_CONFIG.TIME_LIMIT_SECONDS,
        isActive: !!currentSession && !isPracticeMode,
        onTimeUp: handleTimeUp,
        autoStart: true,
    });

    useEffect(() => {
        if (!currentSession?.id) {
            prevTimedExamSessionIdRef.current = undefined;
            return;
        }
        if (currentSession.isPracticeMode) {
            prevTimedExamSessionIdRef.current = undefined;
            return;
        }
        const sessionId = currentSession.id;
        const prevId = prevTimedExamSessionIdRef.current;
        if (prevId !== undefined && prevId !== sessionId) {
            resetTimer();
        }
        prevTimedExamSessionIdRef.current = sessionId;
    }, [currentSession?.id, currentSession?.isPracticeMode, resetTimer]);

    const currentQuestion = getCurrentQuestion() as (CivicExamQuestion & {
        options?: string[];
        correctAnswer?: number;
    }) | null;

    const buildAnswerPayload = useCallback((answerIndex: number, isCorrect: boolean) => {
        if (!currentQuestion) return null;
        const timeSpent = Math.floor((new Date().getTime() - questionStartTime.getTime()) / 1000);
        const questionId = typeof currentQuestion.id === 'number'
            ? currentQuestion.id
            : parseInt(String(currentQuestion.id), 10);
        return { questionId, isCorrect, userAnswer: answerIndex.toString(), timeSpent, timestamp: new Date() };
    }, [currentQuestion, questionStartTime]);

    useEffect(() => {
        if (!currentQuestion || previousQuestionIndexRef.current === currentQuestionIndex) return;

        previousQuestionIndexRef.current = currentQuestionIndex;
        setSelectedAnswer(null);
        setAnswerSubmitted(false);
        setAnswerIsCorrect(null);
        setQuestionStartTime(new Date());
    }, [currentQuestionIndex, currentQuestion]);

    useEffect(() => {
        if (!currentSession || currentSession.isCompleted) {
            navigation.navigate('CivicExamHome');
        }
    }, [currentSession, navigation]);

    // Prevent back navigation without confirmation
    useFocusEffect(
        useCallback(() => {
            const onBackPress = (e: { preventDefault: () => void; data: { action: { type: string; payload?: { name?: string } } } }) => {
                // Skip if we're already programmatically navigating away
                if (isNavigatingAwayRef.current) {
                    return;
                }

                if (!currentSession) {
                    return;
                }

                const action = e.data.action;
                const isBackAction = action.type === 'GO_BACK' || 
                                   (action.type === 'NAVIGATE' && action.payload?.name === 'CivicExamHome');
                
                if (isBackAction) {
                    e.preventDefault();
                    showExitAlert();
                }
            };

            const unsubscribe = navigation.addListener('beforeRemove', onBackPress);

            return () => {
                unsubscribe();
                // Reset flag when component loses focus
                isNavigatingAwayRef.current = false;
            };
        }, [navigation, currentSession, showExitAlert])
    );

    const handleAnswerSelect = async (index: number) => {
        if (!currentQuestion || answerSubmitted) return;

        setSelectedAnswer(index);

        if (isPracticeMode) {
            const isCorrect = isAnswerCorrect(currentQuestion, index);
            setAnswerIsCorrect(isCorrect);
            setAnswerSubmitted(true);

            try {
                const payload = buildAnswerPayload(index, isCorrect);
                if (payload) await submitAnswer(payload, false);
            } catch (error) {
                logger.error('Error submitting practice answer:', error);
            }
        }
    };

    const handleNextQuestion = () => {
        if (!currentSession) return;

        const actualQuestionCount = currentSession.questions.length;
        if (isPracticeMode) {
            if (currentQuestionIndex < actualQuestionCount - 1) {
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
                const isCorrect = isAnswerCorrect(currentQuestion, selectedAnswer);
                const payload = buildAnswerPayload(selectedAnswer, isCorrect);
                if (payload) await submitAnswer(payload);

                const actualQuestionCount = currentSession.questions.length;
                if (currentQuestionIndex >= actualQuestionCount - 1) {
                    navigation.navigate('CivicExamReview');
                }
            } catch (error) {
                logger.error('Error submitting exam answer:', error);
                Alert.alert('Erreur', 'Erreur lors de la soumission de la réponse');
            }
        }
    };

    if (!currentSession) {
        return (
            <View style={[styles.container, { backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <FormattedText style={[styles.loadingText, { color: theme.colors.textMuted, marginTop: 16 }]}>
                    Chargement...
                </FormattedText>
            </View>
        );
    }

    if (!currentQuestion) {
        return (
            <View style={[styles.container, { backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <FormattedText style={[styles.loadingText, { color: theme.colors.textMuted, marginTop: 16 }]}>
                    Question non disponible...
                </FormattedText>
            </View>
        );
    }

    const actualTotalQuestions = currentSession.questions.length;
    const progress = actualTotalQuestions > 0
        ? ((currentQuestionIndex + 1) / actualTotalQuestions) * 100
        : 0;

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>

            <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
                <ExamHeader
                    currentQuestionIndex={currentQuestionIndex}
                    totalQuestions={actualTotalQuestions}
                    timeLeft={timeLeft}
                    formattedTime={formattedTime}
                    progress={progress}
                    isPracticeMode={isPracticeMode}
                    answeredCount={currentSession.answers.length}
                    onExit={showExitAlert}
                />

                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={[
                        styles.contentContainer,
                        { paddingBottom: 32 + tabBarOverlapPad },
                    ]}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
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
                            isCorrect={answerIsCorrect || false}
                            explanation={getCivicExamExplanationText(currentQuestion)}
                        />
                    )}
                </ScrollView>

                <CivicExamFooter
                    selectedAnswer={selectedAnswer}
                    answerSubmitted={answerSubmitted}
                    isPracticeMode={isPracticeMode}
                    currentQuestionIndex={currentQuestionIndex}
                    totalQuestions={actualTotalQuestions}
                    onNextQuestion={handleNextQuestion}
                    onSubmitAnswer={handleSubmitAnswer}
                    tabBarOverlapPad={tabBarOverlapPad}
                />
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: sharedStyles.container,
    scrollView: {
        flex: 1,
    },
    contentContainer: {
        padding: 20,
    },
    loadingText: {
        fontSize: 16,
    },
});

export default CivicExamQuestionScreen;

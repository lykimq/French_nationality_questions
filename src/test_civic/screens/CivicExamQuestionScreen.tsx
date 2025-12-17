import React, { useState, useEffect, useRef } from 'react';
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
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../../shared/contexts/ThemeContext';
import { useLanguage } from '../../shared/contexts/LanguageContext';
import { useCivicExam } from '../hooks/useCivicExam';
import { FormattedText } from '../../shared/components';
import { useCallback } from 'react';
import { sharedStyles } from '../../shared/utils';
import { CIVIC_EXAM_CONFIG } from '../constants/civicExamConstants';
import { getCivicExamQuestionText, getCivicExamExplanationText } from '../utils/civicExamQuestionUtils';
import type { CivicExamStackParamList, CivicExamQuestion } from '../types';
import type { TestAnswer } from '../../test/types';

type CivicExamQuestionScreenNavigationProp = NativeStackNavigationProp<CivicExamStackParamList>;

const CivicExamQuestionScreen = () => {
    const navigation = useNavigation<CivicExamQuestionScreenNavigationProp>();
    const { theme, themeMode } = useTheme();
    const { language } = useLanguage();
    const {
        currentSession,
        currentQuestionIndex,
        getCurrentQuestion,
        submitAnswer,
        goToNextQuestion,
        finishExam,
        cancelExam,
    } = useCivicExam();

    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [selectedExplanationAnswer, setSelectedExplanationAnswer] = useState<number | null>(null);
    const [showExplanation, setShowExplanation] = useState(false);
    const [answerSubmitted, setAnswerSubmitted] = useState(false);
    const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null);
    const [timeLeft, setTimeLeft] = useState<number>(CIVIC_EXAM_CONFIG.TIME_LIMIT_SECONDS);
    const [questionStartTime, setQuestionStartTime] = useState<Date>(new Date());
    const previousQuestionIndexRef = useRef<number>(-1);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const currentQuestion = getCurrentQuestion() as (CivicExamQuestion & { 
        options?: string[]; 
        correctAnswer?: number;
        explanationOptions?: string[];
        correctExplanationAnswer?: number;
    }) | null;

    // Force French language in exam mode (not practice)
    const isExamMode = currentSession?.mode === 'civic_exam_naturalization';
    const isPracticeMode = currentSession?.isPracticeMode || false;
    const displayLanguage = isExamMode ? 'fr' : language;

    // Handle time up with useCallback to avoid stale closures
    const handleTimeUp = useCallback(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        Alert.alert(
            displayLanguage === 'fr' ? 'Temps écoulé' : 'Hết giờ',
            displayLanguage === 'fr'
                ? 'Le temps est écoulé. Vous serez redirigé vers la révision.'
                : 'Thời gian đã hết. Bạn sẽ được chuyển đến phần xem lại.',
            [{ text: 'OK', onPress: () => navigation.navigate('CivicExamReview') }]
        );
    }, [displayLanguage, navigation]);

    // Initialize timer
    useEffect(() => {
        if (currentSession) {
            const elapsed = Math.floor((new Date().getTime() - currentSession.startTime.getTime()) / 1000);
            setTimeLeft(Math.max(0, CIVIC_EXAM_CONFIG.TIME_LIMIT_SECONDS - elapsed));
        }
    }, [currentSession]);

    // Timer countdown - only in exam mode
    useEffect(() => {
        if (!isExamMode || !currentSession) {
            return;
        }

        if (timeLeft <= 0) {
            handleTimeUp();
            return;
        }

        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    handleTimeUp();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        };
    }, [timeLeft, isExamMode, currentSession, handleTimeUp]);

    // Reset selected answer when question changes
    useEffect(() => {
        if (!currentQuestion) return;
        
        // Only reset if we've actually moved to a different question index
        if (previousQuestionIndexRef.current === currentQuestionIndex) {
            // Same question index, don't reset (this prevents reset when session updates)
            return;
        }
        
        // New question, reset all state and update ref
        previousQuestionIndexRef.current = currentQuestionIndex;
        setSelectedAnswer(null);
        setSelectedExplanationAnswer(null);
        setShowExplanation(false);
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
        
        // In practice mode, immediately process the answer and show feedback
        if (isPracticeMode) {
            const isCorrect = currentQuestion.correctAnswer === index;
            setIsAnswerCorrect(isCorrect);
            setAnswerSubmitted(true);
            setShowExplanation(true);
            
            // Submit the answer (don't auto-advance in practice mode)
            try {
                const timeSpent = Math.floor((new Date().getTime() - questionStartTime.getTime()) / 1000);
                const answer: TestAnswer = {
                    questionId: currentQuestion.id,
                    isCorrect,
                    userAnswer: index.toString(),
                    timeSpent,
                    timestamp: new Date(),
                };
                await submitAnswer(answer, false); // false = don't auto-advance
            } catch (error) {
                console.error('Error submitting answer:', error);
            }
        }
    };

    const handleNextQuestion = () => {
        if (!currentSession) return;
        
        // In practice mode, move to next question after showing feedback
        if (isPracticeMode) {
            if (currentQuestionIndex < currentSession.totalQuestions - 1) {
                // Advance to next question - state will be reset by useEffect
                goToNextQuestion();
            } else {
                navigation.navigate('CivicExamReview');
            }
        }
    };

    const handleSubmitAnswer = async () => {
        if (selectedAnswer === null || !currentQuestion) return;

        // In exam mode, submit and move to next
        if (!isPracticeMode) {
            try {
                const timeSpent = Math.floor((new Date().getTime() - questionStartTime.getTime()) / 1000);
                const isCorrect = currentQuestion.correctAnswer === selectedAnswer;

                const answer: TestAnswer = {
                    questionId: currentQuestion.id,
                    isCorrect,
                    userAnswer: selectedAnswer.toString(),
                    timeSpent,
                    timestamp: new Date(),
                };

                await submitAnswer(answer);

                // Auto-advance to next question or review
                if (currentQuestionIndex < (currentSession?.totalQuestions ?? 0) - 1) {
                    setSelectedAnswer(null);
                } else {
                    navigation.navigate('CivicExamReview');
                }
            } catch (error) {
                console.error('Error submitting answer:', error);
                Alert.alert(
                    displayLanguage === 'fr' ? 'Erreur' : 'Lỗi',
                    displayLanguage === 'fr'
                        ? 'Erreur lors de la soumission de la réponse'
                        : 'Lỗi khi nộp câu trả lời'
                );
            }
        }
    };


    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const getLocalizedText = (fr: string, vi: string) => {
        return displayLanguage === 'fr' ? fr : vi;
    };

    if (!currentSession || !currentQuestion) {
        return (
            <View style={[styles.container, { backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <FormattedText style={[styles.loadingText, { color: theme.colors.textMuted, marginTop: 16 }]}>
                    {getLocalizedText('Chargement...', 'Đang tải...')}
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
                <View style={[styles.header, { backgroundColor: theme.colors.headerBackground }]}>
                    <View style={styles.headerTop}>
                        <View style={styles.questionCounter}>
                            <FormattedText style={[styles.questionCounterText, { color: theme.colors.headerText }]}>
                                {currentQuestionIndex + 1} / {currentSession.totalQuestions}
                            </FormattedText>
                        </View>
                        <View style={[styles.timer, { backgroundColor: timeLeft < 300 ? theme.colors.error : theme.colors.primary }]}>
                            <Ionicons name="time" size={16} color="#FFFFFF" />
                            <FormattedText style={styles.timerText}>{formatTime(timeLeft)}</FormattedText>
                        </View>
                    </View>
                    <View style={[styles.progressContainer, { backgroundColor: theme.colors.border }]}>
                        <View style={[styles.progressBar, { width: `${progress}%`, backgroundColor: theme.colors.primary }]} />
                    </View>
                    <FormattedText style={[styles.passingInfo, { color: theme.colors.headerText }]}>
                        {(() => {
                            const passingScore = Math.ceil((currentSession.totalQuestions * CIVIC_EXAM_CONFIG.PASSING_PERCENTAGE) / 100);
                            if (currentSession.totalQuestions === CIVIC_EXAM_CONFIG.TOTAL_QUESTIONS) {
                                return getLocalizedText(
                                    `Passage: ${CIVIC_EXAM_CONFIG.PASSING_SCORE}/${CIVIC_EXAM_CONFIG.TOTAL_QUESTIONS}`,
                                    `Đạt: ${CIVIC_EXAM_CONFIG.PASSING_SCORE}/${CIVIC_EXAM_CONFIG.TOTAL_QUESTIONS}`
                                );
                            } else {
                                return getLocalizedText(
                                    `Passage: ${passingScore}/${currentSession.totalQuestions} (${CIVIC_EXAM_CONFIG.PASSING_PERCENTAGE}%)`,
                                    `Đạt: ${passingScore}/${currentSession.totalQuestions} (${CIVIC_EXAM_CONFIG.PASSING_PERCENTAGE}%)`
                                );
                            }
                        })()}
                    </FormattedText>
                </View>

                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.contentContainer}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Question Card */}
                    <View style={[styles.questionCard, { backgroundColor: theme.colors.card }]}>
                        <View style={styles.questionHeader}>
                            <View style={[styles.questionNumberBadge, { backgroundColor: theme.colors.primary }]}>
                                <FormattedText style={[styles.questionNumber, { color: '#FFFFFF' }]}>
                                    {currentQuestionIndex + 1}
                                </FormattedText>
                            </View>
                        </View>
                        <FormattedText style={[styles.questionText, { color: theme.colors.text }]}>
                            {getCivicExamQuestionText(currentQuestion, displayLanguage)}
                        </FormattedText>
                    </View>

                    {/* Multiple Choice Options */}
                    <View style={[styles.optionsContainer, { backgroundColor: theme.colors.card }]}>
                        <FormattedText style={[styles.optionsTitle, { color: theme.colors.text }]}>
                            {getLocalizedText('Choisissez votre réponse:', 'Chọn câu trả lời:')}
                        </FormattedText>
                        {options.length > 0 ? options.map((option, index) => {
                            const isSelected = selectedAnswer === index;
                            const isCorrect = currentQuestion.correctAnswer === index;
                            const showResult = isPracticeMode && answerSubmitted;
                            const isWrong = showResult && isSelected && !isCorrect;
                            
                            return (
                                <TouchableOpacity
                                    key={index}
                                    style={[
                                        styles.optionButton,
                                        {
                                            backgroundColor: isSelected 
                                                ? (showResult && isCorrect ? '#4CAF50' + '20' : isWrong ? '#F44336' + '20' : theme.colors.primary + '20')
                                                : showResult && isCorrect
                                                ? '#4CAF50' + '20'
                                                : theme.colors.surface,
                                            borderColor: isSelected 
                                                ? (showResult && isCorrect ? '#4CAF50' : isWrong ? '#F44336' : theme.colors.primary)
                                                : showResult && isCorrect
                                                ? '#4CAF50'
                                                : theme.colors.border,
                                            borderWidth: (showResult && (isCorrect || isWrong)) ? 2 : 1,
                                        }
                                    ]}
                                    onPress={() => !showResult && handleAnswerSelect(index)}
                                    disabled={showResult}
                                    activeOpacity={0.7}
                                >
                                    <View style={styles.optionContent}>
                                        <View style={[
                                            styles.optionRadio,
                                            {
                                                borderColor: isSelected || (showResult && isCorrect)
                                                    ? (showResult && isCorrect ? '#4CAF50' : isWrong ? '#F44336' : theme.colors.primary)
                                                    : theme.colors.border,
                                                backgroundColor: isSelected || (showResult && isCorrect)
                                                    ? (showResult && isCorrect ? '#4CAF50' : isWrong ? '#F44336' : theme.colors.primary)
                                                    : 'transparent',
                                            }
                                        ]}>
                                            {(isSelected || (showResult && isCorrect)) && (
                                                <View style={[styles.optionRadioInner, { backgroundColor: '#FFFFFF' }]} />
                                            )}
                                        </View>
                                        <FormattedText style={[styles.optionText, { color: theme.colors.text }]}>
                                            {option}
                                        </FormattedText>
                                        {showResult && isCorrect && (
                                            <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                                        )}
                                        {showResult && isWrong && (
                                            <Ionicons name="close-circle" size={24} color="#F44336" />
                                        )}
                                    </View>
                                </TouchableOpacity>
                            );
                        }) : (
                            <FormattedText style={[styles.optionText, { color: theme.colors.textMuted, textAlign: 'center', padding: 16 }]}>
                                {getLocalizedText('Aucune option disponible', 'Không có tùy chọn')}
                            </FormattedText>
                        )}
                    </View>

                    {/* Feedback and Explanation (Practice Mode Only) */}
                    {isPracticeMode && answerSubmitted && (
                        <View style={[styles.feedbackContainer, { backgroundColor: theme.colors.card }]}>
                            {isAnswerCorrect ? (
                                <View style={[styles.feedbackMessage, { backgroundColor: '#4CAF50' + '20', borderColor: '#4CAF50' }]}>
                                    <Ionicons name="checkmark-circle" size={32} color="#4CAF50" />
                                    <FormattedText style={[styles.feedbackText, { color: '#4CAF50' }]}>
                                        {getLocalizedText('Bonne réponse !', 'Câu trả lời đúng!')}
                                    </FormattedText>
                                </View>
                            ) : (
                                <View style={[styles.feedbackMessage, { backgroundColor: '#F44336' + '20', borderColor: '#F44336' }]}>
                                    <Ionicons name="close-circle" size={32} color="#F44336" />
                                    <FormattedText style={[styles.feedbackText, { color: '#F44336' }]}>
                                        {getLocalizedText('Mauvaise réponse', 'Câu trả lời sai')}
                                    </FormattedText>
                                </View>
                            )}
                            
                            {showExplanation && getCivicExamExplanationText(currentQuestion, displayLanguage) && (
                                <View style={styles.explanationTextContainer}>
                                    <FormattedText style={[styles.explanationTitle, { color: theme.colors.text }]}>
                                        {getLocalizedText('Explication:', 'Giải thích:')}
                                    </FormattedText>
                                    <FormattedText style={[styles.explanationText, { color: theme.colors.textSecondary }]}>
                                        {getCivicExamExplanationText(currentQuestion, displayLanguage)}
                                    </FormattedText>
                                </View>
                            )}
                        </View>
                    )}
                </ScrollView>

                <View style={[styles.footer, { backgroundColor: theme.colors.card, borderTopColor: theme.colors.border }]}>
                    {isPracticeMode && answerSubmitted ? (
                        <TouchableOpacity
                            style={[styles.submitButton, { backgroundColor: theme.colors.primary }]}
                            onPress={handleNextQuestion}
                            activeOpacity={0.8}
                        >
                            <FormattedText style={[styles.submitButtonText, { color: '#FFFFFF' }]}>
                                {currentQuestionIndex < currentSession.totalQuestions - 1
                                    ? getLocalizedText('Question suivante', 'Câu tiếp theo')
                                    : getLocalizedText('Voir les résultats', 'Xem kết quả')
                                }
                            </FormattedText>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            style={[
                                styles.submitButton,
                                {
                                    backgroundColor: selectedAnswer !== null ? theme.colors.primary : theme.colors.textMuted,
                                    opacity: selectedAnswer !== null ? 1 : 0.5,
                                }
                            ]}
                            onPress={handleSubmitAnswer}
                            disabled={selectedAnswer === null}
                            activeOpacity={0.8}
                        >
                            <FormattedText style={[styles.submitButtonText, { color: '#FFFFFF' }]}>
                                {currentQuestionIndex < currentSession.totalQuestions - 1
                                    ? getLocalizedText('Question suivante', 'Câu tiếp theo')
                                    : getLocalizedText('Voir les résultats', 'Xem kết quả')
                                }
                            </FormattedText>
                        </TouchableOpacity>
                    )}
                </View>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        ...sharedStyles.container,
    },
    header: {
        paddingHorizontal: 20,
        paddingVertical: 12,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    questionCounter: {
        flex: 1,
    },
    questionCounterText: {
        fontSize: 16,
        fontWeight: '600',
    },
    timer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 6,
    },
    timerText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: 'bold',
    },
    progressContainer: {
        height: 4,
        borderRadius: 2,
        marginBottom: 8,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        borderRadius: 2,
    },
    passingInfo: {
        fontSize: 12,
        textAlign: 'center',
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
        marginTop: 0,
        marginBottom: 20,
    },
    optionsTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 16,
    },
    feedbackContainer: {
        borderRadius: 12,
        padding: 20,
        marginTop: 20,
    },
    feedbackMessage: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        borderWidth: 2,
        marginBottom: 16,
        gap: 12,
    },
    feedbackText: {
        fontSize: 18,
        fontWeight: 'bold',
        flex: 1,
    },
    explanationTextContainer: {
        marginTop: 8,
    },
    explanationTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
    },
    explanationText: {
        fontSize: 15,
        lineHeight: 22,
    },
    optionButton: {
        borderRadius: 8,
        padding: 16,
        marginBottom: 12,
        borderWidth: 2,
    },
    optionContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    optionRadio: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    optionRadioInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    optionText: {
        flex: 1,
        fontSize: 15,
        lineHeight: 22,
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


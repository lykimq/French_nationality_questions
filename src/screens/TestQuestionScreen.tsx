import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    View,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    Alert,
    Image,
    Dimensions,
    ActivityIndicator,
    Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTest, serializeTestResult } from '../contexts/TestContext';
import FormattedText from '../components/FormattedText';
import { TestAnswer } from '../types/test';
import { TestStackParamList } from '../types/types';
import { getCachedImageSource } from '../utils/imageUtils';
import { testDatabaseIntegration, testQuestionIdUniqueness, logDatabaseStatistics } from '../utils/testDatabaseIntegration';
import { useIcons } from '../contexts/IconContext';

const { width, height } = Dimensions.get('window');

type TestQuestionScreenNavigationProp = NativeStackNavigationProp<TestStackParamList>;

const TestQuestionScreen = () => {
    const navigation = useNavigation<TestQuestionScreenNavigationProp>();
    const { theme, themeMode } = useTheme();
    const { language, toggleLanguage } = useLanguage();
    const { getIconName } = useIcons();
    const {
        currentSession,
        currentQuestionIndex,
        getCurrentQuestion,
        submitAnswer,
        finishTest,
        cancelTest,
    } = useTest();

    const [showAnswer, setShowAnswer] = useState(false);
    const [userFeedback, setUserFeedback] = useState<'correct' | 'incorrect' | null>(null);
    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    const [questionStartTime, setQuestionStartTime] = useState<Date>(new Date());
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showDebugPanel, setShowDebugPanel] = useState(__DEV__); // Only show in dev mode

    const currentQuestion = getCurrentQuestion();

    // Check if session is completed or invalid and redirect to Test screen
    useEffect(() => {
        if (!currentSession || currentSession.isCompleted) {
            console.log('⚠️ TestQuestionScreen: Session is completed or missing, redirecting to Test screen');
            navigation.navigate('Test', undefined);
            return;
        }
    }, [currentSession, navigation]);

    // Database validation on component mount (only in dev mode)
    useEffect(() => {
        if (__DEV__ && currentQuestion) {
            // Run a quick database validation when the first question loads
            const validateDatabase = async () => {
                try {
                    console.log('🧪 Running database validation...');
                    await logDatabaseStatistics();

                    // Test the current question's data integrity
                    console.log('🔍 Current question validation:', {
                        id: currentQuestion.id,
                        hasQuestion: !!currentQuestion.question,
                        hasQuestionVi: !!currentQuestion.question_vi,
                        hasExplanation: !!currentQuestion.explanation,
                        hasExplanationVi: !!currentQuestion.explanation_vi,
                        questionLength: currentQuestion.question?.length || 0,
                        explanationLength: currentQuestion.explanation?.length || 0,
                        category: currentQuestion.categoryId,
                        categoryTitle: currentQuestion.categoryTitle
                    });
                } catch (error) {
                    console.error('❌ Database validation failed:', error);
                }
            };

            // Only run validation once per session
            if (currentQuestionIndex === 0) {
                validateDatabase();
            }
        }
    }, [currentQuestion, currentQuestionIndex]);

    // Debug logging for current question
    useEffect(() => {
        if (currentQuestion) {
            console.log('📊 Current Question Debug Info:', {
                id: currentQuestion.id,
                categoryId: currentQuestion.categoryId,
                categoryTitle: currentQuestion.categoryTitle,
                hasQuestion: !!currentQuestion.question,
                hasQuestionVi: !!currentQuestion.question_vi,
                hasExplanation: !!currentQuestion.explanation,
                hasExplanationVi: !!currentQuestion.explanation_vi,
                questionLength: currentQuestion.question?.length || 0,
                questionViLength: currentQuestion.question_vi?.length || 0,
                explanationLength: currentQuestion.explanation?.length || 0,
                explanationViLength: currentQuestion.explanation_vi?.length || 0,
                hasImage: !!currentQuestion.image,
                sessionId: currentSession?.id,
                sessionMode: currentSession?.mode,
                questionIndex: currentQuestionIndex,
                totalQuestions: currentSession?.totalQuestions
            });
        }
    }, [currentQuestion, currentQuestionIndex, currentSession]);

    // Initialize timer if test has time limit
    useEffect(() => {
        if (currentSession?.mode === 'geography_only' || currentSession?.mode === 'mock_interview' || currentSession?.mode === 'history_culture_comprehensive') {
            let timeLimit;
            switch (currentSession.mode) {
                case 'geography_only':
                    timeLimit = 15 * 60; // 15 minutes
                    break;
                case 'mock_interview':
                    timeLimit = 45 * 60; // 45 minutes
                    break;
                case 'history_culture_comprehensive':
                    timeLimit = 120 * 60; // 120 minutes
                    break;
                default:
                    timeLimit = 30 * 60; // 30 minutes default
            }
            const elapsed = Math.floor((new Date().getTime() - currentSession.startTime.getTime()) / 1000);
            setTimeLeft(Math.max(0, timeLimit - elapsed));
        }
    }, [currentSession]);

    // Timer countdown
    useEffect(() => {
        if (timeLeft === null || timeLeft <= 0) return;

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev === null || prev <= 1) {
                    handleTimeUp();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft]);

    // Reset state when question changes
    useEffect(() => {
        console.log('🔄 Question changed, resetting state. Index:', currentQuestionIndex);
        if (currentQuestion) {
            console.log('📝 Current question details:', {
                id: currentQuestion.id,
                categoryId: currentQuestion.categoryId,
                questionFr: currentQuestion.question?.substring(0, 100) + '...' || 'No French question',
                questionVi: currentQuestion.question_vi?.substring(0, 100) + '...' || 'No Vietnamese translation',
                hasExplanation: !!currentQuestion.explanation,
                hasExplanationVi: !!currentQuestion.explanation_vi,
                categoryTitle: currentQuestion.categoryTitle
            });
        }
        setShowAnswer(false);
        setUserFeedback(null);
        setQuestionStartTime(new Date());
    }, [currentQuestionIndex, currentQuestion?.id]);

    // Cleanup when component unmounts or session changes
    useEffect(() => {
        return () => {
            setShowAnswer(false);
            setUserFeedback(null);
        };
    }, [currentSession?.id]);

    const handleTimeUp = async () => {
        Alert.alert(
            language === 'fr' ? 'Temps écoulé' : 'Hết giờ',
            language === 'fr' ? 'Le temps est écoulé. Le test va se terminer.' : 'Thời gian đã hết. Bài kiểm tra sẽ kết thúc.',
            [{ text: 'OK', onPress: handleFinishTest }]
        );
    };

    const handleRevealAnswer = () => {
        console.log('👁️ Revealing answer for question ID:', currentQuestion?.id);
        setShowAnswer(true);
    };

    const handleUserFeedback = async (feedback: 'correct' | 'incorrect') => {
        if (!currentQuestion || isSubmitting) return;

        console.log('💭 User feedback for question:', {
            questionId: currentQuestion.id,
            questionIndex: currentQuestionIndex,
            feedback,
            questionText: currentQuestion.question?.substring(0, 50) + '...' || 'No question text',
            questionTextVi: currentQuestion.question_vi?.substring(0, 50) + '...' || 'No Vietnamese text',
            categoryId: currentQuestion.categoryId,
            categoryTitle: currentQuestion.categoryTitle
        });

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

            console.log('📤 Submitting answer:', answer);
            await submitAnswer(answer);
            console.log('✅ Answer submitted successfully');
        } catch (error) {
            console.error('❌ Error submitting answer:', error);
            Alert.alert(
                language === 'fr' ? 'Erreur' : 'Lỗi',
                language === 'fr' ? 'Erreur lors de la soumission de la réponse' : 'Lỗi khi nộp câu trả lời'
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleNextQuestion = () => {
        console.log('➡️ Moving to next question. Current index:', currentQuestionIndex, 'Total:', currentSession?.totalQuestions);
        if (currentQuestionIndex < (currentSession?.totalQuestions ?? 0) - 1) {
            // Move to next question
            setShowAnswer(false);
            setUserFeedback(null);
        } else {
            console.log('🏁 Finishing test - reached last question');
            handleFinishTest();
        }
    };

    const handleFinishTest = async () => {
        try {
            console.log('🏁 Finishing test...');
            const result = await finishTest();
            console.log('✅ Test finished successfully, navigating to results');
            const serializedResult = serializeTestResult(result);
            navigation.navigate('TestResult', { testResult: serializedResult });
        } catch (error) {
            console.error('❌ Error finishing test:', error);
            Alert.alert(
                language === 'fr' ? 'Erreur' : 'Lỗi',
                language === 'fr' ? 'Erreur lors de la finalisation du test' : 'Lỗi khi hoàn thành bài kiểm tra'
            );
        }
    };

    const handleCancelTest = () => {
        Alert.alert(
            language === 'fr' ? 'Annuler le test' : 'Hủy bài kiểm tra',
            language === 'fr' ? 'Êtes-vous sûr de vouloir annuler ce test ?' : 'Bạn có chắc chắn muốn hủy bài kiểm tra này?',
            [
                { text: language === 'fr' ? 'Non' : 'Không', style: 'cancel' },
                {
                    text: language === 'fr' ? 'Oui' : 'Có',
                    onPress: () => {
                        console.log('❌ Cancelling test');
                        cancelTest();
                        // Navigate back to the main test screen
                        navigation.goBack();
                    },
                },
            ]
        );
    };

    // Debug function to run comprehensive database tests
    const runDatabaseTests = async () => {
        try {
            console.log('🧪 Starting comprehensive database tests...');

            // Run database integration test
            const integrationResult = await testDatabaseIntegration();
            console.log('Database Integration Test:', integrationResult);

            // Run ID uniqueness test
            const uniquenessResult = await testQuestionIdUniqueness();
            console.log('Question ID Uniqueness Test:', uniquenessResult);

            // Show results to user
            const message = `Database Tests Complete:

Integration: ${integrationResult.success ? '✅ PASSED' : '❌ FAILED'}
Total Questions: ${integrationResult.totalQuestions}
Categories: ${integrationResult.categoriesLoaded.length}
Subcategories: ${integrationResult.subcategoriesLoaded.length}

ID Uniqueness: ${uniquenessResult.success ? '✅ PASSED' : '❌ FAILED'}
Unique IDs: ${uniquenessResult.uniqueIds}/${uniquenessResult.totalQuestions}
Duplicates: ${uniquenessResult.duplicateIds.length}

Issues: ${integrationResult.issues.length + uniquenessResult.issues.length}`;

            Alert.alert('Database Test Results', message);

        } catch (error) {
            console.error('❌ Database tests failed:', error);
            Alert.alert('Database Test Error', `Tests failed: ${error}`);
        }
    };

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const getProgressPercentage = (): number => {
        if (!currentSession) return 0;
        return ((currentQuestionIndex + 1) / currentSession.totalQuestions) * 100;
    };

    // Helper function to get the correct question text based on language
    const getQuestionText = (): string => {
        if (!currentQuestion) return '';

        if (language === 'fr') {
            return currentQuestion.question || 'Question non disponible';
        } else {
            // For Vietnamese, show both French and Vietnamese if available
            if (currentQuestion.question_vi) {
                return `🇫🇷 ${currentQuestion.question}\n\n🇻🇳 ${currentQuestion.question_vi}`;
            } else {
                return currentQuestion.question || 'Question non disponible';
            }
        }
    };

    // Helper function to get the correct explanation text based on language
    const getExplanationText = (): string => {
        if (!currentQuestion) return '';

        if (language === 'fr') {
            return currentQuestion.explanation || 'Explication non disponible';
        } else {
            // For Vietnamese, show both French and Vietnamese if available
            if (currentQuestion.explanation_vi) {
                return `🇫🇷 ${currentQuestion.explanation}\n\n🇻🇳 ${currentQuestion.explanation_vi}`;
            } else {
                return currentQuestion.explanation || 'Explication non disponible';
            }
        }
    };

    if (!currentSession || !currentQuestion) {
        return (
            <View style={[styles.container, { backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <FormattedText style={[styles.loadingText, { color: theme.colors.textMuted, marginTop: 16 }]}>
                    {language === 'fr' ? 'Chargement...' : 'Đang tải...'}
                </FormattedText>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <StatusBar barStyle={themeMode === 'dark' ? 'light-content' : 'dark-content'} />

            <SafeAreaView style={{ flex: 1 }} edges={['top']}>
                {/* Header with progress and timer */}
                <View style={[styles.header, { backgroundColor: theme.colors.headerBackground }]}>
                    <View style={styles.headerTop}>
                        <TouchableOpacity onPress={handleCancelTest} style={styles.cancelButton}>
                            <Ionicons name={getIconName('close') as any} size={24} color={theme.colors.headerText} />
                        </TouchableOpacity>

                        <View style={styles.questionCounter}>
                            <FormattedText style={[styles.questionCounterText, { color: theme.colors.headerText }]}>
                                {currentQuestionIndex + 1} / {currentSession.totalQuestions}
                            </FormattedText>
                            {/* Show question ID for debugging */}
                            <FormattedText style={[styles.questionIdText, { color: theme.colors.textMuted }]}>
                                ID: {currentQuestion.id}
                            </FormattedText>
                        </View>

                        <View style={styles.headerRight}>
                            {/* Debug panel toggle (only in dev mode) */}
                            {__DEV__ && (
                                <TouchableOpacity
                                    onPress={runDatabaseTests}
                                    style={[styles.debugButton, { backgroundColor: theme.colors.warning }]}
                                >
                                    <Ionicons name={getIconName('bug') as any} size={16} color="white" />
                                </TouchableOpacity>
                            )}

                            {timeLeft !== null && (
                                <View style={[styles.timer, { backgroundColor: timeLeft < 60 ? theme.colors.error : theme.colors.primary }]}>
                                    <Ionicons name={getIconName('time') as any} size={16} color="white" />
                                    <FormattedText style={styles.timerText}>{formatTime(timeLeft)}</FormattedText>
                                </View>
                            )}

                            <View style={styles.languageSelector}>
                                <FormattedText style={[styles.languageLabel, { color: theme.colors.headerText }]}>FR</FormattedText>
                                <Switch
                                    value={language === 'vi'}
                                    onValueChange={() => {
                                        console.log('🔄 Language toggle from', language, 'to', language === 'fr' ? 'vi' : 'fr');
                                        toggleLanguage();
                                    }}
                                    thumbColor={theme.colors.switchThumb}
                                    trackColor={{ false: theme.colors.primaryLight, true: theme.colors.primaryLight }}
                                    style={styles.languageSwitch}
                                />
                                <FormattedText style={[styles.languageLabel, { color: theme.colors.headerText }]}>VI</FormattedText>
                            </View>
                        </View>
                    </View>

                    {/* Progress bar */}
                    <View style={[styles.progressContainer, { backgroundColor: theme.colors.border }]}>
                        <LinearGradient
                            colors={[theme.colors.primary, theme.colors.primaryLight]}
                            style={[styles.progressBar, { width: `${getProgressPercentage()}%` }]}
                        />
                    </View>
                </View>

                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.contentContainer}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Question Card */}
                    <View style={[styles.questionCard, { backgroundColor: theme.colors.surface }]}>
                        <View style={styles.questionHeader}>
                            <FormattedText style={[styles.questionLabel, { color: theme.colors.textMuted }]}>
                                {language === 'fr' ? 'Question d\'entretien' : 'Câu hỏi phỏng vấn'} {currentQuestionIndex + 1}
                            </FormattedText>
                            {currentQuestion.categoryTitle && (
                                <View style={[styles.categoryBadge, { backgroundColor: theme.colors.primaryLight }]}>
                                    <FormattedText
                                        style={[styles.categoryBadgeText, { color: theme.colors.primary }]}
                                    >
                                        {currentQuestion.categoryTitle}
                                    </FormattedText>
                                </View>
                            )}
                        </View>

                        <FormattedText style={[styles.questionText, { color: theme.colors.text }]}>
                            {getQuestionText()}
                        </FormattedText>

                        {currentQuestion.image && (
                            <Image
                                source={getCachedImageSource(currentQuestion.image) || { uri: currentQuestion.image }}
                                style={styles.questionImage}
                            />
                        )}
                    </View>

                    {/* Instructions */}
                    {!showAnswer && (
                        <View style={[styles.instructionCard, { backgroundColor: theme.colors.surface }]}>
                            <View style={styles.instructionHeader}>
                                <Ionicons name={getIconName('bulb') as any} size={20} color={theme.colors.warning} />
                                <FormattedText style={[styles.instructionTitle, { color: theme.colors.text }]}>
                                    {language === 'fr' ? 'Instructions' : 'Hướng dẫn'}
                                </FormattedText>
                            </View>
                            <FormattedText style={[styles.instructionText, { color: theme.colors.textMuted }]}>
                                {language === 'fr'
                                    ? 'Réfléchissez à votre réponse, puis cliquez sur "Voir la réponse" pour découvrir la réponse attendue et comparer avec vos connaissances.'
                                    : 'Hãy suy nghĩ về câu trả lời của bạn, sau đó nhấn "Xem đáp án" để khám phá câu trả lời mong đợi và so sánh với kiến thức của bạn.'
                                }
                            </FormattedText>
                        </View>
                    )}

                    {/* Answer Section */}
                    {showAnswer && currentQuestion.explanation && (
                        <View style={[styles.answerCard, { backgroundColor: theme.colors.surface }]}>
                            <View style={styles.answerHeader}>
                                <Ionicons name={getIconName('checkmarkCircle') as any} size={20} color={theme.colors.success} />
                                <FormattedText style={[styles.answerTitle, { color: theme.colors.text }]}>
                                    {language === 'fr' ? 'Réponse attendue' : 'Đáp án mong đợi'}
                                </FormattedText>
                            </View>
                            <FormattedText style={[styles.answerText, { color: theme.colors.textMuted }]}>
                                {getExplanationText()}
                            </FormattedText>
                        </View>
                    )}

                    {/* Self-Assessment */}
                    {showAnswer && userFeedback === null && (
                        <View style={[styles.assessmentCard, { backgroundColor: theme.colors.surface }]}>
                            <FormattedText style={[styles.assessmentQuestion, { color: theme.colors.text }]}>
                                {language === 'fr'
                                    ? 'Évaluez votre réponse:'
                                    : 'Đánh giá câu trả lời của bạn:'}
                            </FormattedText>
                            <View style={styles.assessmentButtons}>
                                <TouchableOpacity
                                    style={[styles.assessmentButton, styles.correctButton, { backgroundColor: theme.colors.success }]}
                                    onPress={() => handleUserFeedback('correct')}
                                    disabled={isSubmitting}
                                >
                                    <Ionicons name={getIconName('checkmark') as any} size={20} color="white" />
                                    <FormattedText style={styles.assessmentButtonText}>
                                        {language === 'fr' ? 'Je savais' : 'Tôi biết'}
                                    </FormattedText>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.assessmentButton, styles.incorrectButton, { backgroundColor: theme.colors.error }]}
                                    onPress={() => handleUserFeedback('incorrect')}
                                    disabled={isSubmitting}
                                >
                                    <Ionicons name={getIconName('close') as any} size={20} color="white" />
                                    <FormattedText style={styles.assessmentButtonText}>
                                        {language === 'fr' ? 'Je ne savais pas' : 'Tôi không biết'}
                                    </FormattedText>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}

                    {/* Feedback Message */}
                    {userFeedback && (
                        <View style={[
                            styles.feedbackCard,
                            {
                                backgroundColor: userFeedback === 'correct' ? theme.colors.primaryLight : theme.colors.accent,
                                borderColor: userFeedback === 'correct' ? theme.colors.success : theme.colors.error
                            }
                        ]}>
                            <Ionicons
                                name={userFeedback === 'correct' ? "checkmark-circle" : "information-circle"}
                                size={20}
                                color={userFeedback === 'correct' ? theme.colors.success : theme.colors.error}
                            />
                            <FormattedText style={[styles.feedbackText, { color: theme.colors.text }]}>
                                {userFeedback === 'correct'
                                    ? (language === 'fr' ? 'Excellent! Continuez ainsi.' : 'Xuất sắc! Hãy tiếp tục như vậy.')
                                    : (language === 'fr' ? 'Pas de problème, c\'est ainsi qu\'on apprend!' : 'Không sao, đó là cách chúng ta học hỏi!')
                                }
                            </FormattedText>
                        </View>
                    )}
                </ScrollView>

                {/* Action Button */}
                <View style={[styles.actionContainer, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border }]}>
                    {!showAnswer ? (
                        <TouchableOpacity
                            style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
                            onPress={handleRevealAnswer}
                        >
                            <FormattedText style={styles.actionButtonText}>
                                {language === 'fr' ? 'Voir la réponse' : 'Xem đáp án'}
                            </FormattedText>
                            <Ionicons name={getIconName('eye') as any} size={20} color="white" />
                        </TouchableOpacity>
                    ) : userFeedback ? (
                        <TouchableOpacity
                            style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
                            onPress={currentQuestionIndex < currentSession.totalQuestions - 1 ? handleNextQuestion : handleFinishTest}
                        >
                            <FormattedText style={styles.actionButtonText}>
                                {currentQuestionIndex < currentSession.totalQuestions - 1
                                    ? (language === 'fr' ? 'Question suivante' : 'Câu hỏi tiếp theo')
                                    : (language === 'fr' ? 'Terminer le test' : 'Hoàn thành bài test')
                                }
                            </FormattedText>
                            <Ionicons
                                name={currentQuestionIndex < currentSession.totalQuestions - 1 ? "arrow-forward" : "checkmark-done"}
                                size={20}
                                color="white"
                            />
                        </TouchableOpacity>
                    ) : (
                        <View style={[styles.actionButton, { backgroundColor: theme.colors.textMuted, opacity: 0.6 }]}>
                            <FormattedText style={styles.actionButtonText}>
                                {language === 'fr' ? 'Évaluez votre réponse ci-dessus' : 'Đánh giá câu trả lời ở trên'}
                            </FormattedText>
                        </View>
                    )}
                </View>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    cancelButton: {
        padding: 8,
    },
    questionCounter: {
        flex: 1,
        alignItems: 'center',
    },
    questionCounterText: {
        fontSize: 16,
        fontWeight: '600',
    },
    questionIdText: {
        fontSize: 12,
        fontWeight: '400',
        marginTop: 2,
    },
    debugButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 6,
        borderRadius: 16,
        marginRight: 8,
    },
    timer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    timerText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 4,
    },
    progressContainer: {
        height: 4,
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        borderRadius: 2,
    },
    scrollView: {
        flex: 1,
    },
    contentContainer: {
        padding: 20,
        paddingBottom: 40,
    },
    questionCard: {
        borderRadius: 16,
        padding: 24,
        marginBottom: 24,
        elevation: 2,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    questionHeader: {
        flexDirection: 'column',
        marginBottom: 16,
        gap: 8,
    },
    questionLabel: {
        fontSize: 14,
        fontWeight: '500',
        alignSelf: 'flex-start',
    },
    categoryBadge: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
        alignSelf: 'flex-start',
        maxWidth: '100%',
        flexShrink: 1,
    },
    categoryBadgeText: {
        fontSize: 12,
        fontWeight: '600',
        lineHeight: 16,
        textAlign: 'center',
    },
    questionText: {
        fontSize: 18,
        lineHeight: 26,
        fontWeight: '500',
    },
    questionImage: {
        width: '100%',
        height: 200,
        borderRadius: 12,
        marginTop: 16,
        resizeMode: 'cover',
    },
    instructionCard: {
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        elevation: 2,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    instructionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    instructionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    instructionText: {
        fontSize: 15,
        lineHeight: 22,
    },
    answerCard: {
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        elevation: 2,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    answerHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    answerTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    answerText: {
        fontSize: 15,
        lineHeight: 22,
    },
    assessmentCard: {
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        elevation: 2,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    assessmentQuestion: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 16,
        textAlign: 'center',
    },
    assessmentButtons: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        gap: 12,
    },
    assessmentButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        gap: 8,
    },
    correctButton: {
        // backgroundColor set via theme
    },
    incorrectButton: {
        // backgroundColor set via theme
    },
    assessmentButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
    },
    feedbackCard: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        gap: 12,
    },
    feedbackText: {
        fontSize: 15,
        fontWeight: '500',
        flex: 1,
    },
    actionContainer: {
        padding: 20,
        borderTopWidth: 1,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 12,
        gap: 8,
    },
    actionButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    loadingText: {
        fontSize: 16,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    languageSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 12,
    },
    languageLabel: {
        fontSize: 14,
        fontWeight: '600',
        marginHorizontal: 4,
    },
    languageSwitch: {
        transform: [{ scale: 0.75 }],
    },
});

export default TestQuestionScreen;
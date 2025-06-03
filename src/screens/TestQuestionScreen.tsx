import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    Text,
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
import { useTest } from '../contexts/TestContext';
import FormattedText from '../components/FormattedText';
import { TestAnswer } from '../types/test';
import { RootStackParamList } from '../types/types';
import { getCachedImageSource } from '../utils/imageUtils';

const { width, height } = Dimensions.get('window');

type TestQuestionScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface AnswerOption {
    text: string;
    isCorrect: boolean;
    explanation?: string;
}

const TestQuestionScreen = () => {
    const navigation = useNavigation<TestQuestionScreenNavigationProp>();
    const { theme, themeMode } = useTheme();
    const { language, toggleLanguage } = useLanguage();
    const {
        currentSession,
        currentQuestionIndex,
        getCurrentQuestion,
        submitAnswer,
        finishTest,
        cancelTest,
    } = useTest();

    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [showExplanation, setShowExplanation] = useState(false);
    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    const [questionStartTime, setQuestionStartTime] = useState<Date>(new Date());
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [answerOptions, setAnswerOptions] = useState<AnswerOption[]>([]);
    const [correctAnswerText, setCorrectAnswerText] = useState<string>('');

    const currentQuestion = getCurrentQuestion();

    // Initialize timer if test has time limit
    useEffect(() => {
        if (currentSession?.mode === 'timed' || currentSession?.mode === 'mock_interview') {
            const timeLimit = currentSession.mode === 'timed' ? 15 * 60 : 45 * 60; // 15 or 45 minutes
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
        setSelectedAnswer(null);
        setShowExplanation(false);
        setQuestionStartTime(new Date());

        // Generate answer options for the current question
        if (currentQuestion) {
            const options = generateAnswerOptions(currentQuestion);
            setAnswerOptions(options);
            setCorrectAnswerText(options.find(opt => opt.isCorrect)?.text || '');
        }
    }, [currentQuestionIndex, currentQuestion, language]);

    const generateAnswerOptions = (question: any): AnswerOption[] => {
        if (!question) return [];

        const explanation = language === 'fr' ?
            question.explanation :
            (question.explanation_vi || question.explanation);

        const questionText = language === 'fr' ?
            question.question :
            (question.question_vi || question.question);

        // Extract correct answer from explanation or generate based on question type
        const correctAnswer = extractCorrectAnswer(questionText, explanation, question.categoryId);

        // Generate educational distractors
        const distractors = generateDistractors(questionText, correctAnswer, question.categoryId);

        // Combine correct answer with distractors and shuffle
        const options: AnswerOption[] = [
            { text: correctAnswer, isCorrect: true },
            ...distractors.map(text => ({ text, isCorrect: false }))
        ];

        // Shuffle options
        return shuffleArray(options);
    };

    const extractCorrectAnswer = (questionText: string, explanation: string, categoryId: string): string => {
        // Common patterns for extracting answers from explanations
        const lowerQuestion = questionText.toLowerCase();
        const lowerExplanation = explanation.toLowerCase();

        // For date questions
        if (lowerQuestion.includes('quand') || lowerQuestion.includes('année') ||
            lowerQuestion.includes('khi nào') || lowerQuestion.includes('năm')) {
            const dateMatch = explanation.match(/(\d{4}|\d{1,2}\/\d{1,2}\/\d{4})/);
            if (dateMatch) return dateMatch[1];

            // Look for century references
            const centuryMatch = explanation.match(/(XIXe|XXe|XVIIIe|XVIIe|XVIe) siècle/i);
            if (centuryMatch) return centuryMatch[0];
        }

        // For "who" questions
        if (lowerQuestion.includes('qui') || lowerQuestion.includes('ai')) {
            // Extract proper names from explanation
            const nameMatch = explanation.match(/([A-Z][a-z]+ [A-Z][a-z]+|[A-Z][a-z]+)/);
            if (nameMatch) return nameMatch[1];
        }

        // For "what" questions
        if (lowerQuestion.includes('qu\'est-ce que') || lowerQuestion.includes('quoi') ||
            lowerQuestion.includes('gì là')) {
            // Extract definition from explanation
            const sentences = explanation.split(/[.!?]/);
            if (sentences[0]) {
                return sentences[0].trim().substring(0, 80) + (sentences[0].length > 80 ? '...' : '');
            }
        }

        // For "where" questions
        if (lowerQuestion.includes('où') || lowerQuestion.includes('ở đâu')) {
            const locationMatch = explanation.match(/(Paris|Lyon|Marseille|France|Versailles|[A-Z][a-z]+)/);
            if (locationMatch) return locationMatch[1];
        }

        // For yes/no questions
        if (lowerQuestion.includes('est-ce que') || lowerQuestion.includes('có phải') ||
            lowerQuestion.includes('có')) {
            if (lowerExplanation.includes('oui') || lowerExplanation.includes('có')) {
                return language === 'fr' ? 'Oui' : 'Có';
            } else if (lowerExplanation.includes('non') || lowerExplanation.includes('không')) {
                return language === 'fr' ? 'Non' : 'Không';
            }
        }

        // Default: use first sentence of explanation as answer
        const firstSentence = explanation.split(/[.!?]/)[0].trim();
        return firstSentence.substring(0, 100) + (firstSentence.length > 100 ? '...' : '');
    };

    const generateDistractors = (questionText: string, correctAnswer: string, categoryId: string): string[] => {
        const lowerQuestion = questionText.toLowerCase();

        // Generate contextually relevant wrong answers based on question type and category
        const distractors: string[] = [];

        // For date questions
        if (correctAnswer.match(/\d{4}/)) {
            const year = parseInt(correctAnswer);
            distractors.push(
                (year - 10).toString(),
                (year + 15).toString(),
                (year - 25).toString()
            );
        }
        // For century questions
        else if (correctAnswer.includes('siècle')) {
            const centuries = ['XVIe siècle', 'XVIIe siècle', 'XVIIIe siècle', 'XIXe siècle', 'XXe siècle'];
            distractors.push(...centuries.filter(c => c !== correctAnswer).slice(0, 3));
        }
        // For yes/no questions
        else if (correctAnswer === 'Oui' || correctAnswer === 'Có') {
            distractors.push(language === 'fr' ? 'Non' : 'Không');
            distractors.push(language === 'fr' ? 'Partiellement' : 'Một phần');
            distractors.push(language === 'fr' ? 'Cela dépend' : 'Tùy thuộc');
        }
        else if (correctAnswer === 'Non' || correctAnswer === 'Không') {
            distractors.push(language === 'fr' ? 'Oui' : 'Có');
            distractors.push(language === 'fr' ? 'Seulement dans certains cas' : 'Chỉ trong một số trường hợp');
            distractors.push(language === 'fr' ? 'Depuis récemment' : 'Từ gần đây');
        }
        // For historical figures
        else if (correctAnswer.match(/^[A-Z][a-z]+ [A-Z][a-z]+$/)) {
            const historicalFigures = [
                'Napoléon Bonaparte', 'Louis XIV', 'Charles de Gaulle',
                'Marie Antoinette', 'Robespierre', 'Voltaire', 'Victor Hugo'
            ].filter(name => name !== correctAnswer);
            distractors.push(...historicalFigures.slice(0, 3));
        }
        // For locations
        else if (categoryId.includes('geography') || lowerQuestion.includes('où')) {
            const locations = [
                'Paris', 'Lyon', 'Marseille', 'Bordeaux', 'Lille',
                'Strasbourg', 'Versailles', 'Normandie'
            ].filter(loc => loc !== correctAnswer);
            distractors.push(...locations.slice(0, 3));
        }
        // Default educational distractors
        else {
            const defaultDistractors = [
                language === 'fr' ? 'Cette information n\'est pas correcte' : 'Thông tin này không chính xác',
                language === 'fr' ? 'Cela dépend du contexte' : 'Tùy thuộc vào bối cảnh',
                language === 'fr' ? 'Une autre réponse plus appropriée' : 'Một câu trả lời khác phù hợp hơn'
            ];
            distractors.push(...defaultDistractors);
        }

        // Ensure we have exactly 3 distractors
        while (distractors.length < 3) {
            distractors.push(language === 'fr' ? 'Réponse alternative' : 'Câu trả lời thay thế');
        }

        return distractors.slice(0, 3);
    };

    const shuffleArray = <T,>(array: T[]): T[] => {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    };

    const handleTimeUp = async () => {
        Alert.alert(
            language === 'fr' ? 'Temps écoulé' : 'Hết giờ',
            language === 'fr' ? 'Le temps est écoulé. Le test va se terminer.' : 'Thời gian đã hết. Bài kiểm tra sẽ kết thúc.',
            [{ text: 'OK', onPress: handleFinishTest }]
        );
    };

    const handleAnswerSelect = (answer: string) => {
        if (showExplanation) return;
        setSelectedAnswer(answer);
    };

    const handleSubmitAnswer = async () => {
        if (!currentQuestion || !selectedAnswer || isSubmitting) return;

        setIsSubmitting(true);

        try {
            const timeSpent = Math.floor((new Date().getTime() - questionStartTime.getTime()) / 1000);
            const isCorrect = selectedAnswer === correctAnswerText;

            const answer: TestAnswer = {
                questionId: currentQuestion.id,
                isCorrect,
                userAnswer: selectedAnswer,
                timeSpent,
                timestamp: new Date(),
            };

            await submitAnswer(answer);
            setShowExplanation(true);

            // Auto advance after showing explanation (if not last question)
            setTimeout(() => {
                if (currentQuestionIndex < (currentSession?.totalQuestions ?? 0) - 1) {
                    handleNextQuestion();
                } else {
                    handleFinishTest();
                }
            }, 3000);
        } catch (error) {
            console.error('Error submitting answer:', error);
            Alert.alert(
                language === 'fr' ? 'Erreur' : 'Lỗi',
                language === 'fr' ? 'Erreur lors de la soumission de la réponse' : 'Lỗi khi nộp câu trả lời'
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleNextQuestion = () => {
        if (currentQuestionIndex < (currentSession?.totalQuestions ?? 0) - 1) {
            // Move to next question handled by context
            setSelectedAnswer(null);
            setShowExplanation(false);
        } else {
            handleFinishTest();
        }
    };

    const handleFinishTest = async () => {
        try {
            const result = await finishTest();
            navigation.navigate('TestResult', undefined);
        } catch (error) {
            console.error('Error finishing test:', error);
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
                        cancelTest();
                        // Use goBack to return to the previous screen (TestScreen)
                        navigation.goBack();
                    },
                },
            ]
        );
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
                            <Ionicons name="close" size={24} color={theme.colors.headerText} />
                        </TouchableOpacity>

                        <View style={styles.questionCounter}>
                            <FormattedText style={[styles.questionCounterText, { color: theme.colors.headerText }]}>
                                {currentQuestionIndex + 1} / {currentSession.totalQuestions}
                            </FormattedText>
                        </View>

                        <View style={styles.headerRight}>
                            {timeLeft !== null && (
                                <View style={[styles.timer, { backgroundColor: timeLeft < 60 ? theme.colors.error : theme.colors.primary }]}>
                                    <Ionicons name="time" size={16} color="white" />
                                    <FormattedText style={styles.timerText}>{formatTime(timeLeft)}</FormattedText>
                                </View>
                            )}

                            <View style={styles.languageSelector}>
                                <FormattedText style={[styles.languageLabel, { color: theme.colors.headerText }]}>FR</FormattedText>
                                <Switch
                                    value={language === 'vi'}
                                    onValueChange={toggleLanguage}
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
                                {language === 'fr' ? 'Question' : 'Câu hỏi'} {currentQuestionIndex + 1}
                            </FormattedText>
                            {currentQuestion.categoryTitle && (
                                <View style={[styles.categoryBadge, { backgroundColor: theme.colors.primaryLight }]}>
                                    <FormattedText style={[styles.categoryBadgeText, { color: theme.colors.primary }]}>
                                        {currentQuestion.categoryTitle}
                                    </FormattedText>
                                </View>
                            )}
                        </View>

                        <FormattedText style={[styles.questionText, { color: theme.colors.text }]}>
                            {language === 'fr' ? currentQuestion.question : (currentQuestion.question_vi || currentQuestion.question)}
                        </FormattedText>

                        {currentQuestion.image && (
                            <Image
                                source={getCachedImageSource(currentQuestion.image) || { uri: currentQuestion.image }}
                                style={styles.questionImage}
                            />
                        )}
                    </View>

                    {/* Answer Options */}
                    <View style={styles.answersContainer}>
                        <FormattedText style={[styles.answersLabel, { color: theme.colors.text }]}>
                            {language === 'fr' ? 'Choisissez la bonne réponse:' : 'Chọn câu trả lời đúng:'}
                        </FormattedText>

                        {answerOptions.map((option, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[
                                    styles.answerOption,
                                    {
                                        backgroundColor: theme.colors.surface,
                                        borderColor: selectedAnswer === option.text ? theme.colors.primary : theme.colors.border,
                                        borderWidth: selectedAnswer === option.text ? 2 : 1,
                                    },
                                    showExplanation && option.isCorrect && styles.correctAnswer,
                                    showExplanation && selectedAnswer === option.text && !option.isCorrect && styles.incorrectAnswer,
                                ]}
                                onPress={() => handleAnswerSelect(option.text)}
                                disabled={showExplanation}
                                activeOpacity={0.8}
                            >
                                <View style={styles.answerContent}>
                                    <View style={[
                                        styles.answerIndicator,
                                        {
                                            backgroundColor: selectedAnswer === option.text ? theme.colors.primary : 'transparent',
                                            borderColor: theme.colors.border
                                        }
                                    ]}>
                                        {selectedAnswer === option.text && (
                                            <Ionicons name="checkmark" size={16} color="white" />
                                        )}
                                    </View>
                                    <FormattedText style={[styles.answerText, { color: theme.colors.text }]}>
                                        {option.text}
                                    </FormattedText>
                                </View>

                                {showExplanation && option.isCorrect && (
                                    <Ionicons name="checkmark-circle" size={24} color={theme.colors.success} />
                                )}
                                {showExplanation && selectedAnswer === option.text && !option.isCorrect && (
                                    <Ionicons name="close-circle" size={24} color={theme.colors.error} />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Explanation */}
                    {showExplanation && currentQuestion.explanation && (
                        <View style={[styles.explanationCard, { backgroundColor: theme.colors.surface }]}>
                            <View style={styles.explanationHeader}>
                                <Ionicons name="information-circle" size={20} color={theme.colors.primary} />
                                <FormattedText style={[styles.explanationTitle, { color: theme.colors.text }]}>
                                    {language === 'fr' ? 'Explication' : 'Giải thích'}
                                </FormattedText>
                            </View>
                            <FormattedText style={[styles.explanationText, { color: theme.colors.textMuted }]}>
                                {language === 'fr' ? currentQuestion.explanation : (currentQuestion.explanation_vi || currentQuestion.explanation)}
                            </FormattedText>
                        </View>
                    )}
                </ScrollView>

                {/* Action Button */}
                <View style={[styles.actionContainer, { backgroundColor: theme.colors.surface }]}>
                    {!showExplanation ? (
                        <TouchableOpacity
                            style={[
                                styles.actionButton,
                                {
                                    backgroundColor: selectedAnswer ? theme.colors.primary : theme.colors.textMuted,
                                    opacity: selectedAnswer ? 1 : 0.6
                                }
                            ]}
                            onPress={handleSubmitAnswer}
                            disabled={!selectedAnswer || isSubmitting}
                        >
                            {isSubmitting ? (
                                <ActivityIndicator color="white" size="small" />
                            ) : (
                                <>
                                    <FormattedText style={styles.actionButtonText}>
                                        {language === 'fr' ? 'Valider' : 'Xác nhận'}
                                    </FormattedText>
                                    <Ionicons name="checkmark" size={20} color="white" />
                                </>
                            )}
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
                            onPress={currentQuestionIndex < currentSession.totalQuestions - 1 ? handleNextQuestion : handleFinishTest}
                        >
                            <FormattedText style={styles.actionButtonText}>
                                {currentQuestionIndex < currentSession.totalQuestions - 1
                                    ? (language === 'fr' ? 'Suivant' : 'Tiếp theo')
                                    : (language === 'fr' ? 'Terminer' : 'Hoàn thành')
                                }
                            </FormattedText>
                            <Ionicons
                                name={currentQuestionIndex < currentSession.totalQuestions - 1 ? "arrow-forward" : "checkmark-done"}
                                size={20}
                                color="white"
                            />
                        </TouchableOpacity>
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    questionLabel: {
        fontSize: 14,
        fontWeight: '500',
    },
    categoryBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    categoryBadgeText: {
        fontSize: 12,
        fontWeight: '600',
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
    answersContainer: {
        marginBottom: 24,
    },
    answersLabel: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 16,
    },
    answerOption: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        elevation: 1,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    answerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    answerIndicator: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        marginRight: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    answerText: {
        flex: 1,
        fontSize: 16,
        lineHeight: 22,
    },
    correctAnswer: {
        backgroundColor: '#E8F5E8',
        borderColor: '#4CAF50',
    },
    incorrectAnswer: {
        backgroundColor: '#FFEBEE',
        borderColor: '#F44336',
    },
    explanationCard: {
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        elevation: 2,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    explanationHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    explanationTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    explanationText: {
        fontSize: 15,
        lineHeight: 22,
    },
    actionContainer: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 12,
    },
    actionButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
        marginRight: 8,
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
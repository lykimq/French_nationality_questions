import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    View,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    Image,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useTheme } from '../shared/contexts/ThemeContext';
import { useLanguage } from '../shared/contexts/LanguageContext';
import { useTest } from './contexts/TestContext';
import { FormattedText, LanguageToggle, BackButton } from '../shared/components';
import { TestQuestion, TestStackParamList } from '../types';
import { getCachedImageSource, getQuestionTextWithDualLanguage, getExplanationTextWithDualLanguage } from '../shared/utils';
import { getLocalizedText as buildLocalizedText } from './utils';

type ReviewScreenNavigationProp = NativeStackNavigationProp<TestStackParamList>;

const ReviewScreen = () => {
    const navigation = useNavigation<ReviewScreenNavigationProp>();
    const { theme, themeMode } = useTheme();
    const { language, toggleLanguage } = useLanguage();
    const { getIncorrectQuestions, testProgress, isLoading } = useTest();
    const getLocalizedText = buildLocalizedText(language);

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [showAnswer, setShowAnswer] = useState(false);
    const [incorrectQuestions, setIncorrectQuestions] = useState<TestQuestion[]>([]);

    // Load incorrect questions on mount
    useEffect(() => {
        const questions = getIncorrectQuestions();
        setIncorrectQuestions(questions);

        // Reset state when questions change
        setCurrentQuestionIndex(0);
        setShowAnswer(false);
    }, [testProgress.incorrectQuestions]);

    // Reset state when question changes
    useEffect(() => {
        setShowAnswer(false);
    }, [currentQuestionIndex]);

    const getQuestionText = (): string => {
        const currentQuestion = incorrectQuestions[currentQuestionIndex];
        return getQuestionTextWithDualLanguage(currentQuestion, language);
    };

    const getExplanationText = (): string => {
        const currentQuestion = incorrectQuestions[currentQuestionIndex];
        return getExplanationTextWithDualLanguage(currentQuestion, language);
    };

    const handleRevealAnswer = () => {
        setShowAnswer(true);
    };

    const handleNextQuestion = () => {
        if (currentQuestionIndex < incorrectQuestions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
    };

    const handlePreviousQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        }
    };

    const handleGoBack = () => {
        navigation.goBack();
    };

    const currentQuestion = incorrectQuestions[currentQuestionIndex];

    if (isLoading) {
        return (
            <View style={[styles.container, { backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <FormattedText style={[styles.loadingText, { color: theme.colors.textMuted, marginTop: 16 }]}>
                    {getLocalizedText('Chargement...', 'Đang tải...')}
                </FormattedText>
            </View>
        );
    }

    if (incorrectQuestions.length === 0) {
        return (
            <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
                <StatusBar barStyle={themeMode === 'dark' ? 'light-content' : 'dark-content'} />

                <SafeAreaView style={{ flex: 1 }} edges={['top']}>
                    {/* Header */}
                    <View style={[styles.header, { backgroundColor: theme.colors.headerBackground }]}>
                        <View style={styles.headerTop}>
                            <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
                                <Ionicons name="arrow-back" size={24} color={theme.colors.headerText} />
                            </TouchableOpacity>

                            <FormattedText style={[styles.headerTitle, { color: theme.colors.headerText }]}>
                                {getLocalizedText('Révision des Questions', 'Ôn tập câu hỏi')}
                            </FormattedText>

                            <LanguageToggle
                                language={language}
                                onToggle={toggleLanguage}
                                textColor={theme.colors.headerText}
                                style={styles.languageToggle}
                                labelStyle={styles.languageToggleLabel}
                            />
                        <LanguageToggle
                            language={language}
                            onToggle={toggleLanguage}
                            textColor={theme.colors.headerText}
                            style={styles.languageToggle}
                            labelStyle={styles.languageToggleLabel}
                        />
                        </View>
                    </View>

                    {/* Empty state */}
                    <View style={styles.emptyStateContainer}>
                        <Ionicons name="checkmark-circle" size={80} color={theme.colors.success} />
                        <FormattedText style={[styles.emptyStateTitle, { color: theme.colors.text }]}>
                            {getLocalizedText('Excellent travail !', 'Làm tốt lắm!')}
                        </FormattedText>
                        <FormattedText style={[styles.emptyStateDescription, { color: theme.colors.textMuted }]}>
                            {getLocalizedText(
                                'Vous n\'avez aucune question incorrecte à réviser pour le moment.',
                                'Bạn không có câu hỏi sai nào để xem lại vào lúc này.'
                            )}
                        </FormattedText>

                        <TouchableOpacity
                            style={[styles.takeTestButton, { backgroundColor: theme.colors.primary }]}
                            onPress={handleGoBack}
                        >
                            <Ionicons name="arrow-back" size={20} color="white" />
                            <FormattedText style={styles.takeTestButtonText}>
                                {getLocalizedText('Retour aux tests', 'Quay lại bài test')}
                            </FormattedText>
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <StatusBar barStyle={themeMode === 'dark' ? 'light-content' : 'dark-content'} />

            <SafeAreaView style={{ flex: 1 }} edges={['top']}>
                {/* Header with navigation */}
                <View style={[styles.header, { backgroundColor: theme.colors.headerBackground }]}>
                    <View style={styles.headerTop}>
                        <BackButton onPress={handleGoBack} />

                        <View style={styles.questionCounter}>
                            <FormattedText style={[styles.questionCounterText, { color: theme.colors.headerText }]}>
                                {currentQuestionIndex + 1} / {incorrectQuestions.length}
                            </FormattedText>
                            {/* Show question ID for debugging */}
                            <FormattedText style={[styles.questionIdText, { color: theme.colors.textMuted }]}>
                                ID: {currentQuestion?.id}
                            </FormattedText>
                        </View>

                        <LanguageToggle
                            language={language}
                            onToggle={toggleLanguage}
                            textColor={theme.colors.headerText}
                            style={styles.languageToggle}
                            labelStyle={styles.languageToggleLabel}
                        />
                    </View>

                    {/* Progress bar */}
                    <View style={[styles.progressContainer, { backgroundColor: theme.colors.border }]}>
                        <LinearGradient
                            colors={[theme.colors.primary, theme.colors.primaryLight]}
                            style={[styles.progressBar, { width: `${((currentQuestionIndex + 1) / incorrectQuestions.length) * 100}%` }]}
                        />
                    </View>
                </View>

                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.contentContainer}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Review Notice */}
                    <View style={[styles.reviewNoticeCard, { backgroundColor: theme.colors.accent, borderColor: theme.colors.warning }]}>
                        <View style={styles.reviewNoticeHeader}>
                            <Ionicons name="school" size={20} color={theme.colors.warning} />
                            <FormattedText style={[styles.reviewNoticeTitle, { color: theme.colors.text }]}>
                                {getLocalizedText('Mode Révision', 'Chế độ ôn tập')}
                            </FormattedText>
                        </View>
                        <FormattedText style={[styles.reviewNoticeText, { color: theme.colors.textMuted }]}>
                            {getLocalizedText(
                                'Cette question a été répondue incorrectement lors de tests précédents.',
                                'Câu hỏi này đã được trả lời sai trong các bài kiểm tra trước.'
                            )}
                        </FormattedText>
                    </View>

                    {/* Question Card */}
                    <View style={[styles.questionCard, { backgroundColor: theme.colors.surface }]}>
                        <View style={styles.questionHeader}>
                            <FormattedText style={[styles.questionLabel, { color: theme.colors.textMuted }]}>
                                {getLocalizedText('Question à réviser', 'Câu hỏi cần ôn tập')} {currentQuestionIndex + 1}
                            </FormattedText>
                            {currentQuestion?.categoryTitle && (
                                <View style={[styles.categoryBadge, { backgroundColor: theme.colors.primaryLight }]}>
                                    <FormattedText style={[styles.categoryBadgeText, { color: theme.colors.primary }]}>
                                        {currentQuestion.categoryTitle}
                                    </FormattedText>
                                </View>
                            )}
                        </View>

                        <FormattedText style={[styles.questionText, { color: theme.colors.text }]}>
                            {getQuestionText()}
                        </FormattedText>

                        {currentQuestion?.image && (
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
                                <Ionicons name="bulb" size={20} color={theme.colors.warning} />
                                <FormattedText style={[styles.instructionTitle, { color: theme.colors.text }]}>
                                    {getLocalizedText('Instructions', 'Hướng dẫn')}
                                </FormattedText>
                            </View>
                            <FormattedText style={[styles.instructionText, { color: theme.colors.textMuted }]}>
                                {getLocalizedText(
                                    'Réfléchissez à votre réponse, puis cliquez sur "Voir la réponse" pour découvrir la réponse correcte et améliorer vos connaissances.',
                                    'Hãy suy nghĩ về câu trả lời của bạn, sau đó nhấn "Xem đáp án" để khám phá câu trả lời đúng và cải thiện kiến thức của bạn.'
                                )}
                            </FormattedText>
                        </View>
                    )}

                    {/* Answer Section */}
                    {showAnswer && currentQuestion?.explanation && (
                        <View style={[styles.answerCard, { backgroundColor: theme.colors.surface }]}>
                            <View style={styles.answerHeader}>
                                <Ionicons name="checkmark-circle" size={20} color={theme.colors.success} />
                                <FormattedText style={[styles.answerTitle, { color: theme.colors.text }]}>
                                    {getLocalizedText('Réponse correcte', 'Đáp án đúng')}
                                </FormattedText>
                            </View>
                            <FormattedText style={[styles.answerText, { color: theme.colors.textMuted }]}>
                                {getExplanationText()}
                            </FormattedText>
                        </View>
                    )}
                </ScrollView>

                {/* Bottom Navigation */}
                <View style={[styles.bottomBar, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border }]}>
                    {!showAnswer ? (
                        <TouchableOpacity
                            style={[styles.actionButton, styles.revealButton, { backgroundColor: theme.colors.primary }]}
                            onPress={handleRevealAnswer}
                        >
                            <Ionicons name="eye" size={20} color="white" />
                            <FormattedText style={styles.actionButtonText}>
                                {getLocalizedText('Voir la réponse', 'Xem đáp án')}
                            </FormattedText>
                        </TouchableOpacity>
                    ) : (
                        <View style={styles.navigationButtons}>
                            <TouchableOpacity
                                style={[
                                    styles.navButton,
                                    { backgroundColor: theme.colors.border },
                                    currentQuestionIndex === 0 && styles.navButtonDisabled
                                ]}
                                onPress={handlePreviousQuestion}
                                disabled={currentQuestionIndex === 0}
                            >
                                <Ionicons
                                    name="chevron-back"
                                    size={20}
                                    color={currentQuestionIndex === 0 ? theme.colors.textMuted : theme.colors.text}
                                />
                                <FormattedText style={[
                                    styles.navButtonText,
                                    { color: currentQuestionIndex === 0 ? theme.colors.textMuted : theme.colors.text }
                                ]}>
                                    {getLocalizedText('Précédent', 'Trước')}
                                </FormattedText>
                            </TouchableOpacity>

                            {currentQuestionIndex < incorrectQuestions.length - 1 ? (
                                <TouchableOpacity
                                    style={[styles.navButton, { backgroundColor: theme.colors.primary }]}
                                    onPress={handleNextQuestion}
                                >
                                    <FormattedText style={[styles.navButtonText, { color: 'white' }]}>
                                        {getLocalizedText('Suivant', 'Tiếp')}
                                    </FormattedText>
                                    <Ionicons name="chevron-forward" size={20} color="white" />
                                </TouchableOpacity>
                            ) : (
                                <TouchableOpacity
                                    style={[styles.navButton, { backgroundColor: theme.colors.success }]}
                                    onPress={handleGoBack}
                                >
                                    <Ionicons name="checkmark" size={20} color="white" />
                                    <FormattedText style={[styles.navButtonText, { color: 'white' }]}>
                                        {getLocalizedText('Terminé', 'Hoàn thành')}
                                    </FormattedText>
                                </TouchableOpacity>
                            )}
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
    headerTitle: {
        fontSize: 20,
        fontWeight: '600',
        flex: 1,
        textAlign: 'center',
    },
    backButton: {
        padding: 8,
        marginRight: 16,
    },
    questionCounter: {
        alignItems: 'center',
    },
    questionCounterText: {
        fontSize: 18,
        fontWeight: '600',
    },
    questionIdText: {
        fontSize: 12,
        marginTop: 2,
    },
    languageToggle: {
        marginLeft: 12,
    },
    languageToggleLabel: {
        fontSize: 14,
        fontWeight: 'bold',
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
        paddingBottom: 120,
    },
    reviewNoticeCard: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
        borderWidth: 1,
    },
    reviewNoticeHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    reviewNoticeTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    reviewNoticeText: {
        fontSize: 14,
        lineHeight: 20,
    },
    questionCard: {
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
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
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    categoryBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 16,
    },
    categoryBadgeText: {
        fontSize: 12,
        fontWeight: '600',
    },
    questionText: {
        fontSize: 18,
        lineHeight: 26,
        marginBottom: 16,
    },
    questionImage: {
        width: '100%',
        height: 200,
        borderRadius: 12,
        resizeMode: 'contain',
    },
    instructionCard: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
    },
    instructionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    instructionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    instructionText: {
        fontSize: 14,
        lineHeight: 20,
    },
    answerCard: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
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
        fontSize: 16,
        lineHeight: 24,
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
        borderTopWidth: 1,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 12,
    },
    revealButton: {
        marginBottom: 0,
    },
    actionButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    navigationButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    navButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 12,
    },
    navButtonDisabled: {
        opacity: 0.5,
    },
    navButtonText: {
        fontSize: 16,
        fontWeight: '600',
        marginHorizontal: 4,
    },
    emptyStateContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyStateTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 12,
        textAlign: 'center',
    },
    emptyStateDescription: {
        fontSize: 16,
        lineHeight: 24,
        textAlign: 'center',
        marginBottom: 32,
    },
    takeTestButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 16,
        borderRadius: 12,
    },
    takeTestButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    loadingText: {
        fontSize: 16,
    },
});

export default ReviewScreen;
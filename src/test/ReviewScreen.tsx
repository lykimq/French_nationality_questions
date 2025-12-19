import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    View,
    ScrollView,
    StatusBar,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useTheme } from '../shared/contexts/ThemeContext';
import { useTest } from './contexts/TestContext';
import { FormattedText } from '../shared/components';
import { TestQuestion, TestStackParamList } from '../types';
import {
    ReviewHeader,
    ReviewQuestionCard,
    ReviewAnswerCard,
    ReviewNavigation,
    ReviewEmptyState,
    ReviewNoticeCard,
    ReviewInstructionCard,
} from './components/review';

type ReviewScreenNavigationProp = NativeStackNavigationProp<TestStackParamList>;

const ReviewScreen = () => {
    const navigation = useNavigation<ReviewScreenNavigationProp>();
    const { theme, themeMode } = useTheme();
    const { getIncorrectQuestions, testProgress, isLoading } = useTest();

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
                    Chargement...
                </FormattedText>
            </View>
        );
    }

    if (incorrectQuestions.length === 0) {
        return (
            <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
                <StatusBar barStyle={themeMode === 'dark' ? 'light-content' : 'dark-content'} />

                <SafeAreaView style={{ flex: 1 }} edges={['top']}>
                    <View style={[styles.header, { backgroundColor: theme.colors.headerBackground }]}>
                        <View style={styles.headerTop}>
                            <FormattedText style={[styles.headerTitle, { color: theme.colors.headerText }]}>
                                Révision des Questions
                            </FormattedText>
                        </View>
                    </View>

                    <ReviewEmptyState onGoBack={handleGoBack} />
                </SafeAreaView>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <StatusBar barStyle={themeMode === 'dark' ? 'light-content' : 'dark-content'} />

            <SafeAreaView style={{ flex: 1 }} edges={['top']}>
                <ReviewHeader
                    currentIndex={currentQuestionIndex}
                    totalQuestions={incorrectQuestions.length}
                    currentQuestionId={currentQuestion?.id}
                    onGoBack={handleGoBack}
                />

                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.contentContainer}
                    showsVerticalScrollIndicator={false}
                >
                    <ReviewNoticeCard />

                    {currentQuestion && (
                        <ReviewQuestionCard
                            question={currentQuestion}
                            questionIndex={currentQuestionIndex}
                        />
                    )}

                    {!showAnswer && <ReviewInstructionCard />}

                    {showAnswer && currentQuestion && (
                        <ReviewAnswerCard question={currentQuestion} />
                    )}
                </ScrollView>

                <ReviewNavigation
                    showAnswer={showAnswer}
                    currentIndex={currentQuestionIndex}
                    totalQuestions={incorrectQuestions.length}
                    onRevealAnswer={handleRevealAnswer}
                    onNextQuestion={handleNextQuestion}
                    onPreviousQuestion={handlePreviousQuestion}
                    onFinish={handleGoBack}
                />
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
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '600',
    },
    scrollView: {
        flex: 1,
    },
    contentContainer: {
        padding: 20,
        paddingBottom: 120,
    },
    loadingText: {
        fontSize: 16,
    },
});

export default ReviewScreen;
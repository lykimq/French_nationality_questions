import React, { useEffect } from 'react';
import {
    StyleSheet,
    View,
    ScrollView,
    StatusBar,
    TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useTheme } from '../../shared/contexts/ThemeContext';
import { FormattedText, Icon3D } from '../../shared/components';
import { sharedStyles } from '../../shared/utils';
import { CIVIC_EXAM_CONFIG } from '../constants/civicExamConstants';
import { deserializeCivicExamResult, type SerializableCivicExamResult } from '../utils/civicExamSerialization';
import {
    getCivicExamQuestionText,
    getUserAnswerText,
    getCorrectAnswerText,
    parseUserAnswerIndex,
    type CivicExamQuestionWithOptions,
} from '../utils/civicExamQuestionUtils';
import type { CivicExamStackParamList, CivicExamQuestion } from '../types';

type CivicExamResultScreenNavigationProp = NativeStackNavigationProp<CivicExamStackParamList>;
type RouteParams = {
    result: SerializableCivicExamResult;
};

const CivicExamResultScreen = () => {
    const navigation = useNavigation<CivicExamResultScreenNavigationProp>();
    const route = useRoute();
    const { theme, themeMode } = useTheme();
    const serializedResult = (route.params as RouteParams)?.result;
    const result = serializedResult ? deserializeCivicExamResult(serializedResult) : null;

    // Handle navigation when result is missing (useEffect to avoid render-time navigation)
    useEffect(() => {
        if (!result) {
            navigation.navigate('CivicExamHome');
        }
    }, [result, navigation]);

    if (!result) {
        return null;
    }

    const { passed, score, correctAnswers, totalQuestions, incorrectQuestions, session } = result;

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <StatusBar barStyle={themeMode === 'dark' ? 'light-content' : 'dark-content'} />

            <SafeAreaView style={{ flex: 1 }} edges={['top']}>
                <View style={[styles.header, { backgroundColor: theme.colors.headerBackground }]}>
                    <FormattedText style={[styles.headerTitle, { color: theme.colors.headerText }]}>
                        Résultats
                    </FormattedText>
                </View>

                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.contentContainer}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={[styles.resultCard, { backgroundColor: passed ? '#4CAF50' : theme.colors.error }]}>
                        <Icon3D
                            name={passed ? 'checkmark-circle' : 'close-circle'}
                            size={52}
                            color="#FFFFFF"
                            variant="neon"
                        />
                        <FormattedText style={styles.resultTitle}>
                            {passed ? 'Examen réussi !' : 'Examen échoué'}
                        </FormattedText>
                        <FormattedText style={styles.resultScore}>
                            {score}%
                        </FormattedText>
                        <FormattedText style={styles.resultDetails}>
                            {correctAnswers} / {totalQuestions} bonnes réponses
                        </FormattedText>
                        <FormattedText style={styles.resultThreshold}>
                            {(() => {
                                const passingScore = Math.ceil((totalQuestions * CIVIC_EXAM_CONFIG.PASSING_PERCENTAGE) / 100);
                                if (totalQuestions === CIVIC_EXAM_CONFIG.TOTAL_QUESTIONS) {
                                    return `Minimum requis: ${CIVIC_EXAM_CONFIG.PASSING_SCORE}/${CIVIC_EXAM_CONFIG.TOTAL_QUESTIONS} (${CIVIC_EXAM_CONFIG.PASSING_PERCENTAGE}%)`;
                                } else {
                                    return `Minimum requis: ${passingScore}/${totalQuestions} (${CIVIC_EXAM_CONFIG.PASSING_PERCENTAGE}%)`;
                                }
                            })()}
                        </FormattedText>
                    </View>

                    {incorrectQuestions.length > 0 && (
                        <View style={[styles.incorrectCard, { backgroundColor: theme.colors.card }]}>
                            <FormattedText style={[styles.incorrectTitle, { color: theme.colors.text }]}>
                                Questions incorrectes ({incorrectQuestions.length})
                            </FormattedText>
                            {incorrectQuestions.map((question) => {
                                const civicQuestion = question as CivicExamQuestionWithOptions;
                                const userAnswer = session.answers.find(a => a.questionId === question.id);
                                const userAnswerIndex = parseUserAnswerIndex(userAnswer?.userAnswer);
                                const userAnswerText = getUserAnswerText(civicQuestion, userAnswerIndex);
                                const correctAnswerText = getCorrectAnswerText(civicQuestion);
                                
                                return (
                                    <View key={question.id} style={styles.incorrectItem}>
                                        <FormattedText style={[styles.incorrectQuestion, { color: theme.colors.text }]}>
                                            {getCivicExamQuestionText(question)}
                                        </FormattedText>
                                        
                                        <View style={[styles.answerSection, { marginTop: 12 }]}>
                                            <View style={[styles.answerRow, { marginBottom: 8 }]}>
                                                <View style={[styles.answerLabel, { backgroundColor: theme.colors.error + '20' }]}>
                                                    <Icon3D name="close-circle" size={14} color={theme.colors.error} variant="default" />
                                                    <FormattedText style={[styles.answerLabelText, { color: theme.colors.error }]}>
                                                        Votre réponse:
                                                    </FormattedText>
                                                </View>
                                                <FormattedText style={[styles.answerText, { color: theme.colors.text }]}>
                                                    {userAnswerText}
                                                </FormattedText>
                                            </View>
                                            
                                            <View style={styles.answerRow}>
                                                <View style={[styles.answerLabel, { backgroundColor: '#4CAF50' + '20' }]}>
                                                    <Icon3D name="checkmark-circle" size={14} color="#4CAF50" variant="default" />
                                                    <FormattedText style={[styles.answerLabelText, { color: '#4CAF50' }]}>
                                                        Bonne réponse:
                                                    </FormattedText>
                                                </View>
                                                <FormattedText style={[styles.answerText, { color: theme.colors.text }]}>
                                                    {correctAnswerText}
                                                </FormattedText>
                                            </View>
                                        </View>
                                    </View>
                                );
                            })}
                        </View>
                    )}
                </ScrollView>

                <View style={[styles.footer, { backgroundColor: theme.colors.card, borderTopColor: theme.colors.border }]}>
                    <TouchableOpacity
                        style={[styles.button, { backgroundColor: theme.colors.primary }]}
                        onPress={() => navigation.navigate('CivicExamHome')}
                        activeOpacity={0.8}
                    >
                        <FormattedText style={[styles.buttonText, { color: '#FFFFFF' }]}>
                            Retour à l'accueil
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
    header: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    scrollView: {
        flex: 1,
    },
    contentContainer: {
        padding: 20,
        paddingBottom: 100,
    },
    resultCard: {
        borderRadius: 16,
        padding: 32,
        alignItems: 'center',
        marginBottom: 24,
    },
    resultTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginTop: 16,
        marginBottom: 8,
    },
    resultScore: {
        fontSize: 48,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 8,
    },
    resultDetails: {
        fontSize: 18,
        color: '#FFFFFF',
        marginBottom: 8,
    },
    resultThreshold: {
        fontSize: 14,
        color: '#FFFFFF',
        opacity: 0.9,
    },
    incorrectCard: {
        borderRadius: 12,
        padding: 20,
    },
    incorrectTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    incorrectItem: {
        marginBottom: 16,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.1)',
    },
    incorrectQuestion: {
        fontSize: 15,
        lineHeight: 22,
        fontWeight: '600',
    },
    answerSection: {
        marginTop: 12,
    },
    answerRow: {
        marginBottom: 8,
    },
    answerLabel: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        marginBottom: 6,
        gap: 6,
        alignSelf: 'flex-start',
    },
    answerLabelText: {
        fontSize: 13,
        fontWeight: '600',
    },
    answerText: {
        fontSize: 15,
        lineHeight: 22,
        paddingLeft: 4,
    },
    moreText: {
        fontSize: 14,
        fontStyle: 'italic',
        marginTop: 8,
    },
    footer: {
        padding: 20,
        borderTopWidth: 1,
    },
    button: {
        borderRadius: 12,
        padding: 18,
        alignItems: 'center',
    },
    buttonText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default CivicExamResultScreen;


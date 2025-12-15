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
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../../shared/contexts/ThemeContext';
import { useLanguage } from '../../shared/contexts/LanguageContext';
import { FormattedText } from '../../shared/components';
import { sharedStyles } from '../../shared/utils';
import { CIVIC_EXAM_CONFIG } from '../constants/civicExamConstants';
import { deserializeCivicExamResult, type SerializableCivicExamResult } from '../utils/civicExamSerialization';
import type { CivicExamStackParamList } from '../types';

type CivicExamResultScreenNavigationProp = NativeStackNavigationProp<CivicExamStackParamList>;
type RouteParams = {
    result: SerializableCivicExamResult;
};

const CivicExamResultScreen = () => {
    const navigation = useNavigation<CivicExamResultScreenNavigationProp>();
    const route = useRoute();
    const { theme, themeMode } = useTheme();
    const { language } = useLanguage();

    const serializedResult = (route.params as RouteParams)?.result;
    const result = serializedResult ? deserializeCivicExamResult(serializedResult) : null;

    const getLocalizedText = (fr: string, vi: string) => {
        return language === 'fr' ? fr : vi;
    };

    // Handle navigation when result is missing (useEffect to avoid render-time navigation)
    useEffect(() => {
        if (!result) {
            navigation.navigate('CivicExamHome');
        }
    }, [result, navigation]);

    if (!result) {
        return null;
    }

    const { passed, score, correctAnswers, totalQuestions, incorrectQuestions } = result;

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <StatusBar barStyle={themeMode === 'dark' ? 'light-content' : 'dark-content'} />

            <SafeAreaView style={{ flex: 1 }} edges={['top']}>
                <View style={[styles.header, { backgroundColor: theme.colors.headerBackground }]}>
                    <FormattedText style={[styles.headerTitle, { color: theme.colors.headerText }]}>
                        {getLocalizedText('Résultats', 'Kết quả')}
                    </FormattedText>
                </View>

                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.contentContainer}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={[styles.resultCard, { backgroundColor: passed ? '#4CAF50' : theme.colors.error }]}>
                        <Ionicons
                            name={passed ? 'checkmark-circle' : 'close-circle'}
                            size={64}
                            color="#FFFFFF"
                        />
                        <FormattedText style={styles.resultTitle}>
                            {passed
                                ? getLocalizedText('Examen réussi !', 'Đã đạt!')
                                : getLocalizedText('Examen échoué', 'Chưa đạt')
                            }
                        </FormattedText>
                        <FormattedText style={styles.resultScore}>
                            {score}%
                        </FormattedText>
                        <FormattedText style={styles.resultDetails}>
                            {correctAnswers} / {totalQuestions} {getLocalizedText('bonnes réponses', 'câu đúng')}
                        </FormattedText>
                        <FormattedText style={styles.resultThreshold}>
                            {getLocalizedText(
                                `Minimum requis: ${CIVIC_EXAM_CONFIG.PASSING_SCORE}/${CIVIC_EXAM_CONFIG.TOTAL_QUESTIONS} (${CIVIC_EXAM_CONFIG.PASSING_PERCENTAGE}%)`,
                                `Tối thiểu: ${CIVIC_EXAM_CONFIG.PASSING_SCORE}/${CIVIC_EXAM_CONFIG.TOTAL_QUESTIONS} (${CIVIC_EXAM_CONFIG.PASSING_PERCENTAGE}%)`
                            )}
                        </FormattedText>
                    </View>

                    {incorrectQuestions.length > 0 && (
                        <View style={[styles.incorrectCard, { backgroundColor: theme.colors.card }]}>
                            <FormattedText style={[styles.incorrectTitle, { color: theme.colors.text }]}>
                                {getLocalizedText(
                                    `Questions incorrectes (${incorrectQuestions.length})`,
                                    `Câu sai (${incorrectQuestions.length})`
                                )}
                            </FormattedText>
                            {incorrectQuestions.slice(0, 5).map((question) => (
                                <View key={question.id} style={styles.incorrectItem}>
                                    <FormattedText style={[styles.incorrectQuestion, { color: theme.colors.text }]}>
                                        {typeof question.question === 'string' ? question.question : question.question.fr}
                                    </FormattedText>
                                </View>
                            ))}
                            {incorrectQuestions.length > 5 && (
                                <FormattedText style={[styles.moreText, { color: theme.colors.textMuted }]}>
                                    {getLocalizedText(
                                        `Et ${incorrectQuestions.length - 5} autre(s) question(s)...`,
                                        `Và ${incorrectQuestions.length - 5} câu khác...`
                                    )}
                                </FormattedText>
                            )}
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
                            {getLocalizedText('Retour à l\'accueil', 'Về trang chủ')}
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
        marginBottom: 12,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.1)',
    },
    incorrectQuestion: {
        fontSize: 15,
        lineHeight: 22,
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


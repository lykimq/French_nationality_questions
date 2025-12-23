import React, { useEffect } from 'react';
import {
    StyleSheet,
    View,
    ScrollView,
    StatusBar,
    TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../../shared/contexts/ThemeContext';
import { useCivicExam } from '../contexts/CivicExamContext';
import { FormattedText } from '../../shared/components';
import { sharedStyles } from '../../shared/utils';
import { createLogger } from '../../shared/utils/logger';
import { serializeCivicExamResult } from '../utils/civicExamSerialization';
import type { CivicExamStackParamList } from '../types';

const logger = createLogger('CivicExamReview');

type CivicExamReviewScreenNavigationProp = NativeStackNavigationProp<CivicExamStackParamList>;

const CivicExamReviewScreen = () => {
    const navigation = useNavigation<CivicExamReviewScreenNavigationProp>();
    const { theme, themeMode } = useTheme();
    const { currentSession, finishExam } = useCivicExam();

    // Handle navigation when session is missing (useEffect to avoid render-time navigation)
    useEffect(() => {
        if (!currentSession) {
            navigation.navigate('CivicExamHome');
        }
    }, [currentSession, navigation]);

    const handleSubmit = async () => {
        try {
            const result = await finishExam();
            const serializedResult = serializeCivicExamResult(result);
            navigation.navigate('CivicExamResult', { result: serializedResult });
        } catch (error) {
            logger.error('Error finishing exam:', error);
        }
    };

    if (!currentSession) {
        return null;
    }

    const actualQuestionCount = currentSession.questions.length;
    const answeredCount = currentSession.answers.length;
    const unansweredCount = actualQuestionCount - answeredCount;

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <StatusBar barStyle={themeMode === 'dark' ? 'light-content' : 'dark-content'} />

            <SafeAreaView style={{ flex: 1 }} edges={['top']}>
                <View style={[styles.header, { backgroundColor: theme.colors.headerBackground }]}>
                    <FormattedText style={[styles.headerTitle, { color: theme.colors.headerText }]}>
                        Révision
                    </FormattedText>
                </View>

                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.contentContainer}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={[styles.summaryCard, { backgroundColor: theme.colors.card }]}>
                        <FormattedText style={[styles.summaryTitle, { color: theme.colors.text }]}>
                            Résumé
                        </FormattedText>
                        <View style={styles.summaryRow}>
                            <FormattedText style={[styles.summaryText, { color: theme.colors.text }]}>
                                Questions répondues: {answeredCount} / {actualQuestionCount}
                            </FormattedText>
                        </View>
                        {unansweredCount > 0 && (
                            <View style={styles.summaryRow}>
                                <FormattedText style={[styles.warningText, { color: theme.colors.warning }]}>
                                    {unansweredCount} question(s) non répondue(s)
                                </FormattedText>
                            </View>
                        )}
                    </View>

                    <View style={[styles.infoCard, { backgroundColor: theme.colors.card }]}>
                        <Ionicons name="information-circle" size={24} color={theme.colors.primary} />
                        <FormattedText style={[styles.infoText, { color: theme.colors.text }]}>
                            Vous pouvez revenir en arrière pour modifier vos réponses avant de soumettre.
                        </FormattedText>
                    </View>
                </ScrollView>

                <View style={[styles.footer, { backgroundColor: theme.colors.card, borderTopColor: theme.colors.border }]}>
                    <TouchableOpacity
                        style={[styles.submitButton, { backgroundColor: theme.colors.primary }]}
                        onPress={handleSubmit}
                        activeOpacity={0.8}
                    >
                        <FormattedText style={[styles.submitButtonText, { color: '#FFFFFF' }]}>
                            Soumettre l'examen
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
    summaryCard: {
        borderRadius: 12,
        padding: 20,
        marginBottom: 16,
    },
    summaryTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    summaryRow: {
        marginBottom: 8,
    },
    summaryText: {
        fontSize: 16,
    },
    warningText: {
        fontSize: 15,
        fontWeight: '600',
    },
    infoCard: {
        flexDirection: 'row',
        borderRadius: 12,
        padding: 16,
        gap: 12,
        alignItems: 'flex-start',
    },
    infoText: {
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
        padding: 18,
        alignItems: 'center',
    },
    submitButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default CivicExamReviewScreen;


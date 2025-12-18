import React from 'react';
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
import { useCivicExam } from '../hooks/useCivicExam';
import { FormattedText } from '../../shared/components';
import { sharedStyles } from '../../shared/utils';
import { CIVIC_EXAM_CONFIG } from '../constants/civicExamConstants';
import type { CivicExamStackParamList } from '../types';

type CivicExamInfoScreenNavigationProp = NativeStackNavigationProp<CivicExamStackParamList>;

const CivicExamInfoScreen = () => {
    const navigation = useNavigation<CivicExamInfoScreenNavigationProp>();
    const { theme, themeMode } = useTheme();
    const { startExam } = useCivicExam();

    const handleStartExam = async () => {
        try {
            await startExam({
                mode: 'civic_exam_naturalization',
                questionCount: 40,
                timeLimit: 45,
                includeExplanations: false,
                shuffleQuestions: true,
                shuffleOptions: true,
                showProgress: true,
            });
            navigation.navigate('CivicExamQuestion');
        } catch (error) {
            console.error('Error starting exam:', error);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <StatusBar barStyle={themeMode === 'dark' ? 'light-content' : 'dark-content'} />

            <SafeAreaView style={{ flex: 1 }} edges={['top']}>
                <View style={[styles.header, { backgroundColor: theme.colors.headerBackground }]}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={styles.backButton}
                    >
                        <Ionicons name="arrow-back" size={24} color={theme.colors.headerText} />
                    </TouchableOpacity>
                    <FormattedText style={[styles.headerTitle, { color: theme.colors.headerText }]}>
                        Informations sur l'examen
                    </FormattedText>
                    <View style={styles.headerSpacer} />
                </View>

                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.contentContainer}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
                        <FormattedText style={[styles.sectionTitle, { color: theme.colors.text }]}>
                            Modalités de l'examen
                        </FormattedText>
                        <View style={styles.infoRow}>
                            <Ionicons name="document-text" size={20} color={theme.colors.primary} />
                            <FormattedText style={[styles.infoText, { color: theme.colors.text }]}>
                                {CIVIC_EXAM_CONFIG.TOTAL_QUESTIONS} questions à choix multiples
                            </FormattedText>
                        </View>
                        <View style={styles.infoRow}>
                            <Ionicons name="time" size={20} color={theme.colors.primary} />
                            <FormattedText style={[styles.infoText, { color: theme.colors.text }]}>
                                {CIVIC_EXAM_CONFIG.TIME_LIMIT_MINUTES} minutes maximum
                            </FormattedText>
                        </View>
                        <View style={styles.infoRow}>
                            <Ionicons name="trophy" size={20} color={theme.colors.primary} />
                            <FormattedText style={[styles.infoText, { color: theme.colors.text }]}>
                                {CIVIC_EXAM_CONFIG.PASSING_SCORE}/{CIVIC_EXAM_CONFIG.TOTAL_QUESTIONS} bonnes réponses ({CIVIC_EXAM_CONFIG.PASSING_PERCENTAGE}%) pour réussir
                            </FormattedText>
                        </View>
                    </View>

                    <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
                        <FormattedText style={[styles.sectionTitle, { color: theme.colors.text }]}>
                            Thématiques
                        </FormattedText>
                        <FormattedText style={[styles.themeItem, { color: theme.colors.textSecondary }]}>
                            • Principes et valeurs de la République (11 questions)
                        </FormattedText>
                        <FormattedText style={[styles.themeItem, { color: theme.colors.textSecondary }]}>
                            • Système institutionnel et politique (6 questions)
                        </FormattedText>
                        <FormattedText style={[styles.themeItem, { color: theme.colors.textSecondary }]}>
                            • Droits et devoirs (11 questions)
                        </FormattedText>
                        <FormattedText style={[styles.themeItem, { color: theme.colors.textSecondary }]}>
                            • Histoire, géographie et culture (8 questions)
                        </FormattedText>
                        <FormattedText style={[styles.themeItem, { color: theme.colors.textSecondary }]}>
                            • Vivre dans la société française (4 questions)
                        </FormattedText>
                    </View>

                    <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
                        <FormattedText style={[styles.sectionTitle, { color: theme.colors.text }]}>
                            Important
                        </FormattedText>
                        <FormattedText style={[styles.warningText, { color: theme.colors.text }]}>
                            • L'examen se déroule en français uniquement\n• Vous pouvez revenir en arrière pour modifier vos réponses\n• Le temps restant sera affiché en permanence\n• Vous pourrez réviser vos réponses avant de soumettre
                        </FormattedText>
                    </View>

                    <TouchableOpacity
                        style={[styles.startButton, { backgroundColor: theme.colors.primary }]}
                        onPress={handleStartExam}
                        activeOpacity={0.8}
                    >
                        <FormattedText style={[styles.startButtonText, { color: '#FFFFFF' }]}>
                            Commencer l'examen
                        </FormattedText>
                    </TouchableOpacity>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        ...sharedStyles.container,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        flex: 1,
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    headerSpacer: {
        width: 40,
    },
    scrollView: {
        flex: 1,
    },
    contentContainer: {
        padding: 20,
        paddingBottom: 40,
    },
    section: {
        borderRadius: 12,
        padding: 20,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 12,
    },
    infoText: {
        flex: 1,
        fontSize: 15,
        lineHeight: 22,
    },
    themeItem: {
        fontSize: 15,
        lineHeight: 24,
        marginBottom: 8,
    },
    warningText: {
        fontSize: 15,
        lineHeight: 24,
    },
    startButton: {
        borderRadius: 12,
        padding: 18,
        alignItems: 'center',
        marginTop: 8,
    },
    startButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default CivicExamInfoScreen;


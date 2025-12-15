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
import { useLanguage } from '../../shared/contexts/LanguageContext';
import { useCivicExam } from '../hooks/useCivicExam';
import { FormattedText } from '../../shared/components';
import { sharedStyles } from '../../shared/utils';
import { CIVIC_EXAM_CONFIG } from '../constants/civicExamConstants';
import type { CivicExamStackParamList } from '../types';

type CivicExamInfoScreenNavigationProp = NativeStackNavigationProp<CivicExamStackParamList>;

const CivicExamInfoScreen = () => {
    const navigation = useNavigation<CivicExamInfoScreenNavigationProp>();
    const { theme, themeMode } = useTheme();
    const { language } = useLanguage();
    const { startExam } = useCivicExam();

    const getLocalizedText = (fr: string, vi: string) => {
        return language === 'fr' ? fr : vi;
    };

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
                        {getLocalizedText('Informations sur l\'examen', 'Thông tin kỳ thi')}
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
                            {getLocalizedText('Modalités de l\'examen', 'Thể thức kỳ thi')}
                        </FormattedText>
                        <View style={styles.infoRow}>
                            <Ionicons name="document-text" size={20} color={theme.colors.primary} />
                            <FormattedText style={[styles.infoText, { color: theme.colors.text }]}>
                                {getLocalizedText(
                                    `${CIVIC_EXAM_CONFIG.TOTAL_QUESTIONS} questions à choix multiples`,
                                    `${CIVIC_EXAM_CONFIG.TOTAL_QUESTIONS} câu hỏi trắc nghiệm`
                                )}
                            </FormattedText>
                        </View>
                        <View style={styles.infoRow}>
                            <Ionicons name="time" size={20} color={theme.colors.primary} />
                            <FormattedText style={[styles.infoText, { color: theme.colors.text }]}>
                                {getLocalizedText(
                                    `${CIVIC_EXAM_CONFIG.TIME_LIMIT_MINUTES} minutes maximum`,
                                    `Tối đa ${CIVIC_EXAM_CONFIG.TIME_LIMIT_MINUTES} phút`
                                )}
                            </FormattedText>
                        </View>
                        <View style={styles.infoRow}>
                            <Ionicons name="trophy" size={20} color={theme.colors.primary} />
                            <FormattedText style={[styles.infoText, { color: theme.colors.text }]}>
                                {getLocalizedText(
                                    `${CIVIC_EXAM_CONFIG.PASSING_SCORE}/${CIVIC_EXAM_CONFIG.TOTAL_QUESTIONS} bonnes réponses (${CIVIC_EXAM_CONFIG.PASSING_PERCENTAGE}%) pour réussir`,
                                    `${CIVIC_EXAM_CONFIG.PASSING_SCORE}/${CIVIC_EXAM_CONFIG.TOTAL_QUESTIONS} câu đúng (${CIVIC_EXAM_CONFIG.PASSING_PERCENTAGE}%) để đạt`
                                )}
                            </FormattedText>
                        </View>
                    </View>

                    <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
                        <FormattedText style={[styles.sectionTitle, { color: theme.colors.text }]}>
                            {getLocalizedText('Thématiques', 'Chủ đề')}
                        </FormattedText>
                        <FormattedText style={[styles.themeItem, { color: theme.colors.textSecondary }]}>
                            • {getLocalizedText('Principes et valeurs de la République (11 questions)', 'Nguyên tắc và giá trị của Cộng hòa (11 câu)')}
                        </FormattedText>
                        <FormattedText style={[styles.themeItem, { color: theme.colors.textSecondary }]}>
                            • {getLocalizedText('Système institutionnel et politique (6 questions)', 'Hệ thống thể chế và chính trị (6 câu)')}
                        </FormattedText>
                        <FormattedText style={[styles.themeItem, { color: theme.colors.textSecondary }]}>
                            • {getLocalizedText('Droits et devoirs (11 questions)', 'Quyền và nghĩa vụ (11 câu)')}
                        </FormattedText>
                        <FormattedText style={[styles.themeItem, { color: theme.colors.textSecondary }]}>
                            • {getLocalizedText('Histoire, géographie et culture (8 questions)', 'Lịch sử, địa lý và văn hóa (8 câu)')}
                        </FormattedText>
                        <FormattedText style={[styles.themeItem, { color: theme.colors.textSecondary }]}>
                            • {getLocalizedText('Vivre dans la société française (4 questions)', 'Sống trong xã hội Pháp (4 câu)')}
                        </FormattedText>
                    </View>

                    <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
                        <FormattedText style={[styles.sectionTitle, { color: theme.colors.text }]}>
                            {getLocalizedText('Important', 'Quan trọng')}
                        </FormattedText>
                        <FormattedText style={[styles.warningText, { color: theme.colors.text }]}>
                            {getLocalizedText(
                                '• L\'examen se déroule en français uniquement\n• Vous pouvez revenir en arrière pour modifier vos réponses\n• Le temps restant sera affiché en permanence\n• Vous pourrez réviser vos réponses avant de soumettre',
                                '• Kỳ thi chỉ diễn ra bằng tiếng Pháp\n• Bạn có thể quay lại để sửa câu trả lời\n• Thời gian còn lại sẽ được hiển thị liên tục\n• Bạn có thể xem lại câu trả lời trước khi nộp'
                            )}
                        </FormattedText>
                    </View>

                    <TouchableOpacity
                        style={[styles.startButton, { backgroundColor: theme.colors.primary }]}
                        onPress={handleStartExam}
                        activeOpacity={0.8}
                    >
                        <FormattedText style={[styles.startButtonText, { color: '#FFFFFF' }]}>
                            {getLocalizedText('Commencer l\'examen', 'Bắt đầu kỳ thi')}
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


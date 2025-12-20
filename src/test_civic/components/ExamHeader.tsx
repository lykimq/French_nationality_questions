import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FormattedText } from '../../shared/components';
import { useTheme } from '../../shared/contexts/ThemeContext';
import { CIVIC_EXAM_CONFIG } from '../constants/civicExamConstants';

interface ExamHeaderProps {
    currentQuestionIndex: number;
    totalQuestions: number;
    timeLeft: number;
    formattedTime: string;
    progress: number;
}

export const ExamHeader: React.FC<ExamHeaderProps> = ({
    currentQuestionIndex,
    totalQuestions,
    timeLeft,
    formattedTime,
    progress
}) => {
    const { theme } = useTheme();

    const passingScore = Math.ceil((totalQuestions * CIVIC_EXAM_CONFIG.PASSING_PERCENTAGE) / 100);
    const passingText = totalQuestions === CIVIC_EXAM_CONFIG.TOTAL_QUESTIONS
        ? `Passage: ${CIVIC_EXAM_CONFIG.PASSING_SCORE}/${CIVIC_EXAM_CONFIG.TOTAL_QUESTIONS}`
        : `Passage: ${passingScore}/${totalQuestions} (${CIVIC_EXAM_CONFIG.PASSING_PERCENTAGE}%)`;

    return (
        <View style={styles.header}>
            <View style={styles.headerTop}>
                <View style={styles.questionCounter}>
                    <FormattedText style={[styles.questionCounterText, { color: theme.colors.text }]}>
                        {currentQuestionIndex + 1} / {totalQuestions}
                    </FormattedText>
                </View>
                <View style={[
                    styles.timer,
                    { backgroundColor: timeLeft < 300 ? theme.colors.error : theme.colors.primary }
                ]}>
                    <Ionicons name="time" size={16} color="#FFFFFF" />
                    <FormattedText style={styles.timerText}>{formattedTime}</FormattedText>
                </View>
            </View>
            <View style={[styles.progressContainer, { backgroundColor: theme.colors.border }]}>
                <View style={[styles.progressBar, { width: `${progress}%`, backgroundColor: theme.colors.primary }]} />
            </View>
            <FormattedText style={[styles.passingInfo, { color: theme.colors.text }]}>
                {passingText}
            </FormattedText>
        </View>
    );
};

const styles = StyleSheet.create({
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
});

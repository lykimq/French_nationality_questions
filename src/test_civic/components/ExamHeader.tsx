import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { FormattedText, Icon3D } from '../../shared/components';
import { useTheme } from '../../shared/contexts/ThemeContext';
import { useIcon3D } from '../../shared/hooks';
import { CIVIC_EXAM_CONFIG } from '../constants/civicExamConstants';

interface ExamHeaderProps {
    currentQuestionIndex: number;
    totalQuestions: number;
    timeLeft: number;
    formattedTime: string;
    progress: number;
    isPracticeMode: boolean;
    answeredCount: number;
    onExit?: () => void;
}

export const ExamHeader: React.FC<ExamHeaderProps> = ({
    currentQuestionIndex,
    totalQuestions,
    timeLeft,
    formattedTime,
    progress,
    isPracticeMode,
    answeredCount,
    onExit
}) => {
    const { theme } = useTheme();
    const { getIcon } = useIcon3D();

    const timeIcon = getIcon('time');
    const closeIcon = getIcon('close');

    const passingScore = Math.ceil((totalQuestions * CIVIC_EXAM_CONFIG.PASSING_PERCENTAGE) / 100);
    const passingText = totalQuestions === CIVIC_EXAM_CONFIG.TOTAL_QUESTIONS
        ? `Réussite : ${CIVIC_EXAM_CONFIG.PASSING_SCORE}/${CIVIC_EXAM_CONFIG.TOTAL_QUESTIONS} minimum`
        : `Réussite : ${passingScore}/${totalQuestions} (${CIVIC_EXAM_CONFIG.PASSING_PERCENTAGE}%)`;

    const timerUrgent = !isPracticeMode && timeLeft < 300;

    return (
        <View style={styles.header}>
            <View style={styles.headerTop}>
                {onExit && (
                    <TouchableOpacity
                        onPress={onExit}
                        style={styles.exitButton}
                        activeOpacity={0.7}
                        accessibilityLabel="Quitter l'examen"
                        accessibilityRole="button"
                    >
                        <Icon3D
                            name={closeIcon.name}
                            size={20}
                            color={theme.colors.text}
                            variant={closeIcon.variant}
                        />
                    </TouchableOpacity>
                )}
                <View style={styles.questionCounter}>
                    <FormattedText style={[styles.questionCounterText, { color: theme.colors.text }]}>
                        Question {currentQuestionIndex + 1} sur {totalQuestions}
                    </FormattedText>
                </View>
                {isPracticeMode ? (
                    <View style={[styles.practicePill, { backgroundColor: theme.colors.primary + '22', borderColor: theme.colors.primary }]}>
                        <FormattedText style={[styles.practicePillText, { color: theme.colors.primary }]}>
                            Pratique
                        </FormattedText>
                    </View>
                ) : (
                    <View style={[
                        styles.timer,
                        { backgroundColor: timerUrgent ? theme.colors.error : theme.colors.primary }
                    ]}>
                        <Icon3D
                            name={timeIcon.name}
                            size={14}
                            color={theme.colors.buttonText}
                            variant={timeIcon.variant}
                        />
                        <FormattedText style={[styles.timerText, { color: theme.colors.buttonText }]}>{formattedTime}</FormattedText>
                    </View>
                )}
            </View>
            <View style={[styles.progressContainer, { backgroundColor: theme.colors.border }]}>
                <View style={[styles.progressBar, { width: `${progress}%`, backgroundColor: theme.colors.primary }]} />
            </View>
            <FormattedText style={[styles.passingInfo, { color: theme.colors.textSecondary }]}>
                {passingText}
            </FormattedText>
            {!isPracticeMode && (
                <FormattedText style={[styles.answeredHint, { color: theme.colors.textMuted }]}>
                    {answeredCount} réponse{answeredCount !== 1 ? 's' : ''} enregistrée{answeredCount !== 1 ? 's' : ''}
                </FormattedText>
            )}
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
        alignItems: 'center',
        marginBottom: 8,
    },
    exitButton: {
        padding: 8,
        marginRight: 8,
        minWidth: 36,
        minHeight: 36,
        justifyContent: 'center',
        alignItems: 'center',
    },
    questionCounter: {
        flex: 1,
    },
    questionCounterText: {
        fontSize: 16,
        fontWeight: '600',
    },
    practicePill: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
    },
    practicePillText: {
        fontSize: 13,
        fontWeight: '700',
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
        fontSize: 14,
        fontWeight: 'bold',
    },
    progressContainer: {
        height: 6,
        borderRadius: 3,
        marginBottom: 8,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        borderRadius: 3,
    },
    passingInfo: {
        fontSize: 12,
        textAlign: 'center',
        lineHeight: 18,
    },
    answeredHint: {
        fontSize: 11,
        textAlign: 'center',
        marginTop: 4,
    },
});

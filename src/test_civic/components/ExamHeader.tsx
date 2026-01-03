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
    onExit?: () => void;
}

export const ExamHeader: React.FC<ExamHeaderProps> = ({
    currentQuestionIndex,
    totalQuestions,
    timeLeft,
    formattedTime,
    progress,
    onExit
}) => {
    const { theme } = useTheme();
    const { getIcon } = useIcon3D();

    const timeIcon = getIcon('time');
    const closeIcon = getIcon('close');

    const passingScore = Math.ceil((totalQuestions * CIVIC_EXAM_CONFIG.PASSING_PERCENTAGE) / 100);
    const passingText = totalQuestions === CIVIC_EXAM_CONFIG.TOTAL_QUESTIONS
        ? `Passage: ${CIVIC_EXAM_CONFIG.PASSING_SCORE}/${CIVIC_EXAM_CONFIG.TOTAL_QUESTIONS}`
        : `Passage: ${passingScore}/${totalQuestions} (${CIVIC_EXAM_CONFIG.PASSING_PERCENTAGE}%)`;

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
                        {currentQuestionIndex + 1} / {totalQuestions}
                    </FormattedText>
                </View>
                <View style={[
                    styles.timer,
                    { backgroundColor: timeLeft < 300 ? theme.colors.error : theme.colors.primary }
                ]}>
                    <Icon3D
                        name={timeIcon.name}
                        size={14}
                        color="#FFFFFF"
                        variant={timeIcon.variant}
                    />
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

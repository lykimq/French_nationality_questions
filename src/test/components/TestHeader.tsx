import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { FormattedText } from '../../shared/components';
import { useTheme } from '../../shared/contexts/ThemeContext';
import { useIcons } from '../../shared/contexts/IconContext';

interface TestHeaderProps {
    currentQuestionIndex: number;
    totalQuestions: number;
    timeLeft: number | null;
    onCancel: () => void;
    formatTime: (seconds: number) => string;
}

export const TestHeader: React.FC<TestHeaderProps> = ({
    currentQuestionIndex,
    totalQuestions,
    timeLeft,
    onCancel,
    formatTime,
}) => {
    const { theme } = useTheme();
    const { getIconName } = useIcons();

    const progressPercentage = ((currentQuestionIndex + 1) / totalQuestions) * 100;

    return (
        <View style={[styles.header, { backgroundColor: theme.colors.headerBackground }]}>
            <View style={styles.headerTop}>
                <TouchableOpacity onPress={onCancel} style={styles.cancelButton}>
                    <Ionicons name={getIconName('close') as any} size={24} color={theme.colors.headerText} />
                </TouchableOpacity>

                <View style={styles.questionCounter}>
                    <FormattedText style={[styles.questionCounterText, { color: theme.colors.headerText }]}>
                        {currentQuestionIndex + 1} / {totalQuestions}
                    </FormattedText>
                </View>

                <View style={styles.headerRight}>
                    {timeLeft !== null && (
                        <View style={[styles.timer, { backgroundColor: timeLeft < 60 ? theme.colors.error : theme.colors.primary }]}>
                            <Ionicons name={getIconName('time') as any} size={16} color="white" />
                            <FormattedText style={styles.timerText}>{formatTime(timeLeft)}</FormattedText>
                        </View>
                    )}
                </View>
            </View>

            <View style={[styles.progressContainer, { backgroundColor: theme.colors.border }]}>
                <LinearGradient
                    colors={[theme.colors.primary, theme.colors.primaryLight]}
                    style={[styles.progressBar, { width: `${progressPercentage}%` }]}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
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
    cancelButton: {
        padding: 8,
    },
    questionCounter: {
        flex: 1,
        alignItems: 'center',
    },
    questionCounterText: {
        fontSize: 16,
        fontWeight: '600',
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    timer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    timerText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 4,
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
});

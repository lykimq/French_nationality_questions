import React from 'react';
import { View, StyleSheet } from 'react-native';

import { useTheme } from '../../shared/contexts/ThemeContext';
import { FormattedText } from '../../shared/components';
import { sharedStyles } from '../../shared/utils';

export interface TestProgressData {
    totalTestsTaken: number;
    averageScore: number;
    bestScore: number;
    questionsAnswered: number;
}

interface ProgressOverviewCardProps {
    testProgress: TestProgressData;
}

interface ProgressStatProps {
    value: string;
    label: string;
    color: string;
}

const ProgressStat: React.FC<ProgressStatProps> = ({ value, label, color }) => {
    const { theme } = useTheme();

    return (
        <View style={styles.progressStat}>
            <FormattedText style={[styles.progressValue, { color }]}>
                {value}
            </FormattedText>
            <FormattedText style={[styles.progressLabel, { color: theme.colors.textMuted }]}>
                {label}
            </FormattedText>
        </View>
    );
};

const ProgressOverviewCard: React.FC<ProgressOverviewCardProps> = ({ testProgress }) => {
    const { theme } = useTheme();

    return (
        <View style={[styles.progressCard, { backgroundColor: theme.colors.surface }]}>
            <FormattedText style={[styles.cardTitle, { color: theme.colors.text }]}>
                Progression Globale
            </FormattedText>

            <View style={styles.progressStats}>
                <ProgressStat
                    value={String(testProgress.totalTestsTaken || 0)}
                    label="Tests effectués"
                    color={theme.colors.primary}
                />

                <ProgressStat
                    value={`${Math.round(testProgress.averageScore || 0)}%`}
                    label="Score moyen"
                    color={theme.colors.success}
                />

                <ProgressStat
                    value={`${Math.round(testProgress.bestScore || 0)}%`}
                    label="Meilleur score"
                    color={theme.colors.warning}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    progressCard: {
        ...sharedStyles.card,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 16,
    },
    progressStats: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    progressStat: {
        alignItems: 'center',
    },
    progressValue: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    progressLabel: {
        fontSize: 12,
        textAlign: 'center',
    },
});

export default ProgressOverviewCard;
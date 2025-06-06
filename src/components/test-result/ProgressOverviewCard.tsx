import React from 'react';
import { View, StyleSheet } from 'react-native';

import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import FormattedText from '../FormattedText';
import { sharedStyles } from '../../utils/sharedStyles';

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
    const { language } = useLanguage();

    return (
        <View style={[styles.progressCard, { backgroundColor: theme.colors.surface }]}>
            <FormattedText style={[styles.cardTitle, { color: theme.colors.text }]}>
                {language === 'fr' ? 'Progression Globale' : 'Tiến độ tổng thể'}
            </FormattedText>

            <View style={styles.progressStats}>
                <ProgressStat
                    value={String(testProgress.totalTestsTaken || 0)}
                    label={language === 'fr' ? 'Tests effectués' : 'Bài test đã làm'}
                    color={theme.colors.primary}
                />

                <ProgressStat
                    value={`${Math.round(testProgress.averageScore || 0)}%`}
                    label={language === 'fr' ? 'Score moyen' : 'Điểm trung bình'}
                    color={theme.colors.success}
                />

                <ProgressStat
                    value={`${Math.round(testProgress.bestScore || 0)}%`}
                    label={language === 'fr' ? 'Meilleur score' : 'Điểm cao nhất'}
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
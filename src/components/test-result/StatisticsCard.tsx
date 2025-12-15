import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useIcons } from '../../contexts/IconContext';
import { FormattedText } from '../shared';
import { sharedStyles } from '../../utils/shared';
import { TestStatistics, IconMapping } from '../../types';

interface StatisticsCardProps {
    statistics: TestStatistics;
}

interface StatItemProps {
    icon: keyof IconMapping;
    label: string;
    value: string;
    color: string;
}

const StatItem: React.FC<StatItemProps> = ({ icon, label, value, color }) => {
    const { theme } = useTheme();
    const { getIconName } = useIcons();

    return (
        <View style={styles.statItem}>
            <Ionicons name={getIconName(icon) as any} size={20} color={color} />
            <FormattedText style={[styles.statLabel, { color: theme.colors.textMuted }]}>
                {label}
            </FormattedText>
            <FormattedText style={[styles.statValue, { color: theme.colors.text }]}>
                {value}
            </FormattedText>
        </View>
    );
};

const StatisticsCard: React.FC<StatisticsCardProps> = ({ statistics }) => {
    const { theme } = useTheme();
    const { language } = useLanguage();

    const getTrendText = (trend: string) => {
        if (language === 'fr') {
            return trend === 'improving' ? 'Progression' :
                trend === 'declining' ? 'Baisse' : 'Stable';
        } else {
            return trend === 'improving' ? 'Tiến bộ' :
                trend === 'declining' ? 'Giảm' : 'Ổn định';
        }
    };

    return (
        <View style={[styles.statsCard, { backgroundColor: theme.colors.surface }]}>
            <FormattedText style={[styles.cardTitle, { color: theme.colors.text }]}>
                {language === 'fr' ? 'Statistiques' : 'Thống kê'}
            </FormattedText>

            <View style={styles.statsGrid}>
                <StatItem
                    icon="time"
                    label={language === 'fr' ? 'Temps moyen' : 'Thời gian TB'}
                    value={`${Math.round(statistics.timeStats?.averageTimePerQuestion || 0)}s`}
                    color={theme.colors.primary}
                />

                <StatItem
                    icon="trendingUp"
                    label={language === 'fr' ? 'Tendance' : 'Xu hướng'}
                    value={getTrendText(statistics.improvementTrend)}
                    color={theme.colors.success}
                />

                <StatItem
                    icon="checkmarkCircle"
                    label={language === 'fr' ? 'Maîtrisées' : 'Đã thành thạo'}
                    value={`${statistics.masteredQuestions?.length || 0}`}
                    color={theme.colors.success}
                />

                <StatItem
                    icon="alertCircle"
                    label={language === 'fr' ? 'À revoir' : 'Cần xem lại'}
                    value={`${statistics.strugglingQuestions?.length || 0}`}
                    color={theme.colors.warning}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    statsCard: {
        ...sharedStyles.card,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 16,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    statItem: {
        width: '48%',
        alignItems: 'center',
        padding: 12,
        marginBottom: 12,
    },
    statLabel: {
        fontSize: 12,
        marginTop: 4,
        textAlign: 'center',
    },
    statValue: {
        fontSize: 16,
        fontWeight: '600',
        marginTop: 4,
    },
});

export default StatisticsCard;
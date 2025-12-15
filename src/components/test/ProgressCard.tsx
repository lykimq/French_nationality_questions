import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useIcons } from '../../contexts/IconContext';
import { FormattedText } from '../shared';
import { sharedStyles } from '../../utils/shared';
import { TestProgress, TestStatistics } from '../../types';

interface ProgressCardProps {
    testProgress: TestProgress;
    testStatistics: TestStatistics;
    onPress: () => void;
    getLocalizedText: (textFr: string, textVi: string) => string;
    language: string;
}

const ProgressCard: React.FC<ProgressCardProps> = ({
    testProgress,
    testStatistics,
    onPress,
    getLocalizedText,
    language,
}) => {
    const { theme } = useTheme();
    const { getIconName } = useIcons();

    const getTrendText = () => {
        if (language === 'fr') {
            return testStatistics.improvementTrend === 'improving' ? 'En progression' :
                testStatistics.improvementTrend === 'declining' ? 'En baisse' : 'Stable';
        } else {
            return testStatistics.improvementTrend === 'improving' ?
                getLocalizedText('En progression', 'Đang tiến bộ') :
                testStatistics.improvementTrend === 'declining' ?
                    getLocalizedText('En baisse', 'Đang giảm') :
                    getLocalizedText('Stable', 'Ổn định');
        }
    };

    const getTrendIcon = () => {
        switch (testStatistics.improvementTrend) {
            case 'improving':
                return getIconName('trendingUp') as any;
            case 'declining':
                return 'trending-down';
            default:
                return 'remove';
        }
    };

    const getTrendColor = () => {
        switch (testStatistics.improvementTrend) {
            case 'improving':
                return theme.colors.success;
            case 'declining':
                return theme.colors.error;
            default:
                return theme.colors.textMuted;
        }
    };

    return (
        <TouchableOpacity
            style={[styles.progressCard, { backgroundColor: theme.colors.surface }]}
            onPress={onPress}
            activeOpacity={0.8}
        >
            <View style={styles.progressHeader}>
                <FormattedText style={[styles.progressTitle, { color: theme.colors.text }]}>
                    {getLocalizedText('Votre Progression', 'Tiến độ của bạn')}
                </FormattedText>
                <View style={styles.progressHeaderRight}>
                    <Ionicons name={getIconName('analytics') as any} size={24} color={theme.colors.primary} />
                    <Ionicons name={getIconName('chevronForward') as any} size={20} color={theme.colors.textMuted} style={{ marginLeft: 8 }} />
                </View>
            </View>

            <View style={styles.progressStats}>
                <View style={styles.statItem}>
                    <FormattedText style={[styles.statValue, { color: theme.colors.primary }]}>
                        {testProgress.totalTestsTaken}
                    </FormattedText>
                    <FormattedText style={[styles.statLabel, { color: theme.colors.textMuted }]}>
                        {getLocalizedText('Tests', 'Bài test')}
                    </FormattedText>
                </View>

                <View style={styles.statItem}>
                    <FormattedText style={[styles.statValue, { color: theme.colors.success }]}>
                        {testProgress.averageScore}%
                    </FormattedText>
                    <FormattedText style={[styles.statLabel, { color: theme.colors.textMuted }]}>
                        {getLocalizedText('Moyenne', 'Trung bình')}
                    </FormattedText>
                </View>

                <View style={styles.statItem}>
                    <FormattedText style={[styles.statValue, { color: theme.colors.warning }]}>
                        {testProgress.bestScore}%
                    </FormattedText>
                    <FormattedText style={[styles.statLabel, { color: theme.colors.textMuted }]}>
                        {getLocalizedText('Meilleur', 'Cao nhất')}
                    </FormattedText>
                </View>
            </View>

            {testProgress.totalTestsTaken > 0 && (
                <View style={styles.trendContainer}>
                    <Ionicons
                        name={getTrendIcon()}
                        size={16}
                        color={getTrendColor()}
                    />
                    <FormattedText style={[styles.trendText, { color: getTrendColor() }]}>
                        {getTrendText()}
                    </FormattedText>
                </View>
            )}

            <View style={styles.viewDetailsHint}>
                <FormattedText style={[styles.viewDetailsText, { color: theme.colors.textMuted }]}>
                    {getLocalizedText('Appuyez pour voir les détails', 'Nhấn để xem chi tiết')}
                </FormattedText>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    progressCard: {
        ...sharedStyles.card,
        marginBottom: 24,
    },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    progressHeaderRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    progressTitle: {
        fontSize: 20,
        fontWeight: '600',
    },
    progressStats: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 12,
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 14,
    },
    trendContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    trendText: {
        marginLeft: 6,
        fontSize: 14,
        fontWeight: '500',
    },
    viewDetailsHint: {
        alignItems: 'center',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
    },
    viewDetailsText: {
        fontSize: 12,
        fontStyle: 'italic',
    },
});

export default ProgressCard;
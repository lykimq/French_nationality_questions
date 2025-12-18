import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../../shared/contexts/ThemeContext';
import { useIcons } from '../../shared/contexts/IconContext';
import { FormattedText } from '../../shared/components';
import { sharedStyles } from '../../shared/utils';
import { TestRecommendation } from '../../types';

interface RecommendationsCardProps {
    recommendations: readonly TestRecommendation[];
}

const RecommendationsCard: React.FC<RecommendationsCardProps> = ({ recommendations }) => {
    const { theme } = useTheme();
    const { getIconName } = useIcons();

    if (recommendations.length === 0) {
        return null;
    }

    return (
        <View style={[styles.recommendationsCard, { backgroundColor: theme.colors.surface }]}>
            <FormattedText style={[styles.cardTitle, { color: theme.colors.text }]}>
                Recommandations
            </FormattedText>

            {recommendations.map((rec, index) => (
                <View key={index} style={styles.recommendationItem}>
                    <View style={styles.recommendationHeader}>
                        <Ionicons
                            name={rec.type === 'good_job' ? getIconName('trophy') as any : getIconName('bulb') as any}
                            size={20}
                            color={theme.colors.primary}
                        />
                        <FormattedText style={[styles.recommendationTitle, { color: theme.colors.text }]}>
                            {rec.title}
                        </FormattedText>
                    </View>
                    <FormattedText style={[styles.recommendationDescription, { color: theme.colors.textMuted }]}>
                        {rec.description}
                    </FormattedText>
                </View>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    recommendationsCard: {
        ...sharedStyles.card,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 16,
    },
    recommendationItem: {
        marginBottom: 16,
    },
    recommendationHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    recommendationTitle: {
        fontSize: 16,
        fontWeight: '500',
        marginLeft: 8,
    },
    recommendationDescription: {
        fontSize: 14,
        lineHeight: 20,
        marginLeft: 28,
    },
});

export default RecommendationsCard;
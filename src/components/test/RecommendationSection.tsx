import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useIcons } from '../../contexts/IconContext';
import { FormattedText } from '../shared';
import { sharedStyles } from '../../utils/shared';
import { TestRecommendation } from '../../types';

interface RecommendationSectionProps {
    recommendations: TestRecommendation[];
    onRecommendationAction: (recommendation: TestRecommendation) => void;
    getLocalizedText: (textFr: string, textVi: string) => string;
}

const RecommendationSection: React.FC<RecommendationSectionProps> = ({
    recommendations,
    onRecommendationAction,
    getLocalizedText,
}) => {
    const { theme } = useTheme();
    const { getIconName, getJsonIconName } = useIcons();

    if (recommendations.length === 0) return null;

    const getRecommendationIcon = (type: string) => {
        switch (type) {
            case 'good_job':
                return getIconName('trophy') as any;
            case 'review_questions':
                return getIconName('refresh') as any;
            case 'study_category':
                return getJsonIconName('book') as any;
            default:
                return getIconName('bulb') as any;
        }
    };

    return (
        <View style={[styles.recommendationsSection, { backgroundColor: theme.colors.surface }]}>
            <FormattedText style={[styles.sectionTitle, { color: theme.colors.text }]}>
                {getLocalizedText('Recommandations', 'Đề xuất')}
            </FormattedText>
            {recommendations.slice(0, 2).map((rec, index) => {
                const isActionable = (rec.type === 'review_questions' && rec.questionIds && rec.questionIds.length > 0) ||
                    (rec.type === 'study_category' && rec.categoryIds && rec.categoryIds.length > 0) ||
                    rec.type === 'good_job' || rec.type === 'practice_more';

                const RecommendationComponent = isActionable ? TouchableOpacity : View;

                return (
                    <RecommendationComponent
                        key={index}
                        style={[
                            styles.recommendationItem,
                            isActionable && styles.recommendationItemTouchable
                        ]}
                        onPress={isActionable ? () => onRecommendationAction(rec) : undefined}
                        activeOpacity={isActionable ? 0.7 : 1}
                    >
                        <Ionicons
                            name={getRecommendationIcon(rec.type)}
                            size={20}
                            color={theme.colors.primary}
                        />
                        <View style={styles.recommendationContent}>
                            <FormattedText style={[styles.recommendationTitle, { color: theme.colors.text }]}>
                                {getLocalizedText(rec.title_fr, rec.title_vi)}
                            </FormattedText>
                            <FormattedText style={[styles.recommendationDescription, { color: theme.colors.textMuted }]}>
                                {getLocalizedText(rec.description_fr, rec.description_vi)}
                            </FormattedText>
                            {isActionable && (
                                <FormattedText style={[styles.recommendationAction, { color: theme.colors.primary }]}>
                                    {getLocalizedText(rec.actionText_fr, rec.actionText_vi)}
                                </FormattedText>
                            )}
                        </View>
                        {isActionable && (
                            <Ionicons name={getIconName('chevronForward') as any} size={20} color={theme.colors.primary} />
                        )}
                    </RecommendationComponent>
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    recommendationsSection: {
        ...sharedStyles.card,
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 16,
    },
    recommendationItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    recommendationItemTouchable: {
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
        borderRadius: 12,
        padding: 12,
        marginHorizontal: -12,
        marginVertical: -4,
    },
    recommendationContent: {
        flex: 1,
        marginLeft: 12,
    },
    recommendationTitle: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 4,
    },
    recommendationDescription: {
        fontSize: 14,
        lineHeight: 20,
    },
    recommendationAction: {
        fontSize: 14,
        fontWeight: '500',
        marginTop: 4,
    },
});

export default RecommendationSection;
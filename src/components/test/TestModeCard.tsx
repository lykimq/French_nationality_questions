import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useIcons } from '../../contexts/IconContext';
import FormattedText from '../FormattedText';
import { sharedStyles } from '../../utils/shared';
import { MainTestModeOption } from '../../types';

interface TestModeCardProps {
    modeOption: MainTestModeOption;
    onPress: () => void;
    getLocalizedText: (textFr: string, textVi: string) => string;
    getLocalizedModeTitle: (modeOption: MainTestModeOption) => string;
    getLocalizedModeDescription: (modeOption: MainTestModeOption) => string;
}

const TestModeCard: React.FC<TestModeCardProps> = ({
    modeOption,
    onPress,
    getLocalizedText,
    getLocalizedModeTitle,
    getLocalizedModeDescription,
}) => {
    const { theme } = useTheme();
    const { getIconName, getJsonIconName } = useIcons();

    return (
        <TouchableOpacity
            style={[
                styles.modeCard,
                { backgroundColor: theme.colors.surface },
                modeOption.isRecommended && styles.recommendedCard
            ]}
            onPress={onPress}
            activeOpacity={0.8}
        >
            {modeOption.isRecommended && (
                <View style={[styles.recommendedBadge, { backgroundColor: theme.colors.primary }]}>
                    <FormattedText style={styles.recommendedText}>
                        {getLocalizedText('Recommandé', 'Được đề xuất')}
                    </FormattedText>
                </View>
            )}

            <View style={[styles.modeIconContainer, { backgroundColor: modeOption.color + '20' }]}>
                <Ionicons name={getJsonIconName(modeOption.icon) as any} size={32} color={modeOption.color} />
            </View>

            <View style={styles.modeContent}>
                <FormattedText style={[styles.modeTitle, { color: theme.colors.text }]}>
                    {getLocalizedModeTitle(modeOption)}
                </FormattedText>
                <FormattedText style={[styles.modeDescription, { color: theme.colors.textMuted }]}>
                    {getLocalizedModeDescription(modeOption)}
                </FormattedText>

                <View style={styles.modeDetails}>
                    <View style={styles.modeDetail}>
                        <Ionicons name={getIconName('helpCircle') as any} size={16} color={theme.colors.textMuted} />
                        <FormattedText style={[styles.modeDetailText, { color: theme.colors.textMuted }]}>
                            {modeOption.questionCount} {getLocalizedText('questions', 'câu hỏi')}
                        </FormattedText>
                    </View>

                    {modeOption.timeLimit && (
                        <View style={styles.modeDetail}>
                            <Ionicons name={getIconName('time') as any} size={16} color={theme.colors.textMuted} />
                            <FormattedText style={[styles.modeDetailText, { color: theme.colors.textMuted }]}>
                                {modeOption.timeLimit} {getLocalizedText('min', 'phút')}
                            </FormattedText>
                        </View>
                    )}
                </View>
            </View>

            <Ionicons name={getIconName('chevronForward') as any} size={24} color={theme.colors.textMuted} />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    modeCard: {
        ...sharedStyles.card,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        position: 'relative',
    },
    recommendedCard: {
        borderWidth: 2,
        borderColor: '#4ECDC4',
    },
    recommendedBadge: {
        position: 'absolute',
        top: -8,
        right: 16,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        zIndex: 1,
    },
    recommendedText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '600',
    },
    modeIconContainer: {
        ...sharedStyles.largeIconContainer,
    },
    modeContent: {
        flex: 1,
    },
    modeTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 4,
    },
    modeDescription: {
        fontSize: 14,
        marginBottom: 8,
        lineHeight: 20,
    },
    modeDetails: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    modeDetail: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 16,
        marginBottom: 4,
    },
    modeDetailText: {
        marginLeft: 4,
        fontSize: 12,
    },
});

export default TestModeCard;
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useIcons } from '../../contexts/IconContext';
import FormattedText from '../FormattedText';
import { getScoreColor, getScoreMessage } from '../../utils/test';

interface ScoreCardProps {
    score: number;
    correctAnswers: number;
    totalQuestions: number;
}

const ScoreCard: React.FC<ScoreCardProps> = ({
    score,
    correctAnswers,
    totalQuestions,
}) => {
    const { theme } = useTheme();
    const { language } = useLanguage();
    const { getIconName } = useIcons();

    const scoreColor = getScoreColor(score, theme);
    const scoreMessage = getScoreMessage(score, language);

    return (
        <LinearGradient
            colors={[scoreColor + '20', scoreColor + '05']}
            style={[styles.scoreCard, { backgroundColor: theme.colors.surface }]}
        >
            <View style={styles.scoreHeader}>
                <Ionicons name={getIconName('trophy') as any} size={32} color={scoreColor} />
                <FormattedText style={[styles.scoreMessage, { color: scoreColor }]}>
                    {scoreMessage}
                </FormattedText>
            </View>

            <View style={styles.scoreMain}>
                <FormattedText style={[styles.scoreValue, { color: scoreColor }]}>
                    {Math.round(score || 0)}%
                </FormattedText>
                <FormattedText style={[styles.scoreDetails, { color: theme.colors.textMuted }]}>
                    {correctAnswers || 0} / {totalQuestions || 0} {language === 'fr' ? 'correctes' : 'đúng'}
                </FormattedText>
            </View>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    scoreCard: {
        borderRadius: 20,
        padding: 24,
        marginBottom: 20,
        alignItems: 'center',
        elevation: 3,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
    },
    scoreHeader: {
        alignItems: 'center',
        marginBottom: 16,
    },
    scoreMessage: {
        fontSize: 18,
        fontWeight: '600',
        marginTop: 8,
    },
    scoreMain: {
        alignItems: 'center',
    },
    scoreValue: {
        fontSize: 48,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    scoreDetails: {
        fontSize: 16,
    },
});

export default ScoreCard;
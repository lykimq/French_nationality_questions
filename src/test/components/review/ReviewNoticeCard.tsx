import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FormattedText } from '../../../shared/components';
import { useTheme } from '../../../shared/contexts/ThemeContext';

export const ReviewNoticeCard: React.FC = () => {
    const { theme } = useTheme();

    return (
        <View style={[styles.reviewNoticeCard, { backgroundColor: theme.colors.accent, borderColor: theme.colors.warning }]}>
            <View style={styles.reviewNoticeHeader}>
                <Ionicons name="school" size={20} color={theme.colors.warning} />
                <FormattedText style={[styles.reviewNoticeTitle, { color: theme.colors.text }]}>
                    Mode Révision
                </FormattedText>
            </View>
            <FormattedText style={[styles.reviewNoticeText, { color: theme.colors.textMuted }]}>
                Cette question a été répondue incorrectement lors de tests précédents.
            </FormattedText>
        </View>
    );
};

const styles = StyleSheet.create({
    reviewNoticeCard: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
        borderWidth: 1,
    },
    reviewNoticeHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    reviewNoticeTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    reviewNoticeText: {
        fontSize: 14,
        lineHeight: 20,
    },
});


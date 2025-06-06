import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useIcons } from '../../contexts/IconContext';
import FormattedText from '../FormattedText';

interface ActionButtonsProps {
    onRetakeTest: () => void;
    onViewProgress: () => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
    onRetakeTest,
    onViewProgress,
}) => {
    const { theme } = useTheme();
    const { language } = useLanguage();
    const { getIconName } = useIcons();

    return (
        <View style={[styles.actionContainer, { backgroundColor: theme.colors.surface }]}>
            <TouchableOpacity
                style={[styles.actionButton, styles.secondaryButton, { borderColor: theme.colors.border }]}
                onPress={onViewProgress}
            >
                <Ionicons name={getIconName('analytics') as any} size={20} color={theme.colors.primary} />
                <FormattedText style={[styles.secondaryButtonText, { color: theme.colors.primary }]}>
                    {language === 'fr' ? 'Voir Progression' : 'Xem tiến độ'}
                </FormattedText>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.actionButton, styles.primaryButton, { backgroundColor: theme.colors.primary }]}
                onPress={onRetakeTest}
            >
                <Ionicons name={getIconName('refresh') as any} size={20} color="white" />
                <FormattedText style={styles.primaryButtonText}>
                    {language === 'fr' ? 'Nouveau Test' : 'Làm bài mới'}
                </FormattedText>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    actionContainer: {
        flexDirection: 'row',
        padding: 20,
        gap: 12,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 12,
    },
    primaryButton: {
        // backgroundColor set dynamically
    },
    secondaryButton: {
        borderWidth: 1,
    },
    primaryButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    secondaryButtonText: {
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
});

export default ActionButtons;
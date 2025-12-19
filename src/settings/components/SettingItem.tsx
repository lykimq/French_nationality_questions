import React from 'react';
import { View, Switch, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../shared/contexts/ThemeContext';
import { FormattedText } from '../../shared/components';
import { settingsStyles } from './settingsStyles';
import { sharedStyles, getCardContainerStyle } from '../../shared/utils';
import type { SettingItemProps } from '../../types';

const SettingItem: React.FC<SettingItemProps> = ({
    title,
    icon,
    iconColor,
    subtitle,
    isSwitch = false,
    value,
    onValueChange,
    onPress,
}) => {
    const { theme } = useTheme();

    return (
        <TouchableOpacity
            style={[settingsStyles.settingItem, getCardContainerStyle(theme)]}
            onPress={onPress}
            disabled={isSwitch}
        >
            <View style={[sharedStyles.iconContainer, { backgroundColor: iconColor + '20' }]}>
                <Ionicons name={icon as any} size={18} color={iconColor} />
            </View>
            <View style={styles.textContainer}>
                <FormattedText style={[settingsStyles.settingTitle, { color: theme.colors.text }]}>
                    {title}
                </FormattedText>
                {subtitle && (
                    <FormattedText style={[styles.subtitle, { color: theme.colors.textMuted }]}>
                        {subtitle}
                    </FormattedText>
                )}
            </View>
            {isSwitch && (
                <Switch
                    value={value}
                    onValueChange={onValueChange}
                    thumbColor={theme.colors.switchThumb}
                    trackColor={{ false: theme.colors.switchTrack, true: theme.colors.success }}
                />
            )}
            {!isSwitch && (
                <Ionicons name={theme.icons.chevronForward as any} size={20} color={theme.colors.textMuted} />
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    textContainer: {
        flex: 1,
        marginLeft: 12,
    },
    subtitle: {
        fontSize: 14,
        marginTop: 2,
    },
});

export default SettingItem;
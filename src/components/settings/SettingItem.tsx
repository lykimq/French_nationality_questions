import React from 'react';
import { StyleSheet, View, Switch, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import FormattedText from '../FormattedText';
import { sharedStyles } from '../../utils/sharedStyles';
import type { SettingItemProps } from '../../types';

const SettingItem: React.FC<SettingItemProps> = ({
    title,
    title_vi,
    icon,
    iconColor,
    isSwitch = false,
    value,
    onValueChange,
    onPress,
    language = 'fr',
}) => {
    const { theme } = useTheme();

    return (
        <TouchableOpacity
            style={[styles.settingItem, { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.divider }]}
            onPress={onPress}
            disabled={isSwitch}
        >
            <View style={[styles.iconContainer, { backgroundColor: iconColor + '20' }]}>
                <Ionicons name={icon as any} size={20} color={iconColor} />
            </View>
            <FormattedText style={[styles.settingTitle, { color: theme.colors.text }]}>
                {language === 'fr' ? title : (title_vi || title)}
            </FormattedText>
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
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderBottomWidth: 1,
    },
    iconContainer: {
        ...sharedStyles.iconContainer,
    },
    settingTitle: {
        flex: 1,
        fontSize: 16,
    },
});

export default SettingItem;
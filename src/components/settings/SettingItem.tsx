import React from 'react';
import { View, Switch, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import FormattedText from '../FormattedText';
import { settingsStyles } from './settingsStyles';
import { sharedStyles } from '../../utils/shared';
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
            style={[settingsStyles.settingItem, { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.divider }]}
            onPress={onPress}
            disabled={isSwitch}
        >
            <View style={[sharedStyles.iconContainer, { backgroundColor: iconColor + '20' }]}>
                <Ionicons name={icon as any} size={20} color={iconColor} />
            </View>
            <FormattedText style={[settingsStyles.settingTitle, { color: theme.colors.text }]}>
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

export default SettingItem;
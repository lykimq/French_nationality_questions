import React from 'react';
import { View, Switch, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../shared/contexts/ThemeContext';
import { useIcons } from '../../shared/contexts/IconContext';
import { FormattedText, Icon3D } from '../../shared/components';
import { settingsStyles } from './settingsStyles';
import { getCardContainerStyle } from '../../shared/utils';
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
    const { getIconName, getIconVariant } = useIcons();

    const chevronIconName = getIconName('chevronForward');
    const chevronVariant = getIconVariant('chevronForward');

    return (
        <TouchableOpacity
            style={[settingsStyles.settingItem, getCardContainerStyle(theme)]}
            onPress={onPress}
            disabled={isSwitch}
        >
            <Icon3D
                name={icon}
                size={16}
                color={iconColor}
                variant="glass"
                backgroundColor={theme.colors.card}
            />
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
                <Icon3D
                    name={chevronIconName}
                    size={16}
                    color={theme.colors.textMuted}
                    variant={chevronVariant}
                />
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

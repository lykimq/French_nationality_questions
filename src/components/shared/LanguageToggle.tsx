import React from 'react';
import { View, Switch, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import FormattedText from './FormattedText';
import { useTheme } from '../../contexts/ThemeContext';
import type { Language } from '../../types';

interface LanguageToggleProps {
    language: Language;
    onToggle: () => void;
    textColor?: string;
    style?: ViewStyle;
    labelStyle?: TextStyle;
}

const LanguageToggle: React.FC<LanguageToggleProps> = ({
    language,
    onToggle,
    textColor,
    style,
    labelStyle,
}) => {
    const { theme } = useTheme();
    const labelColor = textColor || theme.colors.headerText;

    return (
        <View style={[styles.container, style]}>
            <FormattedText style={[styles.label, { color: labelColor }, labelStyle]}>
                FR
            </FormattedText>
            <Switch
                value={language === 'vi'}
                onValueChange={onToggle}
                thumbColor={theme.colors.switchThumb}
                trackColor={{ false: theme.colors.primaryLight, true: theme.colors.primaryLight }}
                style={styles.switch}
            />
            <FormattedText style={[styles.label, { color: labelColor }, labelStyle]}>
                VI
            </FormattedText>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    label: {
        marginHorizontal: 5,
        fontWeight: '600',
        fontSize: 12,
    },
    switch: {
        transform: [{ scale: 0.85 }],
    },
});

export default LanguageToggle;


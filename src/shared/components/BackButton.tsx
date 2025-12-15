import React from 'react';
import { TouchableOpacity, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useIcons } from '../contexts/IconContext';

interface BackButtonProps {
    onPress: () => void;
    style?: StyleProp<ViewStyle>;
    iconName?: string;
    iconSize?: number;
    iconColor?: string;
}

const BackButton: React.FC<BackButtonProps> = ({
    onPress,
    style,
    iconName,
    iconSize = 24,
    iconColor,
}) => {
    const { theme } = useTheme();
    const { getIconName } = useIcons();

    const defaultIconName = iconName || getIconName('arrowBack');
    const defaultIconColor = iconColor || theme.colors.headerText;

    return (
        <TouchableOpacity
            onPress={onPress}
            style={[styles.backButton, style]}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
            <Ionicons
                name={defaultIconName as any}
                size={iconSize}
                color={defaultIconColor}
            />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    backButton: {
        padding: 8,
    },
});

export default BackButton;


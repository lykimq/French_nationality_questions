import React from 'react';
import { TouchableOpacity, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useIcons } from '../contexts/IconContext';
import Icon3D from './Icon3D';

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
    const { getIconName, getIconVariant } = useIcons();

    const defaultIconName = iconName || getIconName('arrowBack');
    const defaultIconColor = iconColor || theme.colors.headerText;
    const iconVariant = getIconVariant('arrowBack');

    return (
        <TouchableOpacity
            onPress={onPress}
            style={[styles.backButton, style]}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
            <Icon3D
                name={defaultIconName}
                size={iconSize}
                color={defaultIconColor}
                variant={iconVariant}
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

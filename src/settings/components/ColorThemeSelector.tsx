import React from 'react';
import {
    StyleSheet,
    View,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme, colorThemeInfo } from '../../shared/contexts/ThemeContext';
import type { ColorTheme, SettingsComponentProps } from '../../types';
import { FormattedText } from '../../shared/components';
import { getCardContainerStyle } from '../../shared/utils';

const ColorThemeSelector: React.FC<SettingsComponentProps<ColorTheme>> = ({
    title,
    value,
    onValueChange,
}) => {
    const { theme } = useTheme();

    const ColorPreview: React.FC<{ themeId: ColorTheme; isSelected: boolean }> = ({
        themeId,
        isSelected
    }) => {
        const themeInfo = colorThemeInfo[themeId];

        return (
            <TouchableOpacity
                style={[
                    styles.colorOption,
                    {
                        borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                        borderWidth: isSelected ? 3 : 1,
                    }
                ]}
                onPress={() => onValueChange(themeId)}
                activeOpacity={0.7}
            >
                {/* Color Preview Circle */}
                {themeInfo.isGradient ? (
                    <LinearGradient
                        colors={[themeInfo.primaryColor, themeInfo.accentColor]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.colorCircle}
                    >
                        {isSelected && (
                            <View style={styles.selectionOverlay}>
                                <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                            </View>
                        )}
                    </LinearGradient>
                ) : (
                    <View style={[styles.colorCircle, { backgroundColor: themeInfo.primaryColor }]}>
                        <View style={[styles.accentDot, { backgroundColor: themeInfo.accentColor }]} />
                        {isSelected && (
                            <View style={styles.selectionOverlay}>
                                <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                            </View>
                        )}
                    </View>
                )}

                {/* Theme Name */}
                <FormattedText style={[styles.themeName, { color: theme.colors.text }]} numberOfLines={1}>
                    {themeInfo.name.split(' ')[0]}
                </FormattedText>
            </TouchableOpacity>
        );
    };

    const selectedThemeInfo = colorThemeInfo[value];

    return (
        <View style={[styles.container, getCardContainerStyle(theme)]}>
            {/* Header */}
            <View style={styles.header}>
                <FormattedText style={[styles.title, { color: theme.colors.text }]}>
                    {title}
                </FormattedText>
                <FormattedText style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                    {selectedThemeInfo.name}
                </FormattedText>
            </View>

            {/* Horizontal Color Themes Scroll */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                style={styles.scrollView}
            >
                {Object.keys(colorThemeInfo).map((themeId) => (
                    <ColorPreview
                        key={themeId}
                        themeId={themeId as ColorTheme}
                        isSelected={value === themeId}
                    />
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 12,
        borderBottomWidth: 1,
    },
    header: {
        marginBottom: 10,
    },
    title: {
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 2,
    },
    subtitle: {
        fontSize: 13,
    },
    scrollView: {
        marginHorizontal: -16,
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingVertical: 4,
    },
    colorOption: {
        alignItems: 'center',
        marginRight: 12,
        borderRadius: 10,
        padding: 6,
    },
    colorCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        marginBottom: 5,
    },
    accentDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        position: 'absolute',
        bottom: -1,
        right: -1,
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.9)',
    },
    selectionOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    themeName: {
        fontSize: 12,
        fontWeight: '500',
        textAlign: 'center',
        maxWidth: 60,
    },
});

export default ColorThemeSelector;
import React from 'react';
import {
    StyleSheet,
    View,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme, colorThemeInfo } from '../../../shared/contexts/ThemeContext';
import type { ColorTheme, SettingsComponentProps } from '../../../types';
import { FormattedText } from '../../../shared/components';
import { sharedStyles } from '../../../shared/utils';

const ColorThemeSelector: React.FC<SettingsComponentProps<ColorTheme>> = ({
    title,
    title_vi,
    language,
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
                    {language === 'fr' ? themeInfo.name.split(' ')[0] : themeInfo.nameVi.split(' ')[0]}
                </FormattedText>
            </TouchableOpacity>
        );
    };

    const selectedThemeInfo = colorThemeInfo[value];

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.divider }]}>
            {/* Header */}
            <View style={styles.header}>
                <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary + '15' }]}>
                    <Ionicons name="color-palette" size={20} color={theme.colors.primary} />
                </View>
                <View style={styles.headerText}>
                    <FormattedText style={[styles.title, { color: theme.colors.text }]}>
                        {language === 'fr' ? title : title_vi}
                    </FormattedText>
                    <FormattedText style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                        {language === 'fr' ? selectedThemeInfo.name : selectedThemeInfo.nameVi}
                    </FormattedText>
                </View>
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
        marginBottom: 1,
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
    },
    header: {
        ...sharedStyles.row,
        marginBottom: 12,
    },
    iconContainer: {
        ...sharedStyles.iconContainer,
        marginRight: 12,
    },
    headerText: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 2,
    },
    subtitle: {
        fontSize: 14,
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
        marginRight: 16,
        borderRadius: 12,
        padding: 8,
    },
    colorCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        marginBottom: 6,
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
        borderRadius: 22,
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
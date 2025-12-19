import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../shared/contexts/ThemeContext';
import ColorThemeSelector from './ColorThemeSelector';
import { FormattedText } from '../../shared/components';
import { sharedStyles, getCardContainerStyle } from '../../shared/utils';

const ThemeSettings: React.FC = () => {
    const { theme, themeMode, colorTheme, setThemeMode, setColorTheme } = useTheme();

    return (
        <View>
            {/* Color Theme Selector */}
            <ColorThemeSelector
                title="Thème de couleur"
                value={colorTheme}
                onValueChange={setColorTheme}
            />

            {/* Theme Selector */}
            <View style={[styles.themeSelector, getCardContainerStyle(theme)]}>
                <View style={styles.themeSelectorLeft}>
                    <View style={[sharedStyles.iconContainer, { backgroundColor: (themeMode === 'dark' ? '#FFA726' : '#FFB74D') + '15' }]}>
                        <Ionicons name={themeMode === 'dark' ? 'moon' : 'sunny'} size={20} color={themeMode === 'dark' ? '#FFA726' : '#FFB74D'} />
                    </View>
                    <FormattedText style={[styles.themeSelectorTitle, { color: theme.colors.text }]}>
                        Mode d'affichage
                    </FormattedText>
                </View>

                <View style={[styles.themeToggleWrapper, { backgroundColor: theme.colors.background }]}>
                    <TouchableOpacity
                        style={[
                            styles.themeOption,
                            themeMode === 'light' && [styles.themeOptionActive, { backgroundColor: theme.colors.primary }]
                        ]}
                        onPress={() => setThemeMode('light')}
                        activeOpacity={0.7}
                    >
                        <Ionicons
                            name="sunny"
                            size={14}
                            color={themeMode === 'light' ? '#FFFFFF' : theme.colors.textMuted}
                            style={styles.themeOptionIcon}
                        />
                        <FormattedText style={[
                            styles.themeOptionText,
                            { color: themeMode === 'light' ? '#FFFFFF' : theme.colors.textMuted }
                        ]}>
                            Clair
                        </FormattedText>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.themeOption,
                            themeMode === 'dark' && [styles.themeOptionActive, { backgroundColor: theme.colors.primary }]
                        ]}
                        onPress={() => setThemeMode('dark')}
                        activeOpacity={0.7}
                    >
                        <Ionicons
                            name="moon"
                            size={14}
                            color={themeMode === 'dark' ? '#FFFFFF' : theme.colors.textMuted}
                            style={styles.themeOptionIcon}
                        />
                        <FormattedText style={[
                            styles.themeOptionText,
                            { color: themeMode === 'dark' ? '#FFFFFF' : theme.colors.textMuted }
                        ]}>
                            Sombre
                        </FormattedText>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    themeSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
    },
    themeSelectorLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    themeSelectorTitle: {
        fontSize: 15,
        fontWeight: '600',
        marginLeft: 12,
    },
    themeToggleWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        padding: 2,
        borderRadius: 20,
    },
    themeOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 14,
        marginLeft: 2,
        minWidth: 65,
        justifyContent: 'center',
    },
    themeOptionActive: {
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    themeOptionIcon: {
        marginRight: 4,
    },
    themeOptionText: {
        fontSize: 12,
        fontWeight: '600',
    },
});

export default ThemeSettings;
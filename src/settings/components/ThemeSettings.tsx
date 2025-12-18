import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../shared/contexts/ThemeContext';
import ColorThemeSelector from './ColorThemeSelector';
import { FormattedText } from '../../shared/components';
import { settingsStyles } from './settingsStyles';
import { sharedStyles } from '../../shared/utils';

const ThemeSettings: React.FC = () => {
    const { theme, themeMode, colorTheme, setThemeMode, setColorTheme } = useTheme();

    return (
        <View style={[settingsStyles.section, { backgroundColor: theme.colors.card }]}>
            <FormattedText style={[settingsStyles.sectionTitle, { color: theme.colors.textSecondary, borderBottomColor: theme.colors.divider }]}>
                Apparence
            </FormattedText>

            {/* Color Theme Selector */}
            <ColorThemeSelector
                title="Thème de couleur"
                value={colorTheme}
                onValueChange={setColorTheme}
            />

            {/* Theme Selector */}
            <View style={[styles.themeSelector, { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.divider }]}>
                <View style={styles.themeSelectorLeft}>
                    <View style={[sharedStyles.iconContainer, { backgroundColor: (themeMode === 'dark' ? '#FFA726' : '#FFB74D') + '15' }]}>
                        <Ionicons name={themeMode === 'dark' ? 'moon' : 'sunny'} size={22} color={themeMode === 'dark' ? '#FFA726' : '#FFB74D'} />
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
                            size={16}
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
                            size={16}
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
        paddingVertical: 16,
        paddingHorizontal: 15,
        borderBottomWidth: 1,
    },
    themeSelectorLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    themeSelectorTitle: {
        fontSize: 16,
        fontWeight: '600',
    },
    themeToggleWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        padding: 3,
        borderRadius: 22,
    },
    themeOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 16,
        marginLeft: 3,
        minWidth: 70,
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
        fontSize: 13,
        fontWeight: '600',
    },
});

export default ThemeSettings;
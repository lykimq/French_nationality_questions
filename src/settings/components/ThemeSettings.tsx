import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { useTheme } from '../../shared/contexts/ThemeContext';
import { useIcons } from '../../shared/contexts/IconContext';
import ColorThemeSelector from './ColorThemeSelector';
import { FormattedText, Icon3D } from '../../shared/components';
import { getCardContainerStyle } from '../../shared/utils';

const ThemeSettings: React.FC = () => {
    const { theme, themeMode, colorTheme, setThemeMode, setColorTheme } = useTheme();
    const { getIconName, getIconVariant } = useIcons();

    const sunIconName = getIconName('sun');
    const moonIconName = getIconName('moon');
    const sunVariant = getIconVariant('sun');
    const moonVariant = getIconVariant('moon');

    const currentIconColor = themeMode === 'dark' ? '#FFA726' : '#FFB74D';

    return (
        <View>
            <ColorThemeSelector
                title="Thème de couleur"
                value={colorTheme}
                onValueChange={setColorTheme}
            />

            <View style={[styles.themeSelector, getCardContainerStyle(theme)]}>
                <View style={styles.themeSelectorLeft}>
                    <Icon3D
                        name={themeMode === 'dark' ? moonIconName : sunIconName}
                        size={18}
                        color={currentIconColor}
                        variant={themeMode === 'dark' ? moonVariant : sunVariant}
                        backgroundColor={theme.colors.card}
                    />
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
                        <Icon3D
                            name={sunIconName}
                            size={12}
                            color={themeMode === 'light' ? '#FFFFFF' : theme.colors.textMuted}
                            variant="default"
                            containerStyle={styles.themeOptionIcon}
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
                        <Icon3D
                            name={moonIconName}
                            size={12}
                            color={themeMode === 'dark' ? '#FFFFFF' : theme.colors.textMuted}
                            variant="default"
                            containerStyle={styles.themeOptionIcon}
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
        gap: 12,
    },
    themeSelectorTitle: {
        fontSize: 15,
        fontWeight: '600',
    },
    themeToggleWrapper: {
        flexDirection: 'row',
        borderRadius: 20,
        padding: 3,
    },
    themeOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 17,
    },
    themeOptionActive: {
    },
    themeOptionIcon: {
        marginRight: 4,
    },
    themeOptionText: {
        fontSize: 13,
        fontWeight: '500',
    },
});

export default ThemeSettings;

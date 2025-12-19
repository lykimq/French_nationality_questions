import React from 'react';
import { View, Alert } from 'react-native';
import { useTextFormatting } from '../../shared/contexts/TextFormattingContext';
import { useTheme } from '../../shared/contexts/ThemeContext';
import SliderSetting from './SliderSetting';
import { FormattedText } from '../../shared/components';
import SettingItem from './SettingItem';
import { settingsStyles } from './settingsStyles';

const TextFormattingSettings: React.FC = () => {
    const { theme } = useTheme();
    const {
        settings,
        updateFontSize,
        resetToDefaults
    } = useTextFormatting();

    const handleResetTextSettings = () => {
        Alert.alert(
            'Réinitialisation',
            'Réinitialiser tous les paramètres de texte aux valeurs par défaut ?',
            [
                {
                    text: 'Annuler',
                    style: 'cancel',
                },
                {
                    text: 'Réinitialiser',
                    style: 'destructive',
                    onPress: resetToDefaults,
                },
            ]
        );
    };

    return (
        <View style={[settingsStyles.section, { backgroundColor: theme.colors.card }]}>
            <FormattedText style={[settingsStyles.sectionTitle, { color: theme.colors.textSecondary, borderBottomColor: theme.colors.divider }]}>
                Formatage du texte
            </FormattedText>

            <SliderSetting
                title="Taille de police"
                value={settings.fontSize}
                minimumValue={12}
                maximumValue={24}
                step={1}
                onValueChange={updateFontSize}
                formatValue={(val: number) => `${val}px`}
            />

            <SettingItem
                title="Réinitialiser les paramètres de texte"
                icon={theme.icons.refresh}
                iconColor={theme.colors.error}
                onPress={handleResetTextSettings}
            />
        </View>
    );
};


export default TextFormattingSettings;
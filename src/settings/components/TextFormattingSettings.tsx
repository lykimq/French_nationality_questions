import React from 'react';
import { View } from 'react-native';
import { useTextFormatting } from '../../shared/contexts/TextFormattingContext';
import { useTheme } from '../../shared/contexts/ThemeContext';
import SliderSetting from './SliderSetting';
import SettingItem from './SettingItem';
import { showConfirmationAlert } from '../../shared/utils';

const TextFormattingSettings: React.FC = () => {
    const { theme } = useTheme();
    const {
        settings,
        updateFontSize,
        resetToDefaults
    } = useTextFormatting();

    const handleResetTextSettings = () => {
        showConfirmationAlert({
            title: 'Réinitialisation',
            message: 'Réinitialiser tous les paramètres de texte aux valeurs par défaut ?',
            confirmText: 'Réinitialiser',
            onConfirm: resetToDefaults,
        });
    };

    return (
        <View>
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
import React from 'react';
import { View, Share } from 'react-native';
import { useTheme } from '../../shared/contexts/ThemeContext';
import SettingItem from './SettingItem';
import { showSimpleAlert } from '../../shared/utils';

interface AppInfoSettingsProps {
    onRateApp: () => void;
}

const APP_VERSION = '1.0.0';

const AppInfoSettings: React.FC<AppInfoSettingsProps> = ({ onRateApp }) => {
    const { theme } = useTheme();

    const shareApp = async () => {
        try {
            await Share.share({
                message: 'Découvrez cette application de préparation à l\'entretien de naturalisation française!',
            });
        } catch (error) {
            // Silently handle share cancellation
        }
    };

    const showAppVersion = () => {
        showSimpleAlert({
            title: 'Version de l\'application',
            message: `Version: ${APP_VERSION}\n\nCette application vous aide à préparer votre entretien de naturalisation française avec des questions et réponses pratiques.`,
        });
    };

    return (
        <View>
            <SettingItem
                title="Partager l'application"
                icon={theme.icons.share}
                iconColor={theme.colors.warning}
                onPress={shareApp}
            />

            <SettingItem
                title="Évaluer l'application"
                icon={theme.icons.star}
                iconColor={theme.colors.accent}
                onPress={onRateApp}
            />

            <SettingItem
                title="Version de l'application"
                icon={theme.icons.info}
                iconColor={theme.colors.info}
                onPress={showAppVersion}
                subtitle={`v${APP_VERSION}`}
            />
        </View>
    );
};

export default AppInfoSettings;
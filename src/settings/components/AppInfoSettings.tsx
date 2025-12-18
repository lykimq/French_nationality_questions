import React from 'react';
import { StyleSheet, View, TouchableOpacity, Share, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../shared/contexts/ThemeContext';
import { FormattedText } from '../../shared/components';
import SettingItem from './SettingItem';
import { settingsStyles } from './settingsStyles';
import { sharedStyles } from '../../shared/utils';

interface AppInfoSettingsProps {
    onRateApp: () => void;
}

const AppInfoSettings: React.FC<AppInfoSettingsProps> = ({ onRateApp }) => {
    const { theme } = useTheme();
    const APP_VERSION = '1.0.0';

    const shareApp = async () => {
        try {
            await Share.share({
                message: 'Découvrez cette application de préparation à l\'entretien de naturalisation française!',
            });
        } catch (error) {
            console.error('Error sharing:', error);
        }
    };

    const showAppVersion = () => {
        Alert.alert(
            'Version de l\'application',
            `Version: ${APP_VERSION}\n\nCette application vous aide à préparer votre entretien de naturalisation française avec des questions et réponses pratiques.`,
            [
                {
                    text: 'OK',
                    style: 'default',
                }
            ]
        );
    };

    return (
        <View style={[settingsStyles.section, { backgroundColor: theme.colors.card }]}>
            <FormattedText style={[settingsStyles.sectionTitle, { color: theme.colors.textSecondary, borderBottomColor: theme.colors.divider }]}>
                Autres options
            </FormattedText>

            <SettingItem
                title="Partager l'application"
                icon={theme.icons.share}
                iconColor={theme.colors.warning}
                onPress={shareApp}
            />

            <SettingItem
                title="Évaluer l'application"
                icon={theme.icons.star}
                iconColor="#FFC107"
                onPress={onRateApp}
            />

            <View style={[settingsStyles.settingItem, { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.divider }]}>
                <TouchableOpacity
                    style={styles.versionContainer}
                    onPress={showAppVersion}
                >
                    <View style={[sharedStyles.iconContainer, { backgroundColor: '#9C27B0' + '20' }]}>
                        <Ionicons name={theme.icons.info as any} size={20} color="#9C27B0" />
                    </View>
                    <View style={styles.versionInfo}>
                        <FormattedText style={[settingsStyles.settingTitle, { color: theme.colors.text }]}>
                            Version de l'application
                        </FormattedText>
                        <FormattedText style={[styles.versionNumber, { color: theme.colors.textMuted }]}>
                            v{APP_VERSION}
                        </FormattedText>
                    </View>
                    <Ionicons name={theme.icons.chevronForward as any} size={20} color={theme.colors.textMuted} />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    versionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        paddingVertical: 12,
    },
    versionInfo: {
        flex: 1,
        marginLeft: 0,
    },
    versionNumber: {
        fontSize: 14,
        marginTop: 2,
    },
});

export default AppInfoSettings;
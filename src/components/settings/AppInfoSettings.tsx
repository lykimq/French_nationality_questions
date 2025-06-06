import React from 'react';
import { StyleSheet, View, TouchableOpacity, Share, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import FormattedText from '../FormattedText';
import SettingItem from './SettingItem';
import { sharedStyles } from '../../utils/sharedStyles';

interface AppInfoSettingsProps {
    language: 'fr' | 'vi';
    onRateApp: () => void;
}

const AppInfoSettings: React.FC<AppInfoSettingsProps> = ({ language, onRateApp }) => {
    const { theme } = useTheme();
    const APP_VERSION = '1.0.0';

    const shareApp = async () => {
        try {
            const message = language === 'fr'
                ? 'Découvrez cette application de préparation à l\'entretien de naturalisation française!'
                : 'Khám phá ứng dụng này để chuẩn bị cho buổi phỏng vấn nhập quốc tịch Pháp!';

            await Share.share({
                message,
            });
        } catch (error) {
            console.error('Error sharing:', error);
        }
    };

    const showAppVersion = () => {
        const title = language === 'fr' ? 'Version de l\'application' : 'Phiên bản ứng dụng';
        const message = language === 'fr'
            ? `Version: ${APP_VERSION}\n\nCette application vous aide à préparer votre entretien de naturalisation française avec des questions et réponses pratiques.`
            : `Phiên bản: ${APP_VERSION}\n\nỨng dụng này giúp bạn chuẩn bị cho buổi phỏng vấn nhập quốc tịch Pháp với các câu hỏi và câu trả lời thực tế.`;

        Alert.alert(title, message, [
            {
                text: 'OK',
                style: 'default',
            }
        ]);
    };

    return (
        <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
            <FormattedText style={[styles.sectionTitle, { color: theme.colors.textSecondary, borderBottomColor: theme.colors.divider }]}>
                {language === 'fr' ? 'Autres options' : 'Tùy chọn khác'}
            </FormattedText>

            <SettingItem
                title="Partager l'application"
                title_vi="Chia sẻ ứng dụng"
                icon={theme.icons.share}
                iconColor={theme.colors.warning}
                onPress={shareApp}
                language={language}
            />

            <SettingItem
                title="Évaluer l'application"
                title_vi="Đánh giá ứng dụng"
                icon={theme.icons.star}
                iconColor="#FFC107"
                onPress={onRateApp}
                language={language}
            />

            <View style={[styles.settingItem, { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.divider }]}>
                <TouchableOpacity
                    style={styles.versionContainer}
                    onPress={showAppVersion}
                >
                    <View style={[styles.iconContainer, { backgroundColor: '#9C27B0' + '20' }]}>
                        <Ionicons name={theme.icons.info as any} size={20} color="#9C27B0" />
                    </View>
                    <View style={styles.versionInfo}>
                        <FormattedText style={[styles.settingTitle, { color: theme.colors.text }]}>
                            {language === 'fr' ? 'Version de l\'application' : 'Phiên bản ứng dụng'}
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
    section: {
        ...sharedStyles.section,
        ...sharedStyles.lightShadow,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        paddingHorizontal: 15,
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderBottomWidth: 1,
    },
    iconContainer: {
        ...sharedStyles.iconContainer,
    },
    settingTitle: {
        flex: 1,
        fontSize: 16,
    },
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
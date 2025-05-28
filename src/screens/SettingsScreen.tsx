import React, { useState, useContext } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Switch,
    ScrollView,
    TouchableOpacity,
    Share,
    Linking,
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../contexts/LanguageContext';

type SettingItemProps = {
    title: string;
    titleVi?: string;
    icon: string;
    iconColor: string;
    isSwitch?: boolean;
    value?: boolean;
    onValueChange?: (value: boolean) => void;
    onPress?: () => void;
    language?: 'fr' | 'vi';
};

const SettingItem: React.FC<SettingItemProps> = ({
    title,
    titleVi,
    icon,
    iconColor,
    isSwitch = false,
    value,
    onValueChange,
    onPress,
    language = 'fr',
}) => (
    <TouchableOpacity
        style={styles.settingItem}
        onPress={onPress}
        disabled={isSwitch || !onPress}
        activeOpacity={0.7}
    >
        <View style={[styles.iconContainer, { backgroundColor: iconColor + '20' }]}>
            <Ionicons name={icon as any} size={20} color={iconColor} />
        </View>
        <Text style={styles.settingTitle}>
            {language === 'fr' ? title : (titleVi || title)}
        </Text>
        {isSwitch ? (
            <Switch
                value={value}
                onValueChange={onValueChange}
                trackColor={{ false: '#d1d1d1', true: '#3F51B5' }}
                thumbColor="#fff"
            />
        ) : (
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
        )}
    </TouchableOpacity>
);

// Add new context for display settings
export const DisplaySettingsContext = React.createContext({
    isSlideMode: false,
    toggleSlideMode: () => { },
});

export const useDisplaySettings = () => useContext(DisplaySettingsContext);

interface DisplaySettingsProviderProps {
    children: React.ReactNode;
}

export const DisplaySettingsProvider: React.FC<DisplaySettingsProviderProps> = ({ children }) => {
    const [isSlideMode, setIsSlideMode] = useState(false);
    const toggleSlideMode = () => setIsSlideMode(prev => !prev);

    return (
        <DisplaySettingsContext.Provider value={{ isSlideMode, toggleSlideMode }}>
            {children}
        </DisplaySettingsContext.Provider>
    );
};

const SettingsScreen = () => {
    const [showTranslation, setShowTranslation] = useState(true);
    const [darkMode, setDarkMode] = useState(false);
    const { language, toggleLanguage } = useLanguage();
    const { isSlideMode, toggleSlideMode } = useDisplaySettings();

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

    const rateApp = () => {
        // This would normally open the app store but for now we'll just show a link
        const message = language === 'fr'
            ? 'Cette fonctionnalité ouvrira le Play Store/App Store dans la version finale'
            : 'Tính năng này sẽ mở Play Store/App Store trong phiên bản cuối cùng';

        alert(message);
    };

    const openPrivacyPolicy = () => {
        // Replace with your actual privacy policy URL
        Linking.openURL('https://example.com/privacy-policy');
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#3F51B5" />

            <SafeAreaView style={styles.safeArea} edges={['top']}>
                <View style={styles.header}>
                    <Text style={styles.title}>
                        {language === 'fr' ? 'Paramètres' : 'Cài đặt'}
                    </Text>
                    <View style={styles.languageSelector}>
                        <Text style={styles.languageLabel}>FR</Text>
                        <Switch
                            value={language === 'vi'}
                            onValueChange={toggleLanguage}
                            thumbColor="#fff"
                            trackColor={{ false: '#7986CB', true: '#7986CB' }}
                        />
                        <Text style={styles.languageLabel}>VI</Text>
                    </View>
                </View>
            </SafeAreaView>

            <ScrollView style={styles.scrollView}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                        {language === 'fr' ? 'Préférences' : 'Tùy chọn'}
                    </Text>
                    <SettingItem
                        title="Mode diaporama pour les questions"
                        titleVi="Chế độ trình chiếu cho câu hỏi"
                        icon="swap-horizontal"
                        iconColor="#3F51B5"
                        isSwitch
                        value={isSlideMode}
                        onValueChange={toggleSlideMode}
                        language={language}
                    />
                    <SettingItem
                        title="Afficher les traductions"
                        titleVi="Hiển thị bản dịch"
                        icon="language"
                        iconColor="#3F51B5"
                        isSwitch
                        value={showTranslation}
                        onValueChange={setShowTranslation}
                        language={language}
                    />
                    <SettingItem
                        title="Mode sombre"
                        titleVi="Chế độ tối"
                        icon="moon"
                        iconColor="#5C6BC0"
                        isSwitch
                        value={darkMode}
                        onValueChange={setDarkMode}
                        language={language}
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                        {language === 'fr' ? 'À propos' : 'Giới thiệu'}
                    </Text>
                    <SettingItem
                        title="Partager l'application"
                        titleVi="Chia sẻ ứng dụng"
                        icon="share-social"
                        iconColor="#FF9800"
                        onPress={shareApp}
                        language={language}
                    />
                    <SettingItem
                        title="Évaluer l'application"
                        titleVi="Đánh giá ứng dụng"
                        icon="star"
                        iconColor="#FFC107"
                        onPress={rateApp}
                        language={language}
                    />
                    <SettingItem
                        title="Politique de confidentialité"
                        titleVi="Chính sách bảo mật"
                        icon="shield-checkmark"
                        iconColor="#4CAF50"
                        onPress={openPrivacyPolicy}
                        language={language}
                    />
                    <SettingItem
                        title="Version de l'application"
                        titleVi="Phiên bản ứng dụng"
                        icon="information-circle"
                        iconColor="#9C27B0"
                        onPress={() => { }}
                        language={language}
                    />
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    safeArea: {
        backgroundColor: '#3F51B5',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 10,
        paddingHorizontal: 20,
        paddingBottom: 15,
        backgroundColor: '#3F51B5',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    languageSelector: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    languageLabel: {
        color: '#fff',
        marginHorizontal: 5,
        fontWeight: '600',
    },
    scrollView: {
        flex: 1,
    },
    section: {
        backgroundColor: '#fff',
        borderRadius: 10,
        marginHorizontal: 15,
        marginTop: 20,
        marginBottom: 5,
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#666',
        paddingHorizontal: 15,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        backgroundColor: '#fff',
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    settingTitle: {
        flex: 1,
        fontSize: 16,
        color: '#333',
    },
});

export default SettingsScreen;
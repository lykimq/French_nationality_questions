import React, { useState, useContext } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Switch,
    ScrollView,
    TouchableOpacity,
    Share,
    StatusBar,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../contexts/LanguageContext';
import { useTextFormatting, getTextStyles } from '../contexts/TextFormattingContext';
import SliderSetting from '../components/SliderSetting';
import FontSelector from '../components/FontSelector';
import FormattedText from '../components/FormattedText';

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
    <TouchableOpacity style={styles.settingItem} onPress={onPress} disabled={isSwitch}>
        <View style={[styles.iconContainer, { backgroundColor: iconColor + '20' }]}>
            <Ionicons name={icon as any} size={20} color={iconColor} />
        </View>
        <FormattedText style={styles.settingTitle}>
            {language === 'fr' ? title : (titleVi || title)}
        </FormattedText>
        {isSwitch && (
            <Switch
                value={value}
                onValueChange={onValueChange}
                thumbColor="#fff"
                trackColor={{ false: '#ccc', true: '#4CAF50' }}
            />
        )}
        {!isSwitch && (
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
        )}
    </TouchableOpacity>
);

// Remove the DisplaySettingsContext since we'll only use slide mode
export const DisplaySettingsContext = React.createContext({
    isSlideMode: true, // Always true now
    toggleSlideMode: () => { },
});

export const useDisplaySettings = () => useContext(DisplaySettingsContext);

interface DisplaySettingsProviderProps {
    children: React.ReactNode;
}

export const DisplaySettingsProvider: React.FC<DisplaySettingsProviderProps> = ({ children }) => {
    // Always use slide mode
    const isSlideMode = true;
    const toggleSlideMode = () => { }; // No-op since we always use slide mode

    return (
        <DisplaySettingsContext.Provider value={{ isSlideMode, toggleSlideMode }}>
            {children}
        </DisplaySettingsContext.Provider>
    );
};

const SettingsScreen = () => {
    const { language, toggleLanguage } = useLanguage();
    const { isSlideMode, toggleSlideMode } = useDisplaySettings();
    const {
        settings,
        updateFontSize,
        updateFontFamily,
        updateLineHeight,
        updateLetterSpacing,
        resetToDefaults
    } = useTextFormatting();

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

        Alert.alert(
            language === 'fr' ? 'Information' : 'Thông tin',
            message
        );
    };

    const handleResetTextSettings = () => {
        const title = language === 'fr' ? 'Réinitialisation' : 'Đặt lại';
        const message = language === 'fr'
            ? 'Réinitialiser tous les paramètres de texte aux valeurs par défaut ?'
            : 'Đặt lại tất cả cài đặt văn bản về giá trị mặc định?';

        Alert.alert(
            title,
            message,
            [
                {
                    text: language === 'fr' ? 'Annuler' : 'Hủy',
                    style: 'cancel',
                },
                {
                    text: language === 'fr' ? 'Réinitialiser' : 'Đặt lại',
                    style: 'destructive',
                    onPress: resetToDefaults,
                },
            ]
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#3F51B5" />

            <SafeAreaView style={styles.safeArea} edges={['top']}>
                <View style={styles.header}>
                    <FormattedText style={styles.title}>
                        {language === 'fr' ? 'Paramètres' : 'Cài đặt'}
                    </FormattedText>
                    <View style={styles.languageSelector}>
                        <FormattedText style={styles.languageLabel}>FR</FormattedText>
                        <Switch
                            value={language === 'vi'}
                            onValueChange={toggleLanguage}
                            thumbColor="#fff"
                            trackColor={{ false: '#7986CB', true: '#7986CB' }}
                        />
                        <FormattedText style={styles.languageLabel}>VI</FormattedText>
                    </View>
                </View>
            </SafeAreaView>

            <ScrollView style={styles.scrollView}>
                {/* Text Formatting Section */}
                <View style={styles.section}>
                    <FormattedText style={styles.sectionTitle}>
                        {language === 'fr' ? 'Formatage du texte' : 'Định dạng văn bản'}
                    </FormattedText>

                    {/* Text Preview */}
                    <View style={styles.previewContainer}>
                        <FormattedText style={styles.previewLabel}>
                            {language === 'fr' ? 'Aperçu :' : 'Xem trước:'}
                        </FormattedText>

                        {/* Question Style Preview */}
                        <View style={styles.questionPreview}>
                            <View style={styles.previewQuestionHeader}>
                                <View style={styles.previewIdContainer}>
                                    <FormattedText style={styles.previewId}>42</FormattedText>
                                </View>
                                <FormattedText style={styles.previewQuestion}>
                                    {language === 'fr'
                                        ? 'Quelle est la devise de la République française ?'
                                        : 'Khẩu hiệu của Cộng hòa Pháp là gì?'
                                    }
                                </FormattedText>
                            </View>
                        </View>

                        {/* General Text Preview */}
                        <FormattedText style={[styles.previewText, getTextStyles(settings)]}>
                            {language === 'fr'
                                ? 'Ceci est un exemple de texte avec vos paramètres de formatage. Vous pouvez voir comment la taille de police, la police, l\'espacement des lignes et l\'espacement des lettres affectent l\'apparence du texte dans l\'application.'
                                : 'Đây là một ví dụ về văn bản với cài đặt định dạng của bạn. Bạn có thể thấy cách kích thước phông chữ, phông chữ, khoảng cách dòng và khoảng cách chữ cái ảnh hưởng đến giao diện của văn bản trong ứng dụng.'
                            }
                        </FormattedText>
                    </View>

                    <SliderSetting
                        title="Taille de police"
                        titleVi="Kích thước chữ"
                        language={language}
                        value={settings.fontSize}
                        minimumValue={12}
                        maximumValue={24}
                        step={1}
                        onValueChange={updateFontSize}
                        formatValue={(val) => `${val}px`}
                    />

                    <FontSelector
                        title="Police de caractères"
                        titleVi="Phông chữ"
                        language={language}
                        value={settings.fontFamily}
                        onValueChange={updateFontFamily}
                    />

                    <SliderSetting
                        title="Hauteur de ligne"
                        titleVi="Chiều cao dòng"
                        language={language}
                        value={settings.lineHeight}
                        minimumValue={1.0}
                        maximumValue={2.0}
                        step={0.1}
                        onValueChange={updateLineHeight}
                        formatValue={(val) => val.toFixed(1)}
                    />

                    <SliderSetting
                        title="Espacement des lettres"
                        titleVi="Khoảng cách chữ"
                        language={language}
                        value={settings.letterSpacing}
                        minimumValue={-1}
                        maximumValue={3}
                        step={0.5}
                        onValueChange={updateLetterSpacing}
                        formatValue={(val) => `${val}px`}
                    />

                    <SettingItem
                        title="Réinitialiser les paramètres de texte"
                        titleVi="Đặt lại cài đặt văn bản"
                        icon="refresh"
                        iconColor="#FF5722"
                        onPress={handleResetTextSettings}
                        language={language}
                    />
                </View>

                <View style={styles.section}>
                    <FormattedText style={styles.sectionTitle}>
                        {language === 'fr' ? 'Autres options' : 'Tùy chọn khác'}
                    </FormattedText>
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
        backgroundColor: '#F5F5F5',
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
    previewContainer: {
        paddingHorizontal: 15,
        paddingVertical: 15,
        backgroundColor: '#f9f9f9',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    previewLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
        marginBottom: 8,
    },
    previewText: {
        color: '#333',
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e0e0e0',
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
    questionPreview: {
        padding: 10,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#f0f0f0',
        borderRadius: 8,
        marginBottom: 10,
    },
    previewQuestionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    previewIdContainer: {
        width: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        marginRight: 10,
    },
    previewId: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#333',
    },
    previewQuestion: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
});

export default SettingsScreen;
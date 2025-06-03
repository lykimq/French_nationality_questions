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
import { useTheme } from '../contexts/ThemeContext';
import { useIcons } from '../contexts/IconContext';
import SliderSetting from '../components/SliderSetting';
import FontSelector from '../components/FontSelector';
import IconSelector from '../components/IconSelector';
import JsonIconSelector from '../components/JsonIconSelector';
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
}) => {
    const { theme } = useTheme();

    return (
        <TouchableOpacity
            style={[styles.settingItem, { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.divider }]}
            onPress={onPress}
            disabled={isSwitch}
        >
            <View style={[styles.iconContainer, { backgroundColor: iconColor + '20' }]}>
                <Ionicons name={icon as any} size={20} color={iconColor} />
            </View>
            <FormattedText style={[styles.settingTitle, { color: theme.colors.text }]}>
                {language === 'fr' ? title : (titleVi || title)}
            </FormattedText>
            {isSwitch && (
                <Switch
                    value={value}
                    onValueChange={onValueChange}
                    thumbColor={theme.colors.switchThumb}
                    trackColor={{ false: theme.colors.switchTrack, true: theme.colors.success }}
                />
            )}
            {!isSwitch && (
                <Ionicons name={theme.icons.chevronForward as any} size={20} color={theme.colors.textMuted} />
            )}
        </TouchableOpacity>
    );
};

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
    const { theme, themeMode, setThemeMode } = useTheme();
    const { iconSet, setIconSet, jsonIconSet, setJsonIconSet } = useIcons();
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

    const toggleTheme = () => {
        const newMode = themeMode === 'light' ? 'dark' : 'light';
        setThemeMode(newMode);
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <StatusBar barStyle={themeMode === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={theme.colors.headerBackground} />

            <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.headerBackground }]} edges={['top']}>
                <View style={[styles.header, { backgroundColor: theme.colors.headerBackground }]}>
                    <FormattedText style={[styles.title, { color: theme.colors.headerText }]}>
                        {language === 'fr' ? 'Paramètres' : 'Cài đặt'}
                    </FormattedText>
                    <View style={styles.languageSelector}>
                        <FormattedText style={[styles.languageLabel, { color: theme.colors.headerText }]}>FR</FormattedText>
                        <Switch
                            value={language === 'vi'}
                            onValueChange={toggleLanguage}
                            thumbColor={theme.colors.switchThumb}
                            trackColor={{ false: theme.colors.primaryLight, true: theme.colors.primaryLight }}
                        />
                        <FormattedText style={[styles.languageLabel, { color: theme.colors.headerText }]}>VI</FormattedText>
                    </View>
                </View>
            </SafeAreaView>

            <ScrollView style={[styles.scrollView, { backgroundColor: theme.colors.background }]}>
                {/* Theme Section */}
                <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
                    <FormattedText style={[styles.sectionTitle, { color: theme.colors.textSecondary, borderBottomColor: theme.colors.divider }]}>
                        {language === 'fr' ? 'Apparence' : 'Giao diện'}
                    </FormattedText>

                    {/* Theme Selector */}
                    <View style={[styles.themeSelector, { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.divider }]}>
                        <View style={styles.themeSelectorLeft}>
                            <View style={[styles.themeIconContainer, { backgroundColor: (themeMode === 'dark' ? '#FFA726' : '#FFB74D') + '15' }]}>
                                <Ionicons name={themeMode === 'dark' ? 'moon' : 'sunny'} size={22} color={themeMode === 'dark' ? '#FFA726' : '#FFB74D'} />
                            </View>
                            <FormattedText style={[styles.themeSelectorTitle, { color: theme.colors.text }]}>
                                {language === 'fr' ? 'Thème d\'affichage' : 'Chủ đề hiển thị'}
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
                                    {language === 'fr' ? 'Clair' : 'Sáng'}
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
                                    {language === 'fr' ? 'Sombre' : 'Tối'}
                                </FormattedText>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Icon Set Selector */}
                    <IconSelector
                        title="Style d'icônes"
                        titleVi="Kiểu biểu tượng"
                        language={language}
                        value={iconSet}
                        onValueChange={setIconSet}
                    />

                    {/* JSON Category Icon Set Selector */}
                    <JsonIconSelector
                        title="Style des icônes de catégories"
                        titleVi="Kiểu biểu tượng danh mục"
                        language={language}
                        value={jsonIconSet}
                        onValueChange={setJsonIconSet}
                    />
                </View>

                {/* Text Formatting Section */}
                <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
                    <FormattedText style={[styles.sectionTitle, { color: theme.colors.textSecondary, borderBottomColor: theme.colors.divider }]}>
                        {language === 'fr' ? 'Formatage du texte' : 'Định dạng văn bản'}
                    </FormattedText>

                    {/* Text Preview */}
                    <View style={[styles.previewContainer, { backgroundColor: theme.colors.background, borderBottomColor: theme.colors.divider }]}>
                        <FormattedText style={[styles.previewLabel, { color: theme.colors.textSecondary }]}>
                            {language === 'fr' ? 'Aperçu :' : 'Xem trước:'}
                        </FormattedText>

                        {/* Question Style Preview */}
                        <View style={[styles.questionPreview, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                            <View style={styles.previewQuestionHeader}>
                                <View style={[styles.previewIdContainer, { backgroundColor: theme.colors.primary }]}>
                                    <FormattedText style={[styles.previewId, { color: theme.colors.buttonText }]}>42</FormattedText>
                                </View>
                                <FormattedText style={[styles.previewQuestion, { color: theme.colors.text }]}>
                                    {language === 'fr'
                                        ? 'Quelle est la devise de la République française ?'
                                        : 'Khẩu hiệu của Cộng hòa Pháp là gì?'
                                    }
                                </FormattedText>
                            </View>
                        </View>

                        {/* General Text Preview */}
                        <FormattedText style={[styles.previewText, getTextStyles(settings), {
                            color: theme.colors.text,
                            backgroundColor: theme.colors.card,
                            borderColor: theme.colors.border
                        }]}>
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
                        icon={theme.icons.refresh}
                        iconColor={theme.colors.error}
                        onPress={handleResetTextSettings}
                        language={language}
                    />
                </View>

                <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
                    <FormattedText style={[styles.sectionTitle, { color: theme.colors.textSecondary, borderBottomColor: theme.colors.divider }]}>
                        {language === 'fr' ? 'Autres options' : 'Tùy chọn khác'}
                    </FormattedText>
                    <SettingItem
                        title="Partager l'application"
                        titleVi="Chia sẻ ứng dụng"
                        icon={theme.icons.share}
                        iconColor={theme.colors.warning}
                        onPress={shareApp}
                        language={language}
                    />
                    <SettingItem
                        title="Évaluer l'application"
                        titleVi="Đánh giá ứng dụng"
                        icon={theme.icons.star}
                        iconColor="#FFC107"
                        onPress={rateApp}
                        language={language}
                    />
                    <SettingItem
                        title="Version de l'application"
                        titleVi="Phiên bản ứng dụng"
                        icon={theme.icons.info}
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
    },
    safeArea: {
        // backgroundColor will be set dynamically
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 10,
        paddingHorizontal: 20,
        paddingBottom: 15,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    languageSelector: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    languageLabel: {
        marginHorizontal: 5,
        fontWeight: '600',
    },
    scrollView: {
        flex: 1,
    },
    section: {
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
        paddingHorizontal: 15,
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
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
    themeIconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
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
    previewContainer: {
        paddingHorizontal: 15,
        paddingVertical: 15,
        borderBottomWidth: 1,
    },
    previewLabel: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
    },
    previewText: {
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderBottomWidth: 1,
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
    },
    questionPreview: {
        padding: 10,
        borderWidth: 1,
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
        marginRight: 10,
    },
    previewId: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    previewQuestion: {
        fontSize: 14,
        fontWeight: '600',
    },
});

export default SettingsScreen;
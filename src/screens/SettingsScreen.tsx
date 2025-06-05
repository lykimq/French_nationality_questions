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
    Modal,
    Linking,
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
import ColorThemeSelector from '../components/ColorThemeSelector';
import FormattedText from '../components/FormattedText';

type SettingItemProps = {
    title: string;
    title_vi?: string;
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
    title_vi,
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
                {language === 'fr' ? title : (title_vi || title)}
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
    const { theme, themeMode, colorTheme, setThemeMode, setColorTheme } = useTheme();
    const { iconSet, setIconSet, jsonIconSet, setJsonIconSet } = useIcons();
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [selectedRating, setSelectedRating] = useState(0);
    const {
        settings,
        updateFontSize,
        updateFontFamily,
        updateLineHeight,
        updateLetterSpacing,
        resetToDefaults
    } = useTextFormatting();

    // App version
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

    const rateApp = () => {
        setShowRatingModal(true);
    };

    const handleRatingSubmit = () => {
        if (selectedRating === 0) {
            const message = language === 'fr'
                ? 'Veuillez sélectionner une note avant de continuer.'
                : 'Vui lòng chọn một đánh giá trước khi tiếp tục.';
            Alert.alert(
                language === 'fr' ? 'Attention' : 'Cảnh báo',
                message
            );
            return;
        }

        setShowRatingModal(false);

        if (selectedRating >= 4) {
            // High rating - redirect to store
            const title = language === 'fr' ? 'Merci!' : 'Cảm ơn!';
            const message = language === 'fr'
                ? 'Merci pour votre excellente évaluation! Souhaitez-vous laisser un avis sur le store?'
                : 'Cảm ơn bạn đã đánh giá cao! Bạn có muốn để lại đánh giá trên cửa hàng không?';

            Alert.alert(title, message, [
                {
                    text: language === 'fr' ? 'Plus tard' : 'Để sau',
                    style: 'cancel',
                },
                {
                    text: language === 'fr' ? 'Oui' : 'Có',
                    onPress: () => {
                        // In a real app, this would open the appropriate store
                        const storeMessage = language === 'fr'
                            ? 'Redirection vers le store... (Fonctionnalité à implémenter)'
                            : 'Chuyển hướng đến cửa hàng... (Tính năng cần triển khai)';
                        Alert.alert('Info', storeMessage);
                    },
                },
            ]);
        } else {
            // Lower rating - ask for feedback
            const title = language === 'fr' ? 'Merci pour votre retour' : 'Cảm ơn phản hồi của bạn';
            const message = language === 'fr'
                ? 'Nous sommes désolés que l\'application ne réponde pas entièrement à vos attentes. Votre avis nous aide à l\'améliorer!'
                : 'Chúng tôi xin lỗi vì ứng dụng chưa đáp ứng hoàn toàn mong đợi của bạn. Ý kiến của bạn giúp chúng tôi cải thiện!';

            Alert.alert(title, message);
        }

        setSelectedRating(0);
    };

    const renderStars = () => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <TouchableOpacity
                    key={i}
                    onPress={() => setSelectedRating(i)}
                    style={styles.starButton}
                >
                    <Ionicons
                        name={i <= selectedRating ? 'star' : 'star-outline'}
                        size={40}
                        color={i <= selectedRating ? '#FFD700' : theme.colors.textMuted}
                    />
                </TouchableOpacity>
            );
        }
        return stars;
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

                    {/* Color Theme Selector */}
                    <ColorThemeSelector
                        title="Thème de couleur"
                        title_vi="Chủ đề màu sắc"
                        language={language}
                        value={colorTheme}
                        onValueChange={setColorTheme}
                    />

                    {/* Theme Selector */}
                    <View style={[styles.themeSelector, { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.divider }]}>
                        <View style={styles.themeSelectorLeft}>
                            <View style={[styles.themeIconContainer, { backgroundColor: (themeMode === 'dark' ? '#FFA726' : '#FFB74D') + '15' }]}>
                                <Ionicons name={themeMode === 'dark' ? 'moon' : 'sunny'} size={22} color={themeMode === 'dark' ? '#FFA726' : '#FFB74D'} />
                            </View>
                            <FormattedText style={[styles.themeSelectorTitle, { color: theme.colors.text }]}>
                                {language === 'fr' ? 'Mode d\'affichage' : 'Chế độ hiển thị'}
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
                        title_vi="Kiểu biểu tượng"
                        language={language}
                        value={iconSet}
                        onValueChange={setIconSet}
                    />

                    {/* JSON Category Icon Set Selector */}
                    <JsonIconSelector
                        title="Style des icônes de catégories"
                        title_vi="Kiểu biểu tượng danh mục"
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
                        title_vi="Kích thước chữ"
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
                        title_vi="Phông chữ"
                        language={language}
                        value={settings.fontFamily}
                        onValueChange={updateFontFamily}
                    />

                    <SliderSetting
                        title="Hauteur de ligne"
                        title_vi="Chiều cao dòng"
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
                        title_vi="Khoảng cách chữ"
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
                        title_vi="Đặt lại cài đặt văn bản"
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
                        onPress={rateApp}
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
            </ScrollView>

            {/* Rating Modal */}
            <Modal
                visible={showRatingModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowRatingModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContainer, { backgroundColor: theme.colors.card }]}>
                        <FormattedText style={[styles.modalTitle, { color: theme.colors.text }]}>
                            {language === 'fr' ? 'Évaluez cette application' : 'Đánh giá ứng dụng này'}
                        </FormattedText>

                        <FormattedText style={[styles.modalSubtitle, { color: theme.colors.textMuted }]}>
                            {language === 'fr'
                                ? 'Votre avis nous aide à améliorer l\'application'
                                : 'Ý kiến của bạn giúp chúng tôi cải thiện ứng dụng'
                            }
                        </FormattedText>

                        <View style={styles.starsContainer}>
                            {renderStars()}
                        </View>

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton, { backgroundColor: theme.colors.background }]}
                                onPress={() => {
                                    setShowRatingModal(false);
                                    setSelectedRating(0);
                                }}
                            >
                                <FormattedText style={[styles.cancelButtonText, { color: theme.colors.text }]}>
                                    {language === 'fr' ? 'Annuler' : 'Hủy'}
                                </FormattedText>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.modalButton, styles.submitButton, { backgroundColor: theme.colors.primary }]}
                                onPress={handleRatingSubmit}
                            >
                                <FormattedText style={[styles.submitButtonText, { color: theme.colors.buttonText }]}>
                                    {language === 'fr' ? 'Envoyer' : 'Gửi'}
                                </FormattedText>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
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
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContainer: {
        borderRadius: 20,
        padding: 30,
        alignItems: 'center',
        minWidth: 300,
        maxWidth: 350,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center',
    },
    modalSubtitle: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 30,
        lineHeight: 22,
    },
    starsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 30,
    },
    starButton: {
        padding: 5,
        marginHorizontal: 2,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    modalButton: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 10,
        alignItems: 'center',
        marginHorizontal: 5,
    },
    cancelButton: {
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.1)',
    },
    submitButton: {
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    submitButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
});

export default SettingsScreen;
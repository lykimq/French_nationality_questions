import React from 'react';
import { StyleSheet, View, Alert } from 'react-native';
import { useTextFormatting, getTextStyles } from '../../contexts/TextFormattingContext';
import { useTheme } from '../../contexts/ThemeContext';
import SliderSetting from './SliderSetting';
import FontSelector from './FontSelector';
import { FormattedText } from '../shared';
import SettingItem from './SettingItem';
import { settingsStyles } from './settingsStyles';

interface TextFormattingSettingsProps {
    language: 'fr' | 'vi';
}

const TextFormattingSettings: React.FC<TextFormattingSettingsProps> = ({ language }) => {
    const { theme } = useTheme();
    const {
        settings,
        updateFontSize,
        updateFontFamily,
        updateLineHeight,
        updateLetterSpacing,
        resetToDefaults
    } = useTextFormatting();

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
        <View style={[settingsStyles.section, { backgroundColor: theme.colors.card }]}>
            <FormattedText style={[settingsStyles.sectionTitle, { color: theme.colors.textSecondary, borderBottomColor: theme.colors.divider }]}>
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
                formatValue={(val: number) => `${val}px`}
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
                formatValue={(val: number) => val.toFixed(1)}
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
                formatValue={(val: number) => `${val}px`}
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
    );
};

const styles = StyleSheet.create({
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

export default TextFormattingSettings;
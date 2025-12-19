import React from 'react';
import { StyleSheet, View, Alert } from 'react-native';
import { useTextFormatting, getTextStyles } from '../../shared/contexts/TextFormattingContext';
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

            {/* Text Preview */}
            <View style={[styles.previewContainer, { backgroundColor: theme.colors.background, borderBottomColor: theme.colors.divider }]}>
                <FormattedText style={[styles.previewLabel, { color: theme.colors.textSecondary }]}>
                    Aperçu :
                </FormattedText>

                {/* Question Style Preview */}
                <View style={[styles.questionPreview, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                    <View style={styles.previewQuestionHeader}>
                        <View style={[styles.previewIdContainer, { backgroundColor: theme.colors.primary }]}>
                            <FormattedText style={[styles.previewId, { color: theme.colors.buttonText }]}>42</FormattedText>
                        </View>
                        <FormattedText style={[styles.previewQuestion, { color: theme.colors.text }]}>
                            Quelle est la devise de la République française ?
                        </FormattedText>
                    </View>
                </View>

                {/* General Text Preview */}
                <FormattedText style={[styles.previewText, getTextStyles(settings), {
                    color: theme.colors.text,
                    backgroundColor: theme.colors.card,
                    borderColor: theme.colors.border
                }]}>
                    Ceci est un exemple de texte avec vos paramètres de formatage. Vous pouvez voir comment la taille de police affecte l'apparence du texte dans l'application.
                </FormattedText>
            </View>

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
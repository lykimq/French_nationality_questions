import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../shared/contexts/ThemeContext";
import { useSpeech } from "../../shared/contexts/SpeechContext";
import { FormattedText } from "../../shared/components";
import SettingItem from "./SettingItem";
import { getVoiceGenderLabel } from "../../shared/utils/speechUtils";
import { getCardContainerStyle } from "../../shared/utils";

const AudioSettings: React.FC = () => {
    const { theme } = useTheme();
    const {
        settings,
        availableVoices,
        isVoicesLoading,
        hasFrenchVoices,
        setSelectedVoiceId,
        previewVoice,
    } = useSpeech();

    return (
        <View>
            {isVoicesLoading ? (
                <FormattedText
                    style={[
                        styles.note,
                        { color: theme.colors.textSecondary },
                    ]}
                >
                    Chargement des voix françaises...
                </FormattedText>
            ) : !hasFrenchVoices ? (
                <FormattedText
                    style={[
                        styles.note,
                        { color: theme.colors.textSecondary },
                    ]}
                >
                    Aucune voix française détectée. Sur Android, installez le
                    pack de langue française dans les paramètres système de
                    synthèse vocale.
                </FormattedText>
            ) : (
                <>
                    {availableVoices.map((voice) => {
                        const isSelected =
                            settings.selectedVoiceId === voice.identifier;
                        return (
                            <TouchableOpacity
                                key={voice.identifier}
                                style={[
                                    styles.voiceRow,
                                    getCardContainerStyle(theme),
                                    isSelected && {
                                        borderColor: theme.colors.primary,
                                        borderWidth: 2,
                                    },
                                ]}
                                onPress={() =>
                                    setSelectedVoiceId(voice.identifier)
                                }
                                activeOpacity={0.7}
                            >
                                <View style={styles.voiceText}>
                                    <FormattedText
                                        style={[
                                            styles.voiceName,
                                            { color: theme.colors.text },
                                        ]}
                                    >
                                        {voice.name}
                                    </FormattedText>
                                    <FormattedText
                                        style={[
                                            styles.voiceGender,
                                            {
                                                color: theme.colors
                                                    .textSecondary,
                                            },
                                        ]}
                                    >
                                        {getVoiceGenderLabel(voice.gender)}
                                    </FormattedText>
                                </View>
                                {isSelected && (
                                    <Ionicons
                                        name="checkmark-circle"
                                        size={22}
                                        color={theme.colors.primary}
                                    />
                                )}
                            </TouchableOpacity>
                        );
                    })}

                    {availableVoices.length < 4 && (
                        <FormattedText
                            style={[
                                styles.note,
                                { color: theme.colors.textMuted },
                            ]}
                        >
                            {availableVoices.length} voix disponible
                            {availableVoices.length > 1 ? "s" : ""} sur cet
                            appareil.
                        </FormattedText>
                    )}
                </>
            )}

            <SettingItem
                title="Écouter un exemple"
                icon="volume-high"
                iconColor={theme.colors.primary}
                onPress={() => void previewVoice()}
            />

            <FormattedText
                style={[styles.note, { color: theme.colors.textMuted }]}
            >
                La lecture utilise la synthèse vocale de votre téléphone
                (gratuite, hors ligne). Sur iPhone, désactivez le mode silencieux
                pour entendre le son.
            </FormattedText>
        </View>
    );
};

const styles = StyleSheet.create({
    voiceRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 14,
        marginBottom: 8,
        borderRadius: 12,
    },
    voiceText: {
        flex: 1,
        marginRight: 12,
    },
    voiceName: {
        fontSize: 15,
        fontWeight: "600",
    },
    voiceGender: {
        fontSize: 13,
        marginTop: 2,
    },
    note: {
        fontSize: 13,
        lineHeight: 18,
        marginBottom: 12,
        paddingHorizontal: 4,
    },
});

export default AudioSettings;

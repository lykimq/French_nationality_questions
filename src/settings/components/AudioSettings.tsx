import React from "react";
import { View, TouchableOpacity, StyleSheet, Switch } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../shared/contexts/ThemeContext";
import { useSpeech } from "../../shared/contexts/SpeechContext";
import { FormattedText } from "../../shared/components";
import SettingItem from "./SettingItem";
import { getVoiceGenderLabel } from "../../shared/utils/speechUtils";
import { getCardContainerStyle } from "../../shared/utils";
import type { SpeechEngine } from "../../types";

const AudioSettings: React.FC = () => {
    const { theme } = useTheme();
    const {
        settings,
        availableVoices,
        isVoicesLoading,
        hasFrenchVoices,
        isCloudSpeechEnabled,
        setSpeechEngine,
        setSelectedVoiceId,
        previewVoice,
    } = useSpeech();

    const useCloudEngine = settings.speechEngine === "cloud";

    const handleEngineToggle = (enabled: boolean) => {
        const engine: SpeechEngine = enabled ? "cloud" : "device";
        setSpeechEngine(engine);
    };

    return (
        <View>
            {isCloudSpeechEnabled && (
                <View
                    style={[
                        styles.engineRow,
                        getCardContainerStyle(theme),
                    ]}
                >
                    <View style={styles.engineText}>
                        <FormattedText
                            style={[
                                styles.engineTitle,
                                { color: theme.colors.text },
                            ]}
                        >
                            Voix naturelle (Google Cloud)
                        </FormattedText>
                        <FormattedText
                            style={[
                                styles.engineSubtitle,
                                { color: theme.colors.textSecondary },
                            ]}
                        >
                            Qualité plus naturelle via Internet. En cas
                            d&apos;erreur ou de limite, la voix du téléphone
                            est utilisée pour cette lecture.
                        </FormattedText>
                    </View>
                    <Switch
                        value={useCloudEngine}
                        onValueChange={handleEngineToggle}
                        trackColor={{
                            false: theme.colors.switchTrack,
                            true: theme.colors.primary,
                        }}
                        thumbColor={theme.colors.switchThumb}
                    />
                </View>
            )}

            {isVoicesLoading ? (
                <FormattedText
                    style={[
                        styles.note,
                        { color: theme.colors.textSecondary },
                    ]}
                >
                    Chargement des voix...
                </FormattedText>
            ) : !hasFrenchVoices ? (
                <FormattedText
                    style={[
                        styles.note,
                        { color: theme.colors.textSecondary },
                    ]}
                >
                    {useCloudEngine
                        ? "La synthèse cloud n'est pas disponible. Vérifiez la configuration Firebase et le déploiement de la fonction."
                        : "Aucune voix française détectée sur cet appareil. Installez le pack français dans les paramètres système de synthèse vocale."}
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
                </>
            )}

            <SettingItem
                title="Écouter un exemple"
                icon="volume-high"
                iconColor={theme.colors.primary}
                onPress={() => previewVoice()}
            />

            <FormattedText
                style={[styles.note, { color: theme.colors.textMuted }]}
            >
                {useCloudEngine
                    ? "La voix cloud utilise Google Text-to-Speech (quota gratuit limité). L'audio est mis en cache sur l'appareil. Sur iPhone, désactivez le mode silencieux."
                    : "La lecture utilise la synthèse vocale du téléphone (gratuite, hors ligne). Sur iPhone, désactivez le mode silencieux."}
            </FormattedText>
        </View>
    );
};

const styles = StyleSheet.create({
    engineRow: {
        flexDirection: "row",
        alignItems: "center",
        padding: 14,
        marginBottom: 12,
        borderRadius: 12,
        gap: 12,
    },
    engineText: {
        flex: 1,
    },
    engineTitle: {
        fontSize: 15,
        fontWeight: "600",
    },
    engineSubtitle: {
        fontSize: 13,
        lineHeight: 18,
        marginTop: 4,
    },
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

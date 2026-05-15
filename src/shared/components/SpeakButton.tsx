import React, { useCallback, useMemo } from "react";
import {
    TouchableOpacity,
    StyleSheet,
    type StyleProp,
    type ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";
import { useSpeech } from "../contexts/SpeechContext";
import { prepareTextForSpeech } from "../utils/speechUtils";

interface SpeakButtonProps {
    text: string;
    accessibilityLabel?: string;
    size?: number;
    style?: StyleProp<ViewStyle>;
}

const SpeakButton: React.FC<SpeakButtonProps> = ({
    text,
    accessibilityLabel = "Écouter le texte",
    size = 22,
    style,
}) => {
    const { theme } = useTheme();
    const { speak, isSpeaking, speakingText } = useSpeech();

    const preparedText = useMemo(() => prepareTextForSpeech(text), [text]);

    const isActive = useMemo(
        () =>
            Boolean(
                preparedText &&
                    isSpeaking &&
                    speakingText === preparedText
            ),
        [isSpeaking, speakingText, preparedText]
    );

    const handlePress = useCallback(() => {
        if (!preparedText) return;
        speak(preparedText);
    }, [preparedText, speak]);

    const disabled = !preparedText;

    return (
        <TouchableOpacity
            style={[styles.button, style]}
            onPress={handlePress}
            disabled={disabled}
            accessibilityRole="button"
            accessibilityLabel={
                isActive ? "Arrêter la lecture" : accessibilityLabel
            }
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
            <Ionicons
                name={isActive ? "stop-circle" : "volume-high"}
                size={size}
                color={
                    disabled
                        ? theme.colors.textMuted
                        : isActive
                          ? theme.colors.accent
                          : theme.colors.primary
                }
            />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        padding: 4,
        justifyContent: "center",
        alignItems: "center",
    },
});

export default SpeakButton;

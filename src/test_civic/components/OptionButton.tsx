import React from "react";
import { StyleSheet, View, TouchableOpacity } from "react-native";
import { FormattedText, Icon3D } from "../../shared/components";
import { useTheme } from "../../shared/contexts/ThemeContext";

interface OptionButtonProps {
    index: number;
    option: string;
    isSelected: boolean;
    isCorrect: boolean;
    showResult: boolean;
    onPress: (index: number) => void;
}

const OPTION_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export const OptionButton: React.FC<OptionButtonProps> = ({
    index,
    option,
    isSelected,
    isCorrect,
    showResult,
    onPress,
}) => {
    const { theme } = useTheme();
    const letter = OPTION_LETTERS[index] ?? String(index + 1);
    const isWrong = showResult && isSelected && !isCorrect;
    const highlightCorrect = showResult && isCorrect;

    const getBackgroundColor = () => {
        if (isSelected) {
            if (highlightCorrect) return theme.colors.success + "20";
            if (isWrong) return theme.colors.error + "20";
            return theme.colors.primary + "20";
        }
        if (highlightCorrect) return theme.colors.success + "20";
        return theme.colors.surface;
    };

    const getBorderColor = () => {
        if (isSelected) {
            if (highlightCorrect) return theme.colors.success;
            if (isWrong) return theme.colors.error;
            return theme.colors.primary;
        }
        if (highlightCorrect) return theme.colors.success;
        return theme.colors.border;
    };

    const letterFill = () => {
        if (showResult && highlightCorrect) {
            return { bg: theme.colors.success, fg: theme.colors.buttonText };
        }
        if (showResult && isWrong) {
            return { bg: theme.colors.error, fg: theme.colors.buttonText };
        }
        if (isSelected) {
            return { bg: theme.colors.primary, fg: theme.colors.buttonText };
        }
        return { bg: theme.colors.surface, fg: theme.colors.text };
    };

    const { bg: letterBg, fg: letterFg } = letterFill();

    return (
        <TouchableOpacity
            style={[
                styles.optionButton,
                {
                    backgroundColor: getBackgroundColor(),
                    borderColor: getBorderColor(),
                    borderWidth: showResult && (isCorrect || isWrong) ? 2 : 1,
                },
            ]}
            onPress={() => !showResult && onPress(index)}
            disabled={showResult}
            activeOpacity={0.7}
            accessibilityRole="radio"
            accessibilityState={{ checked: isSelected, disabled: showResult }}
            accessibilityLabel={`Réponse ${letter}. ${option}`}
        >
            <View style={styles.optionContent}>
                <View
                    style={[
                        styles.letterBadge,
                        {
                            borderColor: getBorderColor(),
                            backgroundColor: letterBg,
                        },
                    ]}
                >
                    <FormattedText
                        style={[styles.letterBadgeText, { color: letterFg }]}
                    >
                        {letter}
                    </FormattedText>
                </View>
                <FormattedText
                    style={[styles.optionText, { color: theme.colors.text }]}
                >
                    {option}
                </FormattedText>
                {showResult && isCorrect && (
                    <Icon3D
                        name="checkmark-circle"
                        size={20}
                        color={theme.colors.success}
                        variant="elevated"
                    />
                )}
                {showResult && isWrong && (
                    <Icon3D
                        name="close-circle"
                        size={20}
                        color={theme.colors.error}
                        variant="elevated"
                    />
                )}
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    optionButton: {
        borderRadius: 12,
        padding: 14,
        marginBottom: 10,
        borderWidth: 2,
    },
    optionContent: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    letterBadge: {
        width: 32,
        height: 32,
        borderRadius: 8,
        borderWidth: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    letterBadgeText: {
        fontSize: 15,
        fontWeight: "800",
    },
    optionText: {
        flex: 1,
        fontSize: 15,
        lineHeight: 22,
    },
});

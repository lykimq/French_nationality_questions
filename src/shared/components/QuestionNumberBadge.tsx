import React, { useMemo } from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import FormattedText from "./FormattedText";
import { useTheme } from "../contexts/ThemeContext";

export type QuestionNumberBadgeVariant = "list" | "modal";

export interface QuestionNumberBadgeProps {
    value: number | string;
    variant?: QuestionNumberBadgeVariant;
    selected?: boolean;
    style?: ViewStyle;
}

const QuestionNumberBadge: React.FC<QuestionNumberBadgeProps> = ({
    value,
    variant = "list",
    selected = false,
    style,
}) => {
    const { theme } = useTheme();
    const displayValue = String(value);
    const isThreeDigits = displayValue.length >= 3;
    const isModal = variant === "modal";

    const containerStyle = useMemo(() => {
        if (isModal) {
            return {
                backgroundColor: selected
                    ? theme.colors.primary
                    : theme.colors.divider,
                minWidth: 36,
                height: 36,
                paddingHorizontal: 8,
                borderRadius: 18,
            };
        }
        return {
            backgroundColor: theme.colors.primary + "10",
            minWidth: 28,
            height: 28,
            paddingHorizontal: 6,
            borderRadius: 14,
        };
    }, [isModal, selected, theme.colors.divider, theme.colors.primary]);

    const textStyle = useMemo(() => {
        if (isModal) {
            return {
                color: selected
                    ? theme.colors.buttonText
                    : theme.colors.text,
                fontSize: isThreeDigits ? 11 : 14,
                fontWeight: "600" as const,
            };
        }
        return {
            color: theme.colors.primary,
            fontSize: isThreeDigits ? 10 : 12,
            fontWeight: "bold" as const,
        };
    }, [
        isModal,
        isThreeDigits,
        selected,
        theme.colors.buttonText,
        theme.colors.primary,
        theme.colors.text,
    ]);

    return (
        <View style={[styles.badge, containerStyle, style]}>
            <FormattedText style={textStyle}>{displayValue}</FormattedText>
        </View>
    );
};

const styles = StyleSheet.create({
    badge: {
        justifyContent: "center",
        alignItems: "center",
    },
});

export default QuestionNumberBadge;

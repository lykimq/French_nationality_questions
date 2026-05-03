import React from "react";
import { Text, StyleSheet } from "react-native";
import {
    useTextFormatting,
    getTextStyles,
} from "../contexts/TextFormattingContext";
import { FormattedTextProps } from "../../types";

const defaultTextFormattingSettings = { fontSize: 16 };

/**
 * Strips fontSize from a style object to allow user formatting settings to take precedence.
 */
const stripFontSize = (styleObj: unknown): Record<string, unknown> | null => {
    if (!styleObj || typeof styleObj !== "object") return null;

    const flattened = StyleSheet.flatten(
        styleObj as Parameters<typeof StyleSheet.flatten>[0]
    );
    if (!flattened || typeof flattened !== "object") return null;

    const { fontSize, ...rest } = flattened as Record<string, unknown>;
    return rest;
};

const FormattedText: React.FC<FormattedTextProps> = ({
    children,
    style,
    ...otherProps
}) => {
    let settings;
    try {
        const context = useTextFormatting();
        settings = context.settings;
    } catch {
        settings = defaultTextFormattingSettings;
    }
    const formattedStyles = getTextStyles(settings);

    // Process styles to remove fontSize, allowing user settings to control font size
    const processedStyle = React.useMemo(() => {
        if (!style) return formattedStyles;

        const stripped = Array.isArray(style)
            ? style.map(stripFontSize).filter(Boolean)
            : stripFontSize(style);

        // Merge: component styles first, then user formatting settings (which override)
        return [stripped, formattedStyles].filter(Boolean);
    }, [style, formattedStyles]);

    return (
        <Text style={processedStyle} {...otherProps}>
            {children}
        </Text>
    );
};

export default FormattedText;

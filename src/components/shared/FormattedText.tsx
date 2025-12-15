import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { useTextFormatting, getTextStyles } from '../../contexts/TextFormattingContext';
import { FormattedTextProps } from '../../types';

const FormattedText: React.FC<FormattedTextProps> = ({
    children,
    style,
    ...otherProps
}) => {
    const { settings } = useTextFormatting();
    const formattedStyles = getTextStyles(settings);

    // Create a function to strip font-related properties from styles
    const stripFontProperties = (styleObj: any): any => {
        if (!styleObj || typeof styleObj !== 'object') return styleObj;

        // Handle StyleSheet objects by flattening them first
        const flattened = StyleSheet.flatten(styleObj);
        if (!flattened) return null;

        const { fontSize, lineHeight, letterSpacing, fontFamily, ...otherProps } = flattened;
        return otherProps;
    };

    // Process the style prop to remove font-related properties
    const processedStyle = React.useMemo(() => {
        if (!style) return null;

        if (Array.isArray(style)) {
            return style.map(stripFontProperties).filter(Boolean);
        } else {
            return stripFontProperties(style);
        }
    }, [style]);

    // Merge styles with user formatting settings taking precedence
    const finalStyles = [
        processedStyle, // Component styles without font properties
        formattedStyles, // User formatting settings (always take precedence)
    ].filter(Boolean);

    return (
        <Text
            style={finalStyles}
            {...otherProps}
        >
            {children}
        </Text>
    );
};

export default FormattedText;
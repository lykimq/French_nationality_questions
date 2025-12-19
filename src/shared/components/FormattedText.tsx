import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { useTextFormatting, getTextStyles } from '../contexts/TextFormattingContext';
import { FormattedTextProps } from '../../types';

const FormattedText: React.FC<FormattedTextProps> = ({
    children,
    style,
    ...otherProps
}) => {
    const { settings } = useTextFormatting();
    const formattedStyles = getTextStyles(settings);

    // Create a function to strip fontSize from styles
    const stripFontSize = (styleObj: any): any => {
        if (!styleObj || typeof styleObj !== 'object') return styleObj;

        // Handle StyleSheet objects by flattening them first
        const flattened = StyleSheet.flatten(styleObj);
        if (!flattened) return null;

        const { fontSize, ...otherProps } = flattened;
        return otherProps;
    };

    // Process the style prop to remove fontSize
    const processedStyle = React.useMemo(() => {
        if (!style) return null;

        if (Array.isArray(style)) {
            return style.map(stripFontSize).filter(Boolean);
        } else {
            return stripFontSize(style);
        }
    }, [style]);

    // Merge styles with user formatting settings taking precedence
    const finalStyles = [
        processedStyle, // Component styles without fontSize
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
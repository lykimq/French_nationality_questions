import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { FormattedText, Icon3D } from '../../shared/components';
import { useTheme } from '../../shared/contexts/ThemeContext';
import { useIcon3D } from '../../shared/hooks';

interface OptionButtonProps {
    index: number;
    option: string;
    isSelected: boolean;
    isCorrect: boolean;
    showResult: boolean;
    onPress: (index: number) => void;
}

export const OptionButton: React.FC<OptionButtonProps> = ({
    index,
    option,
    isSelected,
    isCorrect,
    showResult,
    onPress
}) => {
    const { theme } = useTheme();
    const { getIcon } = useIcon3D();
    
    const checkmarkIcon = getIcon('checkmarkCircle');

    const isWrong = showResult && isSelected && !isCorrect;
    const highlightCorrect = showResult && isCorrect;

    const getBackgroundColor = () => {
        if (isSelected) {
            if (highlightCorrect) return '#4CAF50' + '20';
            if (isWrong) return '#F44336' + '20';
            return theme.colors.primary + '20';
        }
        if (highlightCorrect) return '#4CAF50' + '20';
        return theme.colors.surface;
    };

    const getBorderColor = () => {
        if (isSelected) {
            if (highlightCorrect) return '#4CAF50';
            if (isWrong) return '#F44336';
            return theme.colors.primary;
        }
        if (highlightCorrect) return '#4CAF50';
        return theme.colors.border;
    };

    const getRadioColor = () => {
        if (isSelected || highlightCorrect) {
            if (highlightCorrect) return '#4CAF50';
            if (isWrong) return '#F44336';
            return theme.colors.primary;
        }
        return theme.colors.border;
    };

    return (
        <TouchableOpacity
            style={[
                styles.optionButton,
                {
                    backgroundColor: getBackgroundColor(),
                    borderColor: getBorderColor(),
                    borderWidth: (showResult && (isCorrect || isWrong)) ? 2 : 1,
                }
            ]}
            onPress={() => !showResult && onPress(index)}
            disabled={showResult}
            activeOpacity={0.7}
        >
            <View style={styles.optionContent}>
                <View style={[
                    styles.optionRadio,
                    {
                        borderColor: getRadioColor(),
                        backgroundColor: (isSelected || highlightCorrect) ? getRadioColor() : 'transparent',
                    }
                ]}>
                    {(isSelected || highlightCorrect) && (
                        <View style={[styles.optionRadioInner, { backgroundColor: '#FFFFFF' }]} />
                    )}
                </View>
                <FormattedText style={[styles.optionText, { color: theme.colors.text }]}>
                    {option}
                </FormattedText>
                {showResult && isCorrect && (
                    <Icon3D
                        name="checkmark-circle"
                        size={20}
                        color="#4CAF50"
                        variant="elevated"
                    />
                )}
                {showResult && isWrong && (
                    <Icon3D
                        name="close-circle"
                        size={20}
                        color="#F44336"
                        variant="elevated"
                    />
                )}
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    optionButton: {
        borderRadius: 8,
        padding: 16,
        marginBottom: 12,
        borderWidth: 2,
    },
    optionContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    optionRadio: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    optionRadioInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    optionText: {
        flex: 1,
        fontSize: 15,
        lineHeight: 22,
    },
});

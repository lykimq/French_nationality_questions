import React, { useRef, useState } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    PanResponder,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import FormattedText from './FormattedText';
import { useTheme } from '../contexts/ThemeContext';
import { ExtendedSettingsComponent } from '../types';

interface SliderSettingAdditionalProps {
    minimumValue: number;
    maximumValue: number;
    step?: number;
    formatValue?: (value: number) => string;
}

const SliderSetting: React.FC<ExtendedSettingsComponent<number, SliderSettingAdditionalProps>> = ({
    title,
    title_vi,
    language,
    value,
    minimumValue,
    maximumValue,
    step = 1,
    onValueChange,
    formatValue = (val) => val.toString(),
}) => {
    const trackRef = useRef<View>(null);
    const [isPressed, setIsPressed] = useState(false);
    const { theme } = useTheme();

    const decrease = () => {
        const newValue = Math.max(minimumValue, value - step);
        onValueChange(newValue);
    };

    const increase = () => {
        const newValue = Math.min(maximumValue, value + step);
        onValueChange(newValue);
    };

    const calculateValueFromPosition = (x: number, trackWidth: number) => {
        const percentage = Math.max(0, Math.min(1, x / trackWidth));
        const rawValue = minimumValue + percentage * (maximumValue - minimumValue);

        // Snap to step increments
        const steppedValue = Math.round(rawValue / step) * step;

        // Ensure value is within bounds
        return Math.max(minimumValue, Math.min(maximumValue, steppedValue));
    };

    const handleTrackPress = (event: any) => {
        if (trackRef.current) {
            trackRef.current.measure((x, y, width, height, pageX, pageY) => {
                const touchX = event.nativeEvent.pageX - pageX;
                const newValue = calculateValueFromPosition(touchX, width);
                onValueChange(newValue);
            });
        }
    };

    const panResponder = PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (event) => {
            setIsPressed(true);
            handleTrackPress(event);
        },
        onPanResponderMove: (event) => {
            if (trackRef.current) {
                trackRef.current.measure((x, y, width, height, pageX, pageY) => {
                    const touchX = event.nativeEvent.pageX - pageX;
                    const newValue = calculateValueFromPosition(touchX, width);
                    onValueChange(newValue);
                });
            }
        },
        onPanResponderRelease: () => {
            setIsPressed(false);
        },
    });

    const progressPercentage = ((value - minimumValue) / (maximumValue - minimumValue)) * 100;

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.divider }]}>
            <View style={styles.headerRow}>
                <FormattedText style={[styles.title, { color: theme.colors.text }]}>
                    {language === 'fr' ? title : (title_vi || title)}
                </FormattedText>
                <FormattedText style={[styles.valueText, { color: theme.colors.primary }]}>
                    {formatValue(value)}
                </FormattedText>
            </View>

            <View style={styles.controlsRow}>
                <TouchableOpacity
                    style={[
                        styles.button,
                        { backgroundColor: theme.colors.border },
                        value <= minimumValue && [styles.buttonDisabled, { backgroundColor: theme.colors.divider }]
                    ]}
                    onPress={decrease}
                    disabled={value <= minimumValue}
                >
                    <Ionicons
                        name="remove"
                        size={20}
                        color={value <= minimumValue ? theme.colors.textMuted : theme.colors.primary}
                    />
                </TouchableOpacity>

                <View style={styles.trackContainer}>
                    <View
                        ref={trackRef}
                        style={[
                            styles.track,
                            { backgroundColor: theme.colors.border },
                            isPressed && [styles.trackPressed, { backgroundColor: theme.colors.textMuted }]
                        ]}
                        {...panResponder.panHandlers}
                    >
                        <View
                            style={[
                                styles.trackFill,
                                {
                                    width: `${progressPercentage}%`,
                                    backgroundColor: theme.colors.primary
                                },
                                isPressed && [styles.trackFillPressed, { backgroundColor: theme.colors.primaryLight }]
                            ]}
                        />
                        <View
                            style={[
                                styles.thumb,
                                {
                                    left: `${Math.max(0, progressPercentage - 2)}%`,
                                    backgroundColor: theme.colors.primary,
                                    borderColor: theme.colors.card
                                },
                                isPressed && [styles.thumbPressed, { backgroundColor: theme.colors.primaryLight }]
                            ]}
                        />
                    </View>
                </View>

                <TouchableOpacity
                    style={[
                        styles.button,
                        { backgroundColor: theme.colors.border },
                        value >= maximumValue && [styles.buttonDisabled, { backgroundColor: theme.colors.divider }]
                    ]}
                    onPress={increase}
                    disabled={value >= maximumValue}
                >
                    <Ionicons
                        name="add"
                        size={20}
                        color={value >= maximumValue ? theme.colors.textMuted : theme.colors.primary}
                    />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingVertical: 15,
        paddingHorizontal: 15,
        borderBottomWidth: 1,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    title: {
        fontSize: 16,
        fontWeight: '500',
    },
    valueText: {
        fontSize: 16,
        fontWeight: '600',
    },
    controlsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    button: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonDisabled: {
        // backgroundColor will be set dynamically
    },
    trackContainer: {
        flex: 1,
        marginHorizontal: 15,
        paddingVertical: 10,
    },
    track: {
        height: 6,
        borderRadius: 3,
        position: 'relative',
    },
    trackFill: {
        height: 6,
        borderRadius: 3,
        position: 'absolute',
    },
    trackPressed: {
        // backgroundColor will be set dynamically
    },
    trackFillPressed: {
        // backgroundColor will be set dynamically
    },
    thumb: {
        width: 20,
        height: 20,
        borderRadius: 10,
        position: 'absolute',
        top: -7,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        borderWidth: 2,
    },
    thumbPressed: {
        transform: [{ scale: 1.1 }],
    },
});

export default SliderSetting;
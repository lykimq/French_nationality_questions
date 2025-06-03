import React, { useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    PanResponder,
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import FormattedText from './FormattedText';

interface SliderSettingProps {
    title: string;
    titleVi?: string;
    language: 'fr' | 'vi';
    value: number;
    minimumValue: number;
    maximumValue: number;
    step?: number;
    onValueChange: (value: number) => void;
    formatValue?: (value: number) => string;
}

const SliderSetting: React.FC<SliderSettingProps> = ({
    title,
    titleVi,
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
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <FormattedText style={styles.title}>
                    {language === 'fr' ? title : (titleVi || title)}
                </FormattedText>
                <FormattedText style={styles.valueText}>
                    {formatValue(value)}
                </FormattedText>
            </View>

            <View style={styles.controlsRow}>
                <TouchableOpacity
                    style={[styles.button, value <= minimumValue && styles.buttonDisabled]}
                    onPress={decrease}
                    disabled={value <= minimumValue}
                >
                    <Ionicons
                        name="remove"
                        size={20}
                        color={value <= minimumValue ? '#ccc' : '#3F51B5'}
                    />
                </TouchableOpacity>

                <View style={styles.trackContainer}>
                    <View
                        ref={trackRef}
                        style={[styles.track, isPressed && styles.trackPressed]}
                        {...panResponder.panHandlers}
                    >
                        <View
                            style={[
                                styles.trackFill,
                                { width: `${progressPercentage}%` },
                                isPressed && styles.trackFillPressed
                            ]}
                        />
                        <View
                            style={[
                                styles.thumb,
                                { left: `${Math.max(0, progressPercentage - 2)}%` },
                                isPressed && styles.thumbPressed
                            ]}
                        />
                    </View>
                </View>

                <TouchableOpacity
                    style={[styles.button, value >= maximumValue && styles.buttonDisabled]}
                    onPress={increase}
                    disabled={value >= maximumValue}
                >
                    <Ionicons
                        name="add"
                        size={20}
                        color={value >= maximumValue ? '#ccc' : '#3F51B5'}
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
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    title: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
    valueText: {
        fontSize: 16,
        color: '#3F51B5',
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
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonDisabled: {
        backgroundColor: '#f8f8f8',
    },
    trackContainer: {
        flex: 1,
        marginHorizontal: 15,
        paddingVertical: 10,
    },
    track: {
        height: 6,
        backgroundColor: '#E0E0E0',
        borderRadius: 3,
        position: 'relative',
    },
    trackFill: {
        height: 6,
        backgroundColor: '#3F51B5',
        borderRadius: 3,
        position: 'absolute',
    },
    trackPressed: {
        backgroundColor: '#D0D0D0',
    },
    trackFillPressed: {
        backgroundColor: '#5C6BC0',
    },
    thumb: {
        width: 20,
        height: 20,
        backgroundColor: '#3F51B5',
        borderRadius: 10,
        position: 'absolute',
        top: -7,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        borderWidth: 2,
        borderColor: '#fff',
    },
    thumbPressed: {
        backgroundColor: '#5C6BC0',
        transform: [{ scale: 1.1 }],
    },
});

export default SliderSetting;
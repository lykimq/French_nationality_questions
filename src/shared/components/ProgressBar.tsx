import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ViewStyle } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface ProgressBarProps {
    progress: number; // 0 to 1
    height?: number;
    color?: string;
    backgroundColor?: string;
    containerStyle?: ViewStyle;
    showGradient?: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
    progress,
    height = 6,
    color,
    backgroundColor,
    containerStyle,
}) => {
    const { theme } = useTheme();
    const animatedWidth = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.spring(animatedWidth, {
            toValue: Math.max(0, Math.min(1, progress)),
            useNativeDriver: false,
            friction: 8,
            tension: 40,
        }).start();
    }, [progress, animatedWidth]);

    const barColor = color || theme.colors.primary;
    const bgColor = backgroundColor || theme.colors.divider;

    return (
        <View 
            style={[
                styles.container, 
                { height, backgroundColor: bgColor, borderRadius: height / 2 }, 
                containerStyle
            ]}
        >
            <Animated.View 
                style={[
                    styles.fill, 
                    { 
                        height, 
                        backgroundColor: barColor, 
                        borderRadius: height / 2,
                        width: animatedWidth.interpolate({
                            inputRange: [0, 1],
                            outputRange: ['0%', '100%'],
                        }),
                    }
                ]} 
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        overflow: 'hidden',
    },
    fill: {
        width: '0%',
    },
});

export default ProgressBar;

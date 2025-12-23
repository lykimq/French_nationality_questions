import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export type Icon3DVariant = 'default' | 'gradient' | 'elevated' | 'neon' | 'glass';

export interface Icon3DProps {
    name: string;
    size?: number;
    color?: string;
    variant?: Icon3DVariant;
    containerStyle?: ViewStyle;
    backgroundColor?: string;
}

const Icon3D: React.FC<Icon3DProps> = ({
    name,
    size = 24,
    color = '#007AFF',
    variant = 'default',
    containerStyle,
    backgroundColor,
}) => {
    const renderIcon = () => {
        const isSmall = size < 20;
        const containerScale = isSmall ? 1.6 : 1.8;
        const iconElement = (
            <Ionicons 
                name={name as any} 
                size={size} 
                color={variant === 'glass' ? color + 'DD' : color} 
            />
        );

        switch (variant) {
            case 'gradient':
                return (
                    <View style={[styles.iconContainer, containerStyle]}>
                        <LinearGradient
                            colors={[
                                color,
                                adjustColorBrightness(color, -30),
                                adjustColorBrightness(color, -50),
                            ]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={[
                                styles.gradientContainer,
                                {
                                    width: size * containerScale,
                                    height: size * containerScale,
                                    borderRadius: size * (containerScale / 2),
                                },
                            ]}
                        >
                            <View style={styles.gradientInner}>
                                {iconElement}
                            </View>
                            <View 
                                style={[
                                    styles.gradientHighlight,
                                    {
                                        width: size * 0.6,
                                        height: size * 0.6,
                                        borderRadius: size * 0.3,
                                    },
                                ]} 
                            />
                        </LinearGradient>
                    </View>
                );

            case 'elevated':
                return (
                    <View style={[styles.iconContainer, containerStyle]}>
                        <View
                            style={[
                                styles.elevatedShadow,
                                {
                                    width: size * containerScale,
                                    height: size * containerScale,
                                    borderRadius: size * (containerScale / 2),
                                    backgroundColor: adjustColorBrightness(color, -80),
                                },
                            ]}
                        />
                        <View
                            style={[
                                styles.elevatedContainer,
                                {
                                    width: size * containerScale,
                                    height: size * containerScale,
                                    borderRadius: size * (containerScale / 2),
                                    backgroundColor: backgroundColor || color + '20',
                                    borderColor: color + '40',
                                },
                            ]}
                        >
                            {iconElement}
                            <View 
                                style={[
                                    styles.elevatedHighlight,
                                    {
                                        width: size * 0.8,
                                        height: size * 0.4,
                                        borderRadius: size * 0.4,
                                    },
                                ]} 
                            />
                        </View>
                    </View>
                );

            case 'neon':
                return (
                    <View style={[styles.iconContainer, containerStyle]}>
                        <View
                            style={[
                                styles.neonGlow,
                                {
                                    width: size * (containerScale + 0.2),
                                    height: size * (containerScale + 0.2),
                                    borderRadius: size * (containerScale + 0.2) / 2,
                                    backgroundColor: color + '20',
                                    shadowColor: color,
                                },
                            ]}
                        />
                        <View
                            style={[
                                styles.neonContainer,
                                {
                                    width: size * containerScale,
                                    height: size * containerScale,
                                    borderRadius: size * (containerScale / 2),
                                    backgroundColor: backgroundColor || '#000000',
                                    borderColor: color,
                                },
                            ]}
                        >
                            {iconElement}
                        </View>
                    </View>
                );

            case 'glass':
                return (
                    <View style={[styles.iconContainer, containerStyle]}>
                        <View
                            style={[
                                styles.glassContainer,
                                {
                                    width: size * containerScale,
                                    height: size * containerScale,
                                    borderRadius: size * (containerScale / 2),
                                    backgroundColor: backgroundColor || color + '15',
                                    borderColor: color + '30',
                                },
                            ]}
                        >
                            <View 
                                style={[
                                    styles.glassHighlight,
                                    {
                                        width: size * 1.5,
                                        height: size * 0.8,
                                        borderRadius: size * 0.4,
                                    },
                                ]} 
                            />
                            {iconElement}
                            <View style={styles.glassReflection} />
                        </View>
                    </View>
                );

            default:
                return (
                    <View style={[styles.iconContainer, containerStyle]}>
                        {iconElement}
                    </View>
                );
        }
    };

    return renderIcon();
};

const adjustColorBrightness = (color: string, percent: number): string => {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.max(0, Math.min(255, (num >> 16) + amt));
    const G = Math.max(0, Math.min(255, (num >> 8 & 0x00FF) + amt));
    const B = Math.max(0, Math.min(255, (num & 0x0000FF) + amt));
    return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
};

const styles = StyleSheet.create({
    iconContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    defaultContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    gradientContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 8,
    },
    gradientInner: {
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2,
    },
    gradientHighlight: {
        position: 'absolute',
        top: '15%',
        left: '15%',
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        zIndex: 1,
    },
    elevatedContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 10,
    },
    elevatedShadow: {
        position: 'absolute',
        bottom: -6,
        opacity: 0.2,
    },
    elevatedHighlight: {
        position: 'absolute',
        top: '20%',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    neonContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 15,
        elevation: 12,
    },
    neonGlow: {
        position: 'absolute',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 20,
        elevation: 0,
    },
    glassContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 6,
        overflow: 'hidden',
    },
    glassHighlight: {
        position: 'absolute',
        top: '10%',
        backgroundColor: 'rgba(255, 255, 255, 0.4)',
    },
    glassReflection: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '40%',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
});

export default Icon3D;


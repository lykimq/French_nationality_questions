import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import FormattedText from './FormattedText';

interface StreakBadgeProps {
    streak: number;
}

const StreakBadge: React.FC<StreakBadgeProps> = ({ streak }) => {
    const { theme } = useTheme();
    const scaleAnim = React.useRef(new Animated.Value(1)).current;

    React.useEffect(() => {
        if (streak > 0) {
            Animated.sequence([
                Animated.timing(scaleAnim, {
                    toValue: 1.2,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    friction: 4,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [streak]);

    if (streak === 0) return null;

    return (
        <Animated.View style={[
            styles.container, 
            { 
                backgroundColor: theme.colors.primary + '15',
                borderColor: theme.colors.primary + '30',
                transform: [{ scale: scaleAnim }]
            }
        ]}>
            <Ionicons name="flame" size={20} color="#FF9800" />
            <FormattedText style={[styles.text, { color: theme.colors.text }]}>
                {streak}
            </FormattedText>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        gap: 4,
    },
    text: {
        fontSize: 14,
        fontWeight: 'bold',
    },
});

export default StreakBadge;

import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../shared/contexts/ThemeContext';
import { useIcons } from '../shared/contexts/IconContext';
import { FormattedText } from '../shared/components';
import { CategoryCardProps } from '../types';
import { sharedStyles } from '../shared/utils';

const CategoryCard: React.FC<CategoryCardProps> = ({
    title,
    description,
    icon,
    count,
    onPress,
}) => {
    const { theme } = useTheme();
    const { getJsonIconName, getJsonIconColor, getIconName } = useIcons();

    // Get the mapped icon name and vibrant color based on the current JSON icon set
    const mappedIconName = getJsonIconName(icon || 'default');
    const iconColor = getJsonIconColor(icon || 'default');

    return (
        <Pressable
            style={({ pressed }) => [
                styles.card,
                sharedStyles.mediumShadow,
                {
                    backgroundColor: theme.colors.card,
                    borderColor: iconColor + '20',
                    borderWidth: 1,
                },
                pressed && [styles.cardPressed, { backgroundColor: iconColor + '10' }]
            ]}
            onPress={onPress}
            android_ripple={{ color: iconColor + '20' }}
        >
            <View style={[sharedStyles.largeIconContainer, { backgroundColor: iconColor + '15' }]}>
                <Ionicons
                    name={mappedIconName as keyof typeof Ionicons.glyphMap}
                    size={32}
                    color={iconColor}
                />
            </View>
            <View style={styles.content}>
                <FormattedText style={[styles.title, { color: theme.colors.text }]}>{title}</FormattedText>
                <FormattedText style={[styles.description, { color: theme.colors.textSecondary }]} numberOfLines={2}>
                    {description}
                </FormattedText>
                <View style={[styles.countContainer, { backgroundColor: iconColor + '15' }]}>
                    <FormattedText style={[styles.count, { color: iconColor }]}>{count} questions</FormattedText>
                </View>
            </View>
            <Ionicons name={getIconName('chevronForward') as keyof typeof Ionicons.glyphMap} size={24} color={iconColor} style={styles.arrowIcon} />
        </Pressable>
    );
};

export default CategoryCard;

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        borderRadius: 12,
        padding: 16,
        marginBottom: 15,
        alignItems: 'center',
    },
    cardPressed: {
        // backgroundColor will be set dynamically
    },
    content: {
        flex: 1,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    titleTranslation: {
        fontSize: 14,
        fontStyle: 'italic',
        marginBottom: 4,
    },
    description: {
        fontSize: 14,
        marginBottom: 8,
    },
    countContainer: {
        alignSelf: 'flex-start',
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 12,
    },
    count: {
        fontSize: 12,
        fontWeight: '600',
    },
    arrowIcon: {
        marginLeft: 8,
    },
});

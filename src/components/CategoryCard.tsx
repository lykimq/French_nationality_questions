import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useIcons } from '../contexts/IconContext';
import FormattedText from './FormattedText';
import { CategoryCardProps } from '../types/questions';

const CategoryCard: React.FC<CategoryCardProps> = ({
    title,
    title_vi,
    description,
    description_vi,
    icon,
    count,
    onPress,
    language = 'fr',  // Default to French if not specified
}) => {
    const { theme } = useTheme();
    const { getJsonIconName, getJsonIconColor, getIconName } = useIcons();

    // Determine which language to display
    const displayTitle = language === 'fr' ? title : (title_vi || title);
    const displayDescription = language === 'fr' ? description : (description_vi || description);

    // Get the mapped icon name and vibrant color based on the current JSON icon set
    const mappedIconName = getJsonIconName(icon);
    const iconColor = getJsonIconColor(icon);

    return (
        <Pressable
            style={({ pressed }) => [
                styles.card,
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
            <View style={[styles.iconContainer, { backgroundColor: iconColor + '15' }]}>
                <Ionicons
                    name={mappedIconName as keyof typeof Ionicons.glyphMap}
                    size={32}
                    color={iconColor}
                />
            </View>
            <View style={styles.content}>
                <FormattedText style={[styles.title, { color: theme.colors.text }]}>{displayTitle}</FormattedText>
                {title_vi && language === 'vi' && (
                    <FormattedText style={[styles.titleTranslation, { color: theme.colors.textSecondary }]}>{title}</FormattedText>
                )}
                <FormattedText style={[styles.description, { color: theme.colors.textSecondary }]} numberOfLines={2}>
                    {displayDescription}
                </FormattedText>
                <View style={[styles.countContainer, { backgroundColor: iconColor + '15' }]}>
                    <FormattedText style={[styles.count, { color: iconColor }]}>{count} {language === 'fr' ? 'questions' : 'câu hỏi'}</FormattedText>
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
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        alignItems: 'center',
    },
    cardPressed: {
        // backgroundColor will be set dynamically
    },
    iconContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
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

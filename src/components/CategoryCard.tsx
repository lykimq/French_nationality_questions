import React from 'react';
import { Text, View, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import FormattedText from './FormattedText';

type CategoryCardProps = {
    title: string;
    title_vi?: string;
    description: string;
    description_vi?: string;
    icon: string;
    count: number;
    onPress: () => void;
    language?: 'fr' | 'vi';
};

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

    // Determine which language to display
    const displayTitle = language === 'fr' ? title : (title_vi || title);
    const displayDescription = language === 'fr' ? description : (description_vi || description);

    return (
        <Pressable
            style={({ pressed }) => [
                styles.card,
                { backgroundColor: theme.colors.card },
                pressed && [styles.cardPressed, { backgroundColor: theme.colors.primary + '10' }]
            ]}
            onPress={onPress}
            android_ripple={{ color: theme.colors.primary + '20' }}
        >
            <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary + '20' }]}>
                <Ionicons name={icon as any} size={32} color={theme.colors.primary} />
            </View>
            <View style={styles.content}>
                <FormattedText style={[styles.title, { color: theme.colors.text }]}>{displayTitle}</FormattedText>
                {title_vi && language === 'vi' && (
                    <FormattedText style={[styles.titleTranslation, { color: theme.colors.textSecondary }]}>{title}</FormattedText>
                )}
                <FormattedText style={[styles.description, { color: theme.colors.textSecondary }]} numberOfLines={2}>
                    {displayDescription}
                </FormattedText>
                <View style={[styles.countContainer, { backgroundColor: theme.colors.primary + '20' }]}>
                    <FormattedText style={[styles.count, { color: theme.colors.primary }]}>{count} {language === 'fr' ? 'questions' : 'câu hỏi'}</FormattedText>
                </View>
            </View>
            <Ionicons name="chevron-forward" size={24} color={theme.colors.primary} style={styles.arrowIcon} />
        </Pressable>
    );
};

export default CategoryCard;

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        borderRadius: 10,
        padding: 16,
        marginBottom: 15,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
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

import React from 'react';
import { Text, View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { categoryStyles as styles } from '../styles/categoryStyles';

type CategoryCardProps = {
    title: string;
    title_vi?: string;
    description: string;
    description_vi?: string;
    icon: string;
    count: number;
    onPress: () => void;
    language?: 'fr' | 'vi';  // Added language prop to control which language to display
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
    // Determine which language to display
    const displayTitle = language === 'fr' ? title : (title_vi || title);
    const displayDescription = language === 'fr' ? description : (description_vi || description);

    return (
        <Pressable
            style={({ pressed }) => [
                styles.card,
                pressed && styles.cardPressed
            ]}
            onPress={onPress}
            android_ripple={{ color: '#E8EAF6' }}
        >
            <View style={styles.iconContainer}>
                <Ionicons name={icon as any} size={32} color="#3F51B5" />
            </View>
            <View style={styles.content}>
                <Text style={styles.title}>{displayTitle}</Text>
                {title_vi && language === 'fr' && (
                    <Text style={styles.titleTranslation}>{title_vi}</Text>
                )}
                <Text style={styles.description} numberOfLines={2}>
                    {displayDescription}
                </Text>
                <View style={styles.countContainer}>
                    <Text style={styles.count}>{count} {language === 'fr' ? 'questions' : 'câu hỏi'}</Text>
                </View>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#3F51B5" style={styles.arrowIcon} />
        </Pressable>
    );
};

export default CategoryCard;
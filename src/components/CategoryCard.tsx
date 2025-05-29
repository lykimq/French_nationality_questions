import React from 'react';
import { Text, View, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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


const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        backgroundColor: '#fff',
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
        backgroundColor: '#F5F7FF',
    },
    iconContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#E8EAF6',
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
        color: '#333',
        marginBottom: 2,
    },
    titleTranslation: {
        fontSize: 14,
        fontStyle: 'italic',
        color: '#666',
        marginBottom: 4,
    },
    description: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    countContainer: {
        alignSelf: 'flex-start',
        backgroundColor: '#E8EAF6',
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 12,
    },
    count: {
        fontSize: 12,
        color: '#3F51B5',
        fontWeight: '600',
    },
    arrowIcon: {
        marginLeft: 8,
    },
});

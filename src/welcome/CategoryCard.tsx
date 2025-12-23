import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '../shared/contexts/ThemeContext';
import { useIcons } from '../shared/contexts/IconContext';
import { FormattedText, Icon3D } from '../shared/components';
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
    const { getJsonIconName, getJsonIconColor, getJsonIconVariant, getIconName, getIconVariant } = useIcons();

    const mappedIconName = getJsonIconName(icon || 'default');
    const iconColor = getJsonIconColor(icon || 'default');
    const iconVariant = getJsonIconVariant(icon || 'default');
    const chevronIconName = getIconName('chevronForward');
    const chevronVariant = getIconVariant('chevronForward');

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
            <Icon3D
                name={mappedIconName}
                size={28}
                color={iconColor}
                variant={iconVariant}
                backgroundColor={theme.colors.card}
            />
            <View style={styles.content}>
                <FormattedText style={[styles.title, { color: theme.colors.text }]}>{title}</FormattedText>
                <FormattedText style={[styles.description, { color: theme.colors.textSecondary }]} numberOfLines={2}>
                    {description}
                </FormattedText>
                <View style={[styles.countContainer, { backgroundColor: iconColor + '15' }]}>
                    <FormattedText style={[styles.count, { color: iconColor }]}>{count} questions</FormattedText>
                </View>
            </View>
            <Icon3D
                name={chevronIconName}
                size={20}
                color={iconColor}
                variant={chevronVariant}
                containerStyle={styles.arrowIcon}
            />
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
    },
    content: {
        flex: 1,
        marginLeft: 12,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 2,
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

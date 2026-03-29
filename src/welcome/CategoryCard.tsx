import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '../shared/contexts/ThemeContext';
import { useIcons } from '../shared/contexts/IconContext';
import { FormattedText, Icon3D, ProgressBar } from '../shared/components';
import { CategoryCardProps } from '../types';
import { sharedStyles } from '../shared/utils';

const CategoryCard: React.FC<CategoryCardProps> = ({
    title,
    description,
    icon,
    count,
    progress,
    onPress,
    disabled = false,
}) => {
    const { theme } = useTheme();
    const { getJsonIconName, getJsonIconColor, getJsonIconVariant, getIconName, getIconVariant } = useIcons();

    const mappedIconName = getJsonIconName(icon || 'default');
    const iconColor = getJsonIconColor(icon || 'default');
    const iconVariant = getJsonIconVariant(icon || 'default');
    const chevronIconName = getIconName('chevronForward');
    const chevronVariant = getIconVariant('chevronForward');

    const opacity = disabled ? 0.5 : 1;
    const grayedColor = disabled ? theme.colors.textMuted : iconColor;

    return (
        <Pressable
            style={({ pressed }) => [
                styles.card,
                sharedStyles.mediumShadow,
                {
                    backgroundColor: theme.colors.card,
                    borderColor: (disabled ? theme.colors.border : iconColor) + '20',
                    borderWidth: 1,
                    opacity,
                },
                pressed && !disabled && [styles.cardPressed, { backgroundColor: iconColor + '10' }]
            ]}
            onPress={disabled ? undefined : onPress}
            disabled={disabled}
            android_ripple={disabled ? undefined : { color: iconColor + '20' }}
        >
            <Icon3D
                name={mappedIconName}
                size={28}
                color={grayedColor}
                variant={iconVariant}
                backgroundColor={theme.colors.card}
            />
            <View style={styles.content}>
                <FormattedText style={[styles.title, { color: disabled ? theme.colors.textMuted : theme.colors.text }]}>{title}</FormattedText>
                <FormattedText style={[styles.description, { color: disabled ? theme.colors.textMuted : theme.colors.textSecondary }]} numberOfLines={2}>
                    {description}
                </FormattedText>
                <View style={[styles.countContainer, { backgroundColor: (disabled ? theme.colors.border : iconColor) + '15' }]}>
                    <FormattedText style={[styles.count, { color: disabled ? theme.colors.textMuted : iconColor }]}>{count} questions</FormattedText>
                </View>

                {/* Question progress bar - now using real data */}
                {progress !== undefined && (
                    <ProgressBar 
                        progress={progress} 
                        height={4} 
                        color={iconColor} 
                        containerStyle={styles.progressBar}
                    />
                )}
            </View>
            <Icon3D
                name={chevronIconName}
                size={20}
                color={grayedColor}
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
    progressBar: {
        marginTop: 10,
    },
    arrowIcon: {
        marginLeft: 8,
    },
});

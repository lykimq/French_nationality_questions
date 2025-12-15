import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useIcons } from '../../contexts/IconContext';
import { FormattedText } from '../shared';

interface SubcategoryTestCardProps {
    title: string;
    description: string;
    icon: string;
    iconColor: string;
    details: Array<{ icon: string; text: string }>;
    onPress: () => void;
}

const SubcategoryTestCard: React.FC<SubcategoryTestCardProps> = ({
    title,
    description,
    icon,
    iconColor,
    details,
    onPress,
}) => {
    const { theme } = useTheme();
    const { getIconName, getJsonIconName } = useIcons();

    return (
        <TouchableOpacity
            style={[styles.subcategoryTestCard, { backgroundColor: theme.colors.surface }]}
            onPress={onPress}
            activeOpacity={0.8}
        >
            <View style={[styles.subcategoryIconContainer, { backgroundColor: iconColor + '20' }]}>
                <Ionicons name={getJsonIconName(icon) as any} size={32} color={iconColor} />
            </View>

            <View style={styles.subcategoryContent}>
                <FormattedText style={[styles.subcategoryTitle, { color: theme.colors.text }]}>
                    {title}
                </FormattedText>
                <FormattedText style={[styles.subcategoryDescription, { color: theme.colors.textMuted }]}>
                    {description}
                </FormattedText>

                <View style={styles.subcategoryDetails}>
                    {details.map((detail, index) => (
                        <View key={index} style={styles.subcategoryDetail}>
                            <Ionicons name={getIconName(detail.icon as any) as any} size={16} color={theme.colors.textMuted} />
                            <FormattedText style={[styles.subcategoryDetailText, { color: theme.colors.textMuted }]}>
                                {detail.text}
                            </FormattedText>
                        </View>
                    ))}
                </View>
            </View>

            <Ionicons name={getIconName('chevronForward') as any} size={24} color={theme.colors.textMuted} />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    subcategoryTestCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        borderRadius: 16,
        marginBottom: 16,
        elevation: 2,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    subcategoryIconContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    subcategoryContent: {
        flex: 1,
    },
    subcategoryTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 4,
    },
    subcategoryDescription: {
        fontSize: 14,
        marginBottom: 8,
        lineHeight: 20,
    },
    subcategoryDetails: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    subcategoryDetail: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 16,
        marginBottom: 4,
    },
    subcategoryDetailText: {
        marginLeft: 4,
        fontSize: 12,
    },
});

export default SubcategoryTestCard;
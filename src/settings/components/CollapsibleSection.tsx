import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../shared/contexts/ThemeContext';
import { FormattedText } from '../../shared/components';
import { sharedStyles } from '../../shared/utils';

interface CollapsibleSectionProps {
    title: string;
    icon: string;
    iconColor: string;
    children: React.ReactNode;
    defaultExpanded?: boolean;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
    title,
    icon,
    iconColor,
    children,
    defaultExpanded = false,
}) => {
    const { theme } = useTheme();
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.card }]}>
            <TouchableOpacity
                style={[styles.header, { borderBottomColor: theme.colors.divider }]}
                onPress={() => setIsExpanded(!isExpanded)}
                activeOpacity={0.7}
            >
                <View style={styles.headerLeft}>
                    <View style={[sharedStyles.iconContainer, { backgroundColor: iconColor + '15' }]}>
                        <Ionicons name={icon as any} size={20} color={iconColor} />
                    </View>
                    <FormattedText style={[styles.title, { color: theme.colors.text }]}>
                        {title}
                    </FormattedText>
                </View>
                <Ionicons
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color={theme.colors.textMuted}
                />
            </TouchableOpacity>

            {isExpanded && (
                <View style={styles.content}>
                    {children}
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 8,
        borderRadius: 12,
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 12,
    },
    content: {
        paddingTop: 4,
    },
});

export default CollapsibleSection;


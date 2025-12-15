import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useIcons } from '../contexts/IconContext';
import FormattedText from './FormattedText';
import { BaseIconSelector } from './BaseIconSelector';
import { sharedStyles } from '../utils/shared';
import { jsonIconSets, iconSetOptions } from '../config/iconConfig';
import type { SettingsComponentWithValueProps, IconSetType, IconSetInfo } from '../types';

const JsonIconSelector: React.FC<SettingsComponentWithValueProps<IconSetType>> = ({
    title,
    title_vi,
    language,
    value,
    onValueChange,
}) => {
    const { theme } = useTheme();
    const { getJsonIconName, getJsonIconColor } = useIcons();

    const renderPreview = (iconSetType: IconSetType) => {
        return (
            <View style={styles.previewRow}>
                <Ionicons
                    name={getJsonIconName('map') as any}
                    size={16}
                    color={getJsonIconColor('map')}
                />
                <Ionicons
                    name={getJsonIconName('person') as any}
                    size={16}
                    color={getJsonIconColor('person')}
                />
                <Ionicons
                    name={getJsonIconName('star') as any}
                    size={16}
                    color={getJsonIconColor('star')}
                />
            </View>
        );
    };

    const renderOption = (item: IconSetInfo, isSelected: boolean) => {
        const previewIcons = jsonIconSets[item.id];

        return (
            <View style={[
                styles.optionCard,
                {
                    backgroundColor: isSelected ? theme.colors.primary + '10' : theme.colors.card,
                    borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                }
            ]}>
                <View style={styles.optionHeader}>
                    <View style={styles.optionLeft}>
                        <View style={[
                            styles.optionIconContainer,
                            { backgroundColor: theme.colors.primary + '15' }
                        ]}>
                            <Ionicons
                                name={(previewIcons?.book || 'book') as any}
                                size={24}
                                color={theme.colors.primary}
                            />
                        </View>
                        <View style={styles.optionContent}>
                            <FormattedText style={[
                                styles.optionTitle,
                                { color: theme.colors.text }
                            ]}>
                                {language === 'fr' ? item.name : item.nameVi}
                            </FormattedText>
                            <FormattedText style={[
                                styles.optionDescription,
                                { color: theme.colors.textSecondary }
                            ]}>
                                {language === 'fr' ? item.description : item.descriptionVi}
                            </FormattedText>
                        </View>
                    </View>
                    {isSelected && (
                        <View style={[
                            styles.selectedBadge,
                            { backgroundColor: theme.colors.primary }
                        ]}>
                            <Ionicons name="checkmark" size={12} color="white" />
                        </View>
                    )}
                </View>

                {/* Icon preview row */}
                <View style={[
                    styles.iconPreviewRow,
                    { borderTopColor: theme.colors.divider }
                ]}>
                    <Ionicons
                        name={(previewIcons?.map || 'map') as any}
                        size={18}
                        color={getJsonIconColor('map')}
                    />
                    <Ionicons
                        name={(previewIcons?.person || 'person') as any}
                        size={18}
                        color={getJsonIconColor('person')}
                    />
                    <Ionicons
                        name={(previewIcons?.book || 'book') as any}
                        size={18}
                        color={getJsonIconColor('book')}
                    />
                    <Ionicons
                        name={(previewIcons?.star || 'star') as any}
                        size={18}
                        color={getJsonIconColor('star')}
                    />
                    <Ionicons
                        name={(previewIcons?.shield || 'shield') as any}
                        size={18}
                        color={getJsonIconColor('shield')}
                    />
                </View>
            </View>
        );
    };

    return (
        <BaseIconSelector
            title={title}
            title_vi={title_vi || title}
            language={language}
            value={value}
            onValueChange={onValueChange}
            options={iconSetOptions}
            renderPreview={renderPreview}
            renderOption={renderOption}
            modalTitle="Choisir un style d'icônes JSON"
            modalTitleVi="Chọn kiểu biểu tượng JSON"
        />
    );
};

const styles = StyleSheet.create({
    previewRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    optionCard: {
        ...sharedStyles.smallCard,
        borderWidth: 1,
    },
    optionHeader: {
        ...sharedStyles.optionHeader,
    },
    optionLeft: {
        ...sharedStyles.optionLeft,
    },
    optionIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    optionContent: {
        ...sharedStyles.optionContent,
    },
    optionTitle: {
        ...sharedStyles.optionTitle,
    },
    optionDescription: {
        ...sharedStyles.optionDescription,
    },
    selectedBadge: {
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        ...sharedStyles.lightShadow,
    },
    iconPreviewRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingTop: 16,
        borderTopWidth: 1,
    },
});

export default JsonIconSelector;
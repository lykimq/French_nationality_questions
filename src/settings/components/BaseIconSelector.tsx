import React, { useState } from 'react';
import { View, TouchableOpacity, Modal, FlatList, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../shared/contexts/ThemeContext';
import { useIcons } from '../../shared/contexts/IconContext';
import { FormattedText } from '../../shared/components';
import { sharedStyles } from '../../shared/utils';
import type { Language } from '../../types';

interface BaseIconSelectorProps<T> {
    title: string;
    title_vi: string;
    language: Language;
    value: T;
    onValueChange: (value: T) => void;
    options: Array<{
        id: T;
        name: string;
        nameVi: string;
        description: string;
        descriptionVi: string;
    }>;
    renderPreview: (value: T) => React.ReactNode;
    renderOption: (item: any, isSelected: boolean) => React.ReactNode;
    modalTitle: string;
    modalTitleVi: string;
}

export function BaseIconSelector<T>({
    title,
    title_vi,
    language,
    value,
    onValueChange,
    options,
    renderPreview,
    renderOption,
    modalTitle,
    modalTitleVi,
}: BaseIconSelectorProps<T>) {
    const { theme } = useTheme();
    const { getIconName } = useIcons();
    const [modalVisible, setModalVisible] = useState(false);

    const currentOption = options.find(option => option.id === value);

    const handleSelect = (selectedValue: T) => {
        onValueChange(selectedValue);
        setModalVisible(false);
    };

    const renderOptionItem = ({ item }: { item: any }) => {
        const isSelected = item.id === value;
        return (
            <TouchableOpacity
                onPress={() => handleSelect(item.id)}
                activeOpacity={0.7}
                style={styles.optionWrapper}
            >
                {renderOption(item, isSelected)}
            </TouchableOpacity>
        );
    };

    return (
        <View>
            <TouchableOpacity
                style={[
                    styles.selector,
                    {
                        backgroundColor: theme.colors.card,
                        borderBottomColor: theme.colors.divider,
                    }
                ]}
                onPress={() => setModalVisible(true)}
                activeOpacity={0.7}
            >
                <View style={styles.selectorLeft}>
                    <View style={[
                        sharedStyles.iconContainer,
                        { backgroundColor: theme.colors.primary + '15' }
                    ]}>
                        <Ionicons name={getIconName('palette') as any} size={20} color={theme.colors.primary} />
                    </View>
                    <View style={styles.selectorContent}>
                        <FormattedText style={[
                            styles.selectorTitle,
                            { color: theme.colors.text }
                        ]}>
                            {language === 'fr' ? title : title_vi}
                        </FormattedText>
                        <FormattedText style={[
                            styles.currentValue,
                            { color: theme.colors.textSecondary }
                        ]}>
                            {language === 'fr' ? currentOption?.name : currentOption?.nameVi}
                        </FormattedText>
                    </View>
                </View>
                <View style={styles.selectorRight}>
                    <View style={styles.previewContainer}>
                        {renderPreview(value)}
                    </View>
                    <Ionicons name={getIconName('chevronForward') as any} size={20} color={theme.colors.textMuted} />
                </View>
            </TouchableOpacity>

            <Modal
                visible={modalVisible}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
                    <View style={[
                        sharedStyles.modalHeader,
                        {
                            backgroundColor: theme.colors.card,
                            borderBottomColor: theme.colors.divider
                        }
                    ]}>
                        <FormattedText style={[sharedStyles.modalTitle, { color: theme.colors.text }]}>
                            {language === 'fr' ? modalTitle : modalTitleVi}
                        </FormattedText>
                        <TouchableOpacity
                            onPress={() => setModalVisible(false)}
                            style={sharedStyles.closeButton}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            <Ionicons name={getIconName('close') as any} size={24} color={theme.colors.text} />
                        </TouchableOpacity>
                    </View>

                    <FlatList
                        data={options}
                        renderItem={renderOptionItem}
                        keyExtractor={(item) => String(item.id)}
                        contentContainerStyle={styles.listContainer}
                        showsVerticalScrollIndicator={false}
                        ItemSeparatorComponent={() => <View style={styles.separator} />}
                    />
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    selector: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 15,
        borderBottomWidth: 1,
    },
    selectorLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },

    selectorContent: {
        flex: 1,
    },
    selectorTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 2,
    },
    currentValue: {
        fontSize: 14,
    },
    selectorRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    previewContainer: {
        marginRight: 12,
    },
    modalContainer: {
        flex: 1,
    },

    listContainer: {
        padding: 20,
    },
    optionWrapper: {
        marginBottom: 16,
    },
    separator: {
        height: 8,
    },
});
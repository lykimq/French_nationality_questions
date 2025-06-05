import React, { useState } from 'react';
import {
    View,
    TouchableOpacity,
    Modal,
    FlatList,
    StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useIcons, iconSetOptions } from '../contexts/IconContext';
import type { IconSetType, IconSetInfo, SettingsComponentWithValueProps } from '../types';
import FormattedText from './FormattedText';

const JsonIconSelector: React.FC<SettingsComponentWithValueProps<IconSetType>> = ({
    title,
    title_vi,
    language,
    value,
    onValueChange,
}) => {
    const [modalVisible, setModalVisible] = useState(false);
    const { theme } = useTheme();
    const { jsonIcons } = useIcons();

    const currentIconSet = iconSetOptions.find(set => set.id === value);

    const handleSelect = (iconSet: IconSetType) => {
        onValueChange(iconSet);
        setModalVisible(false);
    };

    const renderIconSetOption = ({ item }: { item: IconSetInfo }) => {
        const isSelected = item.id === value;

        // Sample icons to preview the JSON icon set - using actual JSON file icons
        const sampleJsonIcons = ['map', 'person', 'book', 'star', 'shield'];

        return (
            <TouchableOpacity
                style={[
                    styles.optionItem,
                    {
                        backgroundColor: theme.colors.card,
                        borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                        borderWidth: isSelected ? 2 : 1,
                    }
                ]}
                onPress={() => handleSelect(item.id)}
                activeOpacity={0.7}
            >
                <View style={styles.optionContent}>
                    <FormattedText style={[styles.optionTitle, { color: theme.colors.text }]}>
                        {language === 'fr' ? item.name : item.nameVi}
                    </FormattedText>
                    <FormattedText style={[styles.optionDescription, { color: theme.colors.textSecondary }]}>
                        {language === 'fr' ? item.description : item.descriptionVi}
                    </FormattedText>

                    {/* Preview of category icons */}
                    <View style={[styles.iconPreviewRow, { borderTopColor: theme.colors.border }]}>
                        {sampleJsonIcons.map((iconKey, index) => {
                            // Get the icon mapping for this specific set
                            const iconSets = {
                                filled: {
                                    map: 'map',
                                    person: 'person',
                                    book: 'book',
                                    star: 'star',
                                    shield: 'shield',
                                },
                                outlined: {
                                    map: 'map-outline',
                                    person: 'person-outline',
                                    book: 'book-outline',
                                    star: 'star-outline',
                                    shield: 'shield-outline',
                                },
                                rounded: {
                                    map: 'location',
                                    person: 'person-circle',
                                    book: 'library',
                                    star: 'star',
                                    shield: 'medal',
                                },
                                sharp: {
                                    map: 'map-sharp',
                                    person: 'person-sharp',
                                    book: 'book-sharp',
                                    star: 'star-sharp',
                                    shield: 'shield-sharp',
                                }
                            };

                            // Vibrant colors for preview
                            const iconColors = {
                                map: '#00B4D8',        // Ocean blue for geography
                                person: '#9D4EDD',     // Purple for personal
                                book: '#F77F00',       // Orange for history/books
                                star: '#FFD60A',       // Gold for monarchy/star
                                shield: '#118AB2',     // Navy blue for wars/shield
                            };

                            const iconName = iconSets[item.id][iconKey as keyof typeof iconSets.filled];
                            const iconColor = iconColors[iconKey as keyof typeof iconColors];

                            return (
                                <Ionicons
                                    key={index}
                                    name={iconName as any}
                                    size={20}
                                    color={iconColor}
                                />
                            );
                        })}
                    </View>
                </View>

                {isSelected && (
                    <View style={[styles.selectedIndicator, { backgroundColor: theme.colors.primary }]}>
                        <Ionicons name="checkmark" size={12} color="white" />
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <View>
            <TouchableOpacity
                style={[styles.selector, { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.divider }]}
                onPress={() => setModalVisible(true)}
                activeOpacity={0.7}
            >
                <View style={styles.selectorLeft}>
                    <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary + '15' }]}>
                        <Ionicons name="shapes" size={22} color={theme.colors.primary} />
                    </View>
                    <View style={styles.textContainer}>
                        <FormattedText style={[styles.selectorTitle, { color: theme.colors.text }]}>
                            {language === 'fr' ? title : title_vi}
                        </FormattedText>
                        <FormattedText style={[styles.selectorSubtitle, { color: theme.colors.textSecondary }]}>
                            {currentIconSet ? (language === 'fr' ? currentIconSet.name : currentIconSet.nameVi) : ''}
                        </FormattedText>
                    </View>
                </View>

                <View style={styles.selectorRight}>
                    {/* Preview current JSON icons */}
                    <View style={styles.previewIcons}>
                        <Ionicons name={jsonIcons.map as any} size={16} color="#00B4D8" />
                        <Ionicons name={jsonIcons.star as any} size={16} color="#FFD60A" />
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={theme.colors.textMuted} />
                </View>
            </TouchableOpacity>

            <Modal
                visible={modalVisible}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
                    <View style={[styles.modalHeader, { backgroundColor: theme.colors.headerBackground, borderBottomColor: theme.colors.border }]}>
                        <FormattedText style={[styles.modalTitle, { color: theme.colors.headerText }]}>
                            {language === 'fr' ? 'Style des icônes de catégories' : 'Kiểu biểu tượng danh mục'}
                        </FormattedText>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setModalVisible(false)}
                        >
                            <Ionicons name="close" size={24} color={theme.colors.headerText} />
                        </TouchableOpacity>
                    </View>

                    <FlatList
                        data={iconSetOptions}
                        keyExtractor={(item) => item.id}
                        renderItem={renderIconSetOption}
                        contentContainerStyle={styles.optionsList}
                        showsVerticalScrollIndicator={false}
                    />
                </View>
            </Modal>
        </View>
    );
};

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
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    textContainer: {
        flex: 1,
    },
    selectorTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 2,
    },
    selectorSubtitle: {
        fontSize: 14,
    },
    selectorRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    previewIcons: {
        flexDirection: 'row',
        marginRight: 8,
        gap: 6,
    },
    modalContainer: {
        flex: 1,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    closeButton: {
        padding: 4,
    },
    optionsList: {
        padding: 20,
    },
    optionItem: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        position: 'relative',
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    selectedIndicator: {
        position: 'absolute',
        bottom: -2,
        right: -2,
        width: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    optionContent: {
        flex: 1,
    },
    optionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    optionDescription: {
        fontSize: 14,
        lineHeight: 20,
    },
    iconPreviewRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingTop: 12,
        borderTopWidth: 1,
    },
});

export default JsonIconSelector;
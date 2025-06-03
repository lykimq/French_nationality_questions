import React, { useState } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    Modal,
    FlatList,
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import FormattedText from './FormattedText';
import { useTheme } from '../contexts/ThemeContext';
import { useIcons, IconSetType, IconSetInfo, iconSetOptions } from '../contexts/IconContext';

// Import the icon sets directly
const iconSets = {
    filled: {
        home: 'home',
        search: 'search',
        settings: 'settings',
        star: 'star',
        share: 'share-social',
    },
    outlined: {
        home: 'home-outline',
        search: 'search-outline',
        settings: 'settings-outline',
        star: 'star-outline',
        share: 'share-social-outline',
    },
    rounded: {
        home: 'home',
        search: 'search-circle',
        settings: 'settings',
        star: 'star',
        share: 'share',
    },
    sharp: {
        home: 'home-sharp',
        search: 'search-sharp',
        settings: 'settings-sharp',
        star: 'star-sharp',
        share: 'share-social-sharp',
    },
};

interface IconSelectorProps {
    title: string;
    titleVi: string;
    language: 'fr' | 'vi';
    value: IconSetType;
    onValueChange: (iconSet: IconSetType) => void;
}

const { width: screenWidth } = Dimensions.get('window');

const IconSelector: React.FC<IconSelectorProps> = ({
    title,
    titleVi,
    language,
    value,
    onValueChange,
}) => {
    const [modalVisible, setModalVisible] = useState(false);
    const { theme } = useTheme();
    const { getIconName } = useIcons();

    const currentIconSet = iconSetOptions.find(set => set.id === value);

    const handleSelect = (iconSet: IconSetType) => {
        onValueChange(iconSet);
        setModalVisible(false);
    };

    const renderIconSetOption = ({ item }: { item: IconSetInfo }) => {
        const isSelected = item.id === value;
        const previewIcons = iconSets[item.id];

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
                <View style={styles.optionHeader}>
                    <View style={styles.iconPreviewContainer}>
                        <View style={[styles.iconPreview, { backgroundColor: theme.colors.background }]}>
                            <Ionicons
                                name={item.previewIcon as any}
                                size={24}
                                color={theme.colors.primary}
                            />
                        </View>
                        {isSelected && (
                            <View style={[styles.selectedIndicator, { backgroundColor: theme.colors.primary }]}>
                                <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                            </View>
                        )}
                    </View>

                    <View style={styles.optionContent}>
                        <FormattedText style={[styles.optionTitle, { color: theme.colors.text }]}>
                            {language === 'fr' ? item.name : item.nameVi}
                        </FormattedText>
                        <FormattedText style={[styles.optionDescription, { color: theme.colors.textSecondary }]}>
                            {language === 'fr' ? item.description : item.descriptionVi}
                        </FormattedText>
                    </View>
                </View>

                {/* Icon preview row */}
                <View style={[styles.iconPreviewRow, { borderTopColor: theme.colors.divider }]}>
                    <Ionicons name={previewIcons.home as any} size={18} color={theme.colors.textMuted} />
                    <Ionicons name={previewIcons.search as any} size={18} color={theme.colors.textMuted} />
                    <Ionicons name={previewIcons.settings as any} size={18} color={theme.colors.textMuted} />
                    <Ionicons name={previewIcons.star as any} size={18} color={theme.colors.textMuted} />
                    <Ionicons name={previewIcons.share as any} size={18} color={theme.colors.textMuted} />
                </View>
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
                        <Ionicons name={getIconName('palette') as any} size={20} color={theme.colors.primary} />
                    </View>
                    <View style={styles.selectorContent}>
                        <FormattedText style={[styles.selectorTitle, { color: theme.colors.text }]}>
                            {language === 'fr' ? title : titleVi}
                        </FormattedText>
                        <FormattedText style={[styles.currentValue, { color: theme.colors.textSecondary }]}>
                            {language === 'fr' ? currentIconSet?.name : currentIconSet?.nameVi}
                        </FormattedText>
                    </View>
                </View>
                <View style={styles.selectorRight}>
                    <Ionicons name={currentIconSet?.previewIcon as any} size={20} color={theme.colors.textMuted} />
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
                    <View style={[styles.modalHeader, {
                        backgroundColor: theme.colors.card,
                        borderBottomColor: theme.colors.divider
                    }]}>
                        <FormattedText style={[styles.modalTitle, { color: theme.colors.text }]}>
                            {language === 'fr' ? 'Choisir un style d\'icônes' : 'Chọn kiểu biểu tượng'}
                        </FormattedText>
                        <TouchableOpacity
                            onPress={() => setModalVisible(false)}
                            style={styles.closeButton}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            <Ionicons name={getIconName('close') as any} size={24} color={theme.colors.text} />
                        </TouchableOpacity>
                    </View>

                    <FlatList
                        data={iconSetOptions}
                        renderItem={renderIconSetOption}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={styles.listContainer}
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
        gap: 8,
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
    listContainer: {
        padding: 16,
        gap: 16,
    },
    optionItem: {
        borderRadius: 12,
        padding: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    optionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    iconPreviewContainer: {
        position: 'relative',
        marginRight: 16,
    },
    iconPreview: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
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

export default IconSelector;
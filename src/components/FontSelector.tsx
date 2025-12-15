import React, { useState } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    Modal,
    FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import FormattedText from './FormattedText';
import { useTheme } from '../contexts/ThemeContext';
import { SettingsComponentProps } from '../types';
import { sharedStyles } from '../utils/shared';

interface FontOption {
    name: string;
    nameVi: string;
    value: string;
    preview: string;
}

const FONT_OPTIONS: FontOption[] = [
    { name: 'Système', nameVi: 'Hệ thống', value: 'System', preview: 'Aa' },
    { name: 'Sans Serif', nameVi: 'Sans Serif', value: 'sans-serif', preview: 'Aa' },
    { name: 'Serif', nameVi: 'Serif', value: 'serif', preview: 'Aa' },
    { name: 'Monospace', nameVi: 'Monospace', value: 'monospace', preview: 'Aa' },
    { name: 'Kalam', nameVi: 'Kalam', value: 'Kalam', preview: 'Aa' },
    { name: 'Patrick Hand', nameVi: 'Patrick Hand', value: 'PatrickHand', preview: 'Aa' },
    { name: 'Dancing Script', nameVi: 'Dancing Script', value: 'DancingScript', preview: 'Aa' },
];

const FontSelector: React.FC<SettingsComponentProps> = ({
    title,
    title_vi,
    language,
    value,
    onValueChange,
}) => {
    const [modalVisible, setModalVisible] = useState(false);
    const { theme } = useTheme();

    const currentFont = FONT_OPTIONS.find(font => font.value === value) || FONT_OPTIONS[0];

    const handleFontSelect = (fontValue: string) => {
        onValueChange(fontValue);
        setModalVisible(false);
    };

    const renderFontOption = ({ item }: { item: FontOption }) => (
        <TouchableOpacity
            style={[
                styles.fontOption,
                { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.divider },
                item.value === value && [styles.fontOptionSelected, { backgroundColor: theme.colors.primary + '10' }]
            ]}
            onPress={() => handleFontSelect(item.value)}
        >
            <View style={styles.fontInfo}>
                <FormattedText style={[styles.fontName, { color: theme.colors.text, fontFamily: item.value === 'System' ? undefined : item.value }]}>
                    {language === 'fr' ? item.name : item.nameVi}
                </FormattedText>
                <FormattedText style={[styles.fontPreview, { color: theme.colors.textSecondary, fontFamily: item.value === 'System' ? undefined : item.value }]}>
                    {item.preview} - {language === 'fr' ? 'Exemple de texte' : 'Văn bản mẫu'}
                </FormattedText>
            </View>
            {item.value === value && (
                <Ionicons name="checkmark" size={20} color={theme.colors.primary} />
            )}
        </TouchableOpacity>
    );

    return (
        <>
            <TouchableOpacity
                style={[styles.container, { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.divider }]}
                onPress={() => setModalVisible(true)}
            >
                <View style={[styles.iconContainer, { backgroundColor: '#9C27B020' }]}>
                    <Ionicons name={theme.icons.textFormat as any} size={20} color="#9C27B0" />
                </View>
                <View style={styles.textContainer}>
                    <FormattedText style={[styles.title, { color: theme.colors.text }]}>
                        {language === 'fr' ? title : (title_vi || title)}
                    </FormattedText>
                    <FormattedText style={[styles.currentValue, { color: theme.colors.textSecondary }]}>
                        {language === 'fr' ? currentFont.name : currentFont.nameVi}
                    </FormattedText>
                </View>
                <Ionicons name={theme.icons.chevronForward as any} size={20} color={theme.colors.textMuted} />
            </TouchableOpacity>

            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={[styles.modalOverlay, { backgroundColor: theme.colors.modalOverlay }]}>
                    <View style={[styles.modalContent, { backgroundColor: theme.colors.modalBackground }]}>
                        <View style={[styles.modalHeader, { borderBottomColor: theme.colors.divider }]}>
                            <FormattedText style={[styles.modalTitle, { color: theme.colors.text }]}>
                                {language === 'fr' ? 'Choisir une police' : 'Chọn phông chữ'}
                            </FormattedText>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name={theme.icons.close as any} size={24} color={theme.colors.text} />
                            </TouchableOpacity>
                        </View>

                        <FlatList
                            data={FONT_OPTIONS}
                            renderItem={renderFontOption}
                            keyExtractor={(item) => item.value}
                            showsVerticalScrollIndicator={false}
                        />
                    </View>
                </View>
            </Modal>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        ...sharedStyles.row,
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderBottomWidth: 1,
    },
    iconContainer: {
        ...sharedStyles.iconContainer,
    },
    textContainer: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: '500',
    },
    currentValue: {
        fontSize: 14,
        marginTop: 2,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '70%',
    },
    modalHeader: {
        ...sharedStyles.modalHeader,
        paddingVertical: 15,
    },
    modalTitle: {
        ...sharedStyles.modalTitle,
    },
    fontOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
    },
    fontOptionSelected: {
        // backgroundColor will be set dynamically
    },
    fontInfo: {
        flex: 1,
    },
    fontName: {
        fontSize: 16,
        fontWeight: '500',
    },
    fontPreview: {
        fontSize: 14,
        marginTop: 4,
    },
});

export default FontSelector;
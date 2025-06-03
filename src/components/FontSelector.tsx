import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import FormattedText from './FormattedText';

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
];

interface FontSelectorProps {
    title: string;
    titleVi?: string;
    language: 'fr' | 'vi';
    value: string;
    onValueChange: (value: string) => void;
}

const FontSelector: React.FC<FontSelectorProps> = ({
    title,
    titleVi,
    language,
    value,
    onValueChange,
}) => {
    const [modalVisible, setModalVisible] = useState(false);

    const currentFont = FONT_OPTIONS.find(font => font.value === value) || FONT_OPTIONS[0];

    const handleFontSelect = (fontValue: string) => {
        onValueChange(fontValue);
        setModalVisible(false);
    };

    const renderFontOption = ({ item }: { item: FontOption }) => (
        <TouchableOpacity
            style={[
                styles.fontOption,
                item.value === value && styles.fontOptionSelected
            ]}
            onPress={() => handleFontSelect(item.value)}
        >
            <View style={styles.fontInfo}>
                <FormattedText style={[styles.fontName, { fontFamily: item.value === 'System' ? undefined : item.value }]}>
                    {language === 'fr' ? item.name : item.nameVi}
                </FormattedText>
                <FormattedText style={[styles.fontPreview, { fontFamily: item.value === 'System' ? undefined : item.value }]}>
                    {item.preview} - {language === 'fr' ? 'Exemple de texte' : 'Văn bản mẫu'}
                </FormattedText>
            </View>
            {item.value === value && (
                <Ionicons name="checkmark" size={20} color="#3F51B5" />
            )}
        </TouchableOpacity>
    );

    return (
        <>
            <TouchableOpacity style={styles.container} onPress={() => setModalVisible(true)}>
                <View style={styles.iconContainer}>
                    <Ionicons name="text" size={20} color="#9C27B0" />
                </View>
                <View style={styles.textContainer}>
                    <FormattedText style={styles.title}>
                        {language === 'fr' ? title : (titleVi || title)}
                    </FormattedText>
                    <FormattedText style={styles.currentValue}>
                        {language === 'fr' ? currentFont.name : currentFont.nameVi}
                    </FormattedText>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>

            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <FormattedText style={styles.modalTitle}>
                                {language === 'fr' ? 'Choisir une police' : 'Chọn phông chữ'}
                            </FormattedText>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#333" />
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
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        backgroundColor: '#fff',
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#9C27B020',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    textContainer: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
    currentValue: {
        fontSize: 14,
        color: '#666',
        marginTop: 2,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '70%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    fontOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    fontOptionSelected: {
        backgroundColor: '#3F51B510',
    },
    fontInfo: {
        flex: 1,
    },
    fontName: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
    fontPreview: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    },
});

export default FontSelector;
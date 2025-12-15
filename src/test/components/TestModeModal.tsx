import React from 'react';
import { View, Modal, TouchableOpacity, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../shared/contexts/ThemeContext';
import { useIcons } from '../../shared/contexts/IconContext';
import { FormattedText } from '../../shared/components';
import { MainTestModeOption } from '../types';

const { height } = Dimensions.get('window');

interface TestModeModalProps {
    visible: boolean;
    modeOption: MainTestModeOption | null;
    isStartingTest: boolean;
    onClose: () => void;
    onStartTest: () => void;
    getLocalizedText: (textFr: string, textVi: string) => string;
    getLocalizedModeTitle: (modeOption: MainTestModeOption) => string;
    getLocalizedModeDescription: (modeOption: MainTestModeOption) => string;
}

const TestModeModal: React.FC<TestModeModalProps> = ({
    visible,
    modeOption,
    isStartingTest,
    onClose,
    onStartTest,
    getLocalizedText,
    getLocalizedModeTitle,
    getLocalizedModeDescription,
}) => {
    const { theme } = useTheme();
    const { getIconName, getJsonIconName } = useIcons();

    if (!modeOption) return null;

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
                    <LinearGradient
                        colors={[modeOption.color + '20', modeOption.color + '05']}
                        style={styles.modalHeader}
                    >
                        <View style={[styles.modalIconContainer, { backgroundColor: modeOption.color }]}>
                            <Ionicons name={getJsonIconName(modeOption.icon) as any} size={40} color="white" />
                        </View>
                        <FormattedText style={[styles.modalTitle, { color: theme.colors.text }]}>
                            {getLocalizedModeTitle(modeOption)}
                        </FormattedText>
                        <FormattedText style={[styles.modalDescription, { color: theme.colors.textMuted }]}>
                            {getLocalizedModeDescription(modeOption)}
                        </FormattedText>
                    </LinearGradient>

                    <View style={styles.modalBody}>
                        <View style={styles.modalDetails}>
                            <View style={styles.modalDetailRow}>
                                <Ionicons name={getIconName('helpCircle') as any} size={20} color={theme.colors.primary} />
                                <FormattedText style={[styles.modalDetailLabel, { color: theme.colors.text }]}>
                                    {getLocalizedText('Questions:', 'Số câu hỏi:')}
                                </FormattedText>
                                <FormattedText style={[styles.modalDetailValue, { color: theme.colors.textMuted }]}>
                                    {modeOption.questionCount}
                                </FormattedText>
                            </View>

                            {modeOption.timeLimit && (
                                <View style={styles.modalDetailRow}>
                                    <Ionicons name={getIconName('time') as any} size={20} color={theme.colors.primary} />
                                    <FormattedText style={[styles.modalDetailLabel, { color: theme.colors.text }]}>
                                        {getLocalizedText('Durée:', 'Thời gian:')}
                                    </FormattedText>
                                    <FormattedText style={[styles.modalDetailValue, { color: theme.colors.textMuted }]}>
                                        {modeOption.timeLimit} {getLocalizedText('minutes', 'phút')}
                                    </FormattedText>
                                </View>
                            )}

                            <View style={styles.modalDetailRow}>
                                <Ionicons name={getIconName('shuffle') as any} size={20} color={theme.colors.primary} />
                                <FormattedText style={[styles.modalDetailLabel, { color: theme.colors.text }]}>
                                    {getLocalizedText('Questions mélangées', 'Câu hỏi ngẫu nhiên')}
                                </FormattedText>
                                <Ionicons name={getIconName('checkmark') as any} size={20} color={theme.colors.success} />
                            </View>
                        </View>

                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.modalCancelButton, { borderColor: theme.colors.border }]}
                                onPress={onClose}
                            >
                                <FormattedText style={[styles.modalButtonText, { color: theme.colors.textMuted }]}>
                                    {getLocalizedText('Annuler', 'Hủy')}
                                </FormattedText>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.modalButton, styles.modalStartButton, { backgroundColor: modeOption.color }]}
                                onPress={onStartTest}
                                disabled={isStartingTest}
                            >
                                {isStartingTest ? (
                                    <ActivityIndicator color="white" size="small" />
                                ) : (
                                    <>
                                        <Ionicons name={getIconName('play') as any} size={20} color="white" />
                                        <FormattedText style={styles.modalStartButtonText}>
                                            {getLocalizedText('Commencer', 'Bắt đầu')}
                                        </FormattedText>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        borderRadius: 20,
        width: '100%',
        maxWidth: 400,
        maxHeight: height * 0.8,
        elevation: 10,
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
    },
    modalHeader: {
        padding: 24,
        alignItems: 'center',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    modalIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center',
    },
    modalDescription: {
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 22,
    },
    modalBody: {
        padding: 24,
    },
    modalDetails: {
        marginBottom: 24,
    },
    modalDetailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        marginBottom: 8,
    },
    modalDetailLabel: {
        flex: 1,
        marginLeft: 12,
        fontSize: 16,
        fontWeight: '500',
    },
    modalDetailValue: {
        fontSize: 16,
    },
    modalActions: {
        flexDirection: 'row',
        gap: 12,
    },
    modalButton: {
        flex: 1,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalCancelButton: {
        borderWidth: 1,
    },
    modalStartButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    modalButtonText: {
        fontSize: 16,
        fontWeight: '500',
    },
    modalStartButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
});

export default TestModeModal;
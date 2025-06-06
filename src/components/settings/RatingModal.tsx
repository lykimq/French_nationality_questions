import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Modal, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import FormattedText from '../FormattedText';
import { sharedStyles } from '../../utils/sharedStyles';

interface RatingModalProps {
    visible: boolean;
    onClose: () => void;
    language: 'fr' | 'vi';
}

const RatingModal: React.FC<RatingModalProps> = ({ visible, onClose, language }) => {
    const { theme } = useTheme();
    const [selectedRating, setSelectedRating] = useState(0);

    const handleRatingSubmit = () => {
        if (selectedRating === 0) {
            const message = language === 'fr'
                ? 'Veuillez sélectionner une note avant de continuer.'
                : 'Vui lòng chọn một đánh giá trước khi tiếp tục.';
            Alert.alert(
                language === 'fr' ? 'Attention' : 'Cảnh báo',
                message
            );
            return;
        }

        onClose();

        if (selectedRating >= 4) {
            // High rating - redirect to store
            const title = language === 'fr' ? 'Merci!' : 'Cảm ơn!';
            const message = language === 'fr'
                ? 'Merci pour votre excellente évaluation! Souhaitez-vous laisser un avis sur le store?'
                : 'Cảm ơn bạn đã đánh giá cao! Bạn có muốn để lại đánh giá trên cửa hàng không?';

            Alert.alert(title, message, [
                {
                    text: language === 'fr' ? 'Plus tard' : 'Để sau',
                    style: 'cancel',
                },
                {
                    text: language === 'fr' ? 'Oui' : 'Có',
                    onPress: () => {
                        // In a real app, this would open the appropriate store
                        const storeMessage = language === 'fr'
                            ? 'Redirection vers le store... (Fonctionnalité à implémenter)'
                            : 'Chuyển hướng đến cửa hàng... (Tính năng cần triển khai)';
                        Alert.alert('Info', storeMessage);
                    },
                },
            ]);
        } else {
            // Lower rating - ask for feedback
            const title = language === 'fr' ? 'Merci pour votre retour' : 'Cảm ơn phản hồi của bạn';
            const message = language === 'fr'
                ? 'Nous sommes désolés que l\'application ne réponde pas entièrement à vos attentes. Votre avis nous aide à l\'améliorer!'
                : 'Chúng tôi xin lỗi vì ứng dụng chưa đáp ứng hoàn toàn mong đợi của bạn. Ý kiến của bạn giúp chúng tôi cải thiện!';

            Alert.alert(title, message);
        }

        setSelectedRating(0);
    };

    const handleClose = () => {
        onClose();
        setSelectedRating(0);
    };

    const renderStars = () => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <TouchableOpacity
                    key={i}
                    onPress={() => setSelectedRating(i)}
                    style={styles.starButton}
                >
                    <Ionicons
                        name={i <= selectedRating ? 'star' : 'star-outline'}
                        size={40}
                        color={i <= selectedRating ? '#FFD700' : theme.colors.textMuted}
                    />
                </TouchableOpacity>
            );
        }
        return stars;
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={handleClose}
        >
            <View style={styles.modalOverlay}>
                <View style={[styles.modalContainer, { backgroundColor: theme.colors.card }]}>
                    <FormattedText style={[styles.modalTitle, { color: theme.colors.text }]}>
                        {language === 'fr' ? 'Évaluez cette application' : 'Đánh giá ứng dụng này'}
                    </FormattedText>

                    <FormattedText style={[styles.modalSubtitle, { color: theme.colors.textMuted }]}>
                        {language === 'fr'
                            ? 'Votre avis nous aide à améliorer l\'application'
                            : 'Ý kiến của bạn giúp chúng tôi cải thiện ứng dụng'
                        }
                    </FormattedText>

                    <View style={styles.starsContainer}>
                        {renderStars()}
                    </View>

                    <View style={styles.modalButtons}>
                        <TouchableOpacity
                            style={[styles.modalButton, styles.cancelButton, { backgroundColor: theme.colors.background }]}
                            onPress={handleClose}
                        >
                            <FormattedText style={[styles.cancelButtonText, { color: theme.colors.text }]}>
                                {language === 'fr' ? 'Annuler' : 'Hủy'}
                            </FormattedText>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.modalButton, styles.submitButton, { backgroundColor: theme.colors.primary }]}
                            onPress={handleRatingSubmit}
                        >
                            <FormattedText style={[styles.submitButtonText, { color: theme.colors.buttonText }]}>
                                {language === 'fr' ? 'Envoyer' : 'Gửi'}
                            </FormattedText>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        ...sharedStyles.modalOverlay,
    },
    modalContainer: {
        borderRadius: 20,
        padding: 30,
        alignItems: 'center',
        minWidth: 300,
        maxWidth: 350,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center',
    },
    modalSubtitle: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 30,
        lineHeight: 22,
    },
    starsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 30,
    },
    starButton: {
        padding: 5,
        marginHorizontal: 2,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    modalButton: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 10,
        alignItems: 'center',
        marginHorizontal: 5,
    },
    cancelButton: {
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.1)',
    },
    submitButton: {
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    submitButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
});

export default RatingModal;
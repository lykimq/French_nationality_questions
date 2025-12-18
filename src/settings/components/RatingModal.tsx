import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Modal, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../shared/contexts/ThemeContext';   
import { FormattedText } from '../../shared/components';
import { sharedStyles } from '../../shared/utils';
import { settingsStyles } from './settingsStyles';

interface RatingModalProps {
    visible: boolean;
    onClose: () => void;
}

const RatingModal: React.FC<RatingModalProps> = ({ visible, onClose }) => {
    const { theme } = useTheme();
    const [selectedRating, setSelectedRating] = useState(0);

    const handleRatingSubmit = () => {
        if (selectedRating === 0) {
            Alert.alert(
                'Attention',
                'Veuillez sélectionner une note avant de continuer.'
            );
            return;
        }

        onClose();

        if (selectedRating >= 4) {
            Alert.alert(
                'Merci!',
                'Merci pour votre excellente évaluation! Souhaitez-vous laisser un avis sur le store?',
                [
                    {
                        text: 'Plus tard',
                        style: 'cancel',
                    },
                    {
                        text: 'Oui',
                        onPress: () => {
                            Alert.alert('Info', 'Redirection vers le store... (Fonctionnalité à implémenter)');
                        },
                    },
                ]
            );
        } else {
            Alert.alert(
                'Merci pour votre retour',
                'Nous sommes désolés que l\'application ne réponde pas entièrement à vos attentes. Votre avis nous aide à l\'améliorer!'
            );
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
            <View style={sharedStyles.modalOverlay}>
                <View style={[settingsStyles.modalContainer, { backgroundColor: theme.colors.card }]}>
                    <FormattedText style={[settingsStyles.modalTitle, { color: theme.colors.text }]}>
                        Évaluez cette application
                    </FormattedText>

                    <FormattedText style={[settingsStyles.modalSubtitle, { color: theme.colors.textMuted }]}>
                        Votre avis nous aide à améliorer l'application
                    </FormattedText>

                    <View style={styles.starsContainer}>
                        {renderStars()}
                    </View>

                    <View style={styles.modalButtons}>
                        <TouchableOpacity
                            style={[settingsStyles.modalButton, styles.cancelButton, { backgroundColor: theme.colors.background }]}
                            onPress={handleClose}
                        >
                            <FormattedText style={[settingsStyles.modalButtonText, { color: theme.colors.text }]}>
                                Annuler
                            </FormattedText>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[settingsStyles.modalButton, styles.submitButton, { backgroundColor: theme.colors.primary }]}
                            onPress={handleRatingSubmit}
                        >
                            <FormattedText style={[settingsStyles.modalButtonText, { color: theme.colors.buttonText }]}>
                                Envoyer
                            </FormattedText>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
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
});

export default RatingModal;
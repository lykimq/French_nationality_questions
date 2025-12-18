import React from 'react';
import { View, Alert } from 'react-native';
import { useTheme } from '../../shared/contexts/ThemeContext';
import { useCivicExam } from '../../test_civic/hooks/useCivicExam';
import { FormattedText } from '../../shared/components';
import SettingItem from './SettingItem';
import { settingsStyles } from './settingsStyles';

const CivicExamSettings: React.FC = () => {
    const { theme } = useTheme();
    const { examProgress, resetProgress } = useCivicExam();

    const handleResetStatistics = () => {
        Alert.alert(
            'Réinitialiser les statistiques',
            'Êtes-vous sûr de vouloir réinitialiser toutes les statistiques de l\'examen civique ? Cette action est irréversible et supprimera tous vos scores, progrès et statistiques.',
            [
                {
                    text: 'Annuler',
                    style: 'cancel',
                },
                {
                    text: 'Réinitialiser',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            console.warn('🔄 RESET BUTTON CLICKED - Starting reset process...');
                            console.warn('📊 Current state before reset:', {
                                totalExamsTaken: examProgress.totalExamsTaken,
                                totalPracticeSessions: examProgress.totalPracticeSessions,
                                bestScore: examProgress.bestScore,
                                passedExams: examProgress.passedExams,
                            });
                            
                            await resetProgress();
                            
                            console.warn('✅ RESET COMPLETE - Check if numbers are now zero');
                            
                            Alert.alert(
                                'Réinitialisation réussie',
                                'Toutes les statistiques ont été réinitialisées.',
                                [{ 
                                    text: 'OK',
                                    onPress: () => {
                                        console.warn('✅ User confirmed reset success');
                                    }
                                }]
                            );
                        } catch (error) {
                            console.error('❌ ERROR resetting statistics:', error);
                            Alert.alert(
                                'Erreur',
                                'Une erreur est survenue lors de la réinitialisation.',
                                [{ text: 'OK' }]
                            );
                        }
                    },
                },
            ]
        );
    };

    const hasStatistics = examProgress.totalExamsTaken > 0 || 
                         examProgress.totalPracticeSessions > 0 ||
                         examProgress.bestScore > 0;

    if (!hasStatistics) {
        return null;
    }

    return (
        <View style={[settingsStyles.section, { backgroundColor: theme.colors.card }]}>
            <FormattedText style={[settingsStyles.sectionTitle, { color: theme.colors.textSecondary, borderBottomColor: theme.colors.divider }]}>
                Statistiques de l'examen civique
            </FormattedText>

            <SettingItem
                title="Réinitialiser les statistiques"
                icon={theme.icons.refresh}
                iconColor={theme.colors.error}
                onPress={handleResetStatistics}
            />
        </View>
    );
};

export default CivicExamSettings;


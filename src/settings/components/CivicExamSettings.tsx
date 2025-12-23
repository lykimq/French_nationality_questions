import React from 'react';
import { useTheme } from '../../shared/contexts/ThemeContext';
import { useCivicExam } from '../../test_civic/contexts/CivicExamContext';
import SettingItem from './SettingItem';
import CollapsibleSection from './CollapsibleSection';
import { showConfirmationAlert, showSimpleAlert } from '../../shared/utils';

const CivicExamSettings: React.FC = () => {
    const { theme } = useTheme();
    const { examProgress, resetProgress } = useCivicExam();

    const handleResetStatistics = () => {
        showConfirmationAlert({
            title: 'Réinitialiser les statistiques',
            message: 'Êtes-vous sûr de vouloir réinitialiser toutes les statistiques de l\'examen civique ? Cette action est irréversible et supprimera tous vos scores, progrès et statistiques.',
            confirmText: 'Réinitialiser',
            onConfirm: async () => {
                try {
                    await resetProgress();
                    showSimpleAlert({
                        title: 'Réinitialisation réussie',
                        message: 'Toutes les statistiques ont été réinitialisées.',
                    });
                } catch (error) {
                    showSimpleAlert({
                        title: 'Erreur',
                        message: 'Une erreur est survenue lors de la réinitialisation.',
                    });
                }
            },
        });
    };

    const hasStatistics = examProgress.totalExamsTaken > 0 || 
                         examProgress.totalPracticeSessions > 0 ||
                         examProgress.bestScore > 0;

    if (!hasStatistics) {
        return null;
    }

    return (
        <CollapsibleSection
            title="Statistiques de l'examen civique"
            icon={theme.icons.analytics}
            iconColor={theme.colors.warning}
        >
            <SettingItem
                title="Réinitialiser les statistiques"
                icon={theme.icons.refresh}
                iconColor={theme.colors.error}
                onPress={handleResetStatistics}
            />
        </CollapsibleSection>
    );
};

export default CivicExamSettings;


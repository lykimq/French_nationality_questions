import React from "react";
import { View } from "react-native";
import { useTheme } from "../../shared/contexts/ThemeContext";
import { useMastery } from "../../shared/contexts/MasteryContext";
import { useCivicExam } from "../../test_civic/contexts/CivicExamContext";
import SettingItem from "./SettingItem";
import CollapsibleSection from "./CollapsibleSection";
import { showConfirmationAlert, showSimpleAlert } from "../../shared/utils";
import { clearAllCaches } from "../../shared/services/dataService";

const ProgressSettings: React.FC = () => {
    const { theme } = useTheme();
    const { resetProgress: resetLearningProgress } = useMastery();
    const { resetProgress: resetExamProgress } = useCivicExam();

    const handleResetLearning = () => {
        showConfirmationAlert({
            title: "Réinitialiser la session",
            message:
                "Voulez-vous supprimer votre progression de lecture ? Vos réglages d'apparence seront conservés.",
            confirmText: "Réinitialiser",
            onConfirm: async () => {
                try {
                    await resetLearningProgress();
                    showSimpleAlert({
                        title: "Réinitialisé",
                        message: "Votre progression a été remise à zéro.",
                    });
                } catch (error) {
                    showSimpleAlert({
                        title: "Erreur",
                        message: "Impossible de réinitialiser la progression.",
                    });
                }
            },
        });
    };

    const handleResetExams = () => {
        showConfirmationAlert({
            title: "Réinitialiser les examens",
            message:
                "Voulez-vous supprimer tout votre historique d'examens et vos meilleurs scores ?",
            confirmText: "Réinitialiser",
            onConfirm: async () => {
                try {
                    await resetExamProgress();
                    showSimpleAlert({
                        title: "Réinitialisé",
                        message: "Vos statistiques d'examen ont été remises à zéro.",
                    });
                } catch (error) {
                    showSimpleAlert({
                        title: "Erreur",
                        message: "Impossible de réinitialiser les statistiques.",
                    });
                }
            },
        });
    };

    const handleClearCache = () => {
        showConfirmationAlert({
            title: "Vider le cache",
            message:
                "Cela va forcer l'application à recharger les dernières données et images depuis le serveur. Continuer ?",
            confirmText: "Vider le cache",
            onConfirm: async () => {
                try {
                    clearAllCaches();
                    showSimpleAlert({
                        title: "Cache vidé",
                        message: "Le cache a été vidé avec succès.",
                    });
                } catch (error) {
                    showSimpleAlert({
                        title: "Erreur",
                        message: "Impossible de vider le cache.",
                    });
                }
            },
        });
    };

    const handleResetEverything = () => {
        showConfirmationAlert({
            title: "TOUT RÉINITIALISER",
            message:
                "ATTENTION : Cette action va supprimer TOUTE votre progression (lecture ET examens). C'est un nouveau départ complet.",
            confirmText: "Tout supprimer",
            onConfirm: async () => {
                try {
                    await Promise.all([resetLearningProgress(), resetExamProgress()]);
                    clearAllCaches();
                    showSimpleAlert({
                        title: "Nouveau départ !",
                        message: "Toutes vos données ont été supprimées.",
                    });
                } catch (error) {
                    showSimpleAlert({
                        title: "Erreur",
                        message: "Une erreur est survenue lors de la réinitialisation complète.",
                    });
                }
            },
        });
    };

    return (
        <CollapsibleSection
            title="Données et Cache"
            icon={theme.icons.analytics}
            iconColor={theme.colors.error}
        >
            <SettingItem
                title="Vider le cache"
                subtitle="Recharger les données depuis le serveur"
                icon="refresh-outline"
                iconColor={theme.colors.info}
                onPress={handleClearCache}
            />
            <SettingItem
                title="Réinitialiser la lecture"
                subtitle="Remettre à zéro l'historique de lecture"
                icon={theme.icons.refresh}
                iconColor={theme.colors.warning}
                onPress={handleResetLearning}
            />
            <SettingItem
                title="Réinitialiser les examens"
                subtitle="Effacer l'historique des scores"
                icon={theme.icons.refresh}
                iconColor={theme.colors.error}
                onPress={handleResetExams}
            />
            <View style={{ height: 1, backgroundColor: theme.colors.divider, marginVertical: 8, opacity: 0.5 }} />
            <SettingItem
                title="Tout réinitialiser"
                subtitle="Remise à zéro complète de l'application"
                icon="trash-outline"
                iconColor={theme.colors.error}
                onPress={handleResetEverything}
            />
        </CollapsibleSection>
    );
};

export default ProgressSettings;

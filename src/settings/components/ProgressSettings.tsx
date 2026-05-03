import React from "react";
import { View } from "react-native";
import { useTheme } from "../../shared/contexts/ThemeContext";
import { useMastery } from "../../shared/contexts/MasteryContext";
import { useCivicExam } from "../../test_civic/contexts/CivicExamContext";
import SettingItem from "./SettingItem";
import CollapsibleSection from "./CollapsibleSection";
import { showConfirmationAlert, showSimpleAlert } from "../../shared/utils";

const ProgressSettings: React.FC = () => {
    const { theme } = useTheme();
    const { resetProgress: resetLearningProgress } = useMastery();
    const { resetProgress: resetExamProgress } = useCivicExam();

    const handleResetLearning = () => {
        showConfirmationAlert({
            title: "Réinitialiser l'apprentissage",
            message:
                "Voulez-vous supprimer toute votre progression d'apprentissage (badges orange) ? Vos réglages d'apparence seront conservés.",
            confirmText: "Réinitialiser",
            onConfirm: async () => {
                try {
                    await resetLearningProgress();
                    showSimpleAlert({
                        title: "Réinitialisé",
                        message: "Votre progression d'apprentissage a été remise à zéro.",
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

    const handleResetEverything = () => {
        showConfirmationAlert({
            title: "TOUT RÉINITIALISER",
            message:
                "ATTENTION : Cette action va supprimer TOUTE votre progression (apprentissage ET examens). C'est un nouveau départ complet.",
            confirmText: "Tout supprimer",
            onConfirm: async () => {
                try {
                    await Promise.all([resetLearningProgress(), resetExamProgress()]);
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
            title="Données et Progrès"
            icon={theme.icons.analytics}
            iconColor={theme.colors.error}
        >
            <SettingItem
                title="Réinitialiser l'apprentissage"
                subtitle="Effacer les badges orange et la maîtrise"
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

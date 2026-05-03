import React from "react";
import { useTheme } from "../../shared/contexts/ThemeContext";
import { useCivicExam } from "../../test_civic/contexts/CivicExamContext";
import SettingItem from "./SettingItem";
import CollapsibleSection from "./CollapsibleSection";
import { FormattedText } from "../../shared/components";
import { View, StyleSheet } from "react-native";

const CivicExamSettings: React.FC = () => {
    const { theme } = useTheme();
    const { examProgress } = useCivicExam();

    const hasStatistics =
        examProgress.totalExamsTaken > 0 ||
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
            <View style={styles.statsContainer}>
                <View style={styles.statRow}>
                    <FormattedText style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                        Examens terminés
                    </FormattedText>
                    <FormattedText style={[styles.statValue, { color: theme.colors.text }]}>
                        {examProgress.totalExamsTaken}
                    </FormattedText>
                </View>
                <View style={styles.statRow}>
                    <FormattedText style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                        Meilleur score
                    </FormattedText>
                    <FormattedText style={[styles.statValue, { color: theme.colors.success }]}>
                        {examProgress.bestScore}/20
                    </FormattedText>
                </View>
                <View style={styles.statRow}>
                    <FormattedText style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                        Sessions d'entraînement
                    </FormattedText>
                    <FormattedText style={[styles.statValue, { color: theme.colors.text }]}>
                        {examProgress.totalPracticeSessions}
                    </FormattedText>
                </View>
            </View>
        </CollapsibleSection>
    );
};

const styles = StyleSheet.create({
    statsContainer: {
        paddingVertical: 8,
    },
    statRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 8,
    },
    statLabel: {
        fontSize: 14,
    },
    statValue: {
        fontSize: 14,
        fontWeight: "bold",
    },
});

export default CivicExamSettings;

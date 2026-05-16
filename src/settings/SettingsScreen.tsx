import { StyleSheet, View, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../shared/contexts/ThemeContext";
import { useRatingPrompt } from "../shared/hooks";
import { AppHeader } from "../shared/components";
import { sharedStyles } from "../shared/utils";

import TextFormattingSettings from "./components/TextFormattingSettings";
import ThemeSettings from "./components/ThemeSettings";
import AppInfoSettings from "./components/AppInfoSettings";
import AboutAppSettings from "./components/AboutAppSettings";
import CivicExamSettings from "./components/CivicExamSettings";
import CollapsibleSection from "./components/CollapsibleSection";
import ProgressSettings from "./components/ProgressSettings";
import AudioSettings from "./components/AudioSettings";

const SettingsScreen = () => {
    const { theme } = useTheme();
    const { openRatingModal } = useRatingPrompt();

    return (
        <View
            style={[
                styles.container,
                { backgroundColor: theme.colors.background },
            ]}
        >
            <AppHeader title="Paramètres" showTricolore={true} />

            <SafeAreaView style={styles.safeArea} edges={[]}>
                <ScrollView
                    style={[
                        styles.scrollView,
                        { backgroundColor: theme.colors.background },
                    ]}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <CollapsibleSection
                        title="Apparence"
                        icon={theme.icons.palette}
                        iconColor={theme.colors.primary}
                    >
                        <ThemeSettings />
                    </CollapsibleSection>

                    <CollapsibleSection
                        title="Formatage du texte"
                        icon={theme.icons.textFormat}
                        iconColor={theme.colors.accent}
                    >
                        <TextFormattingSettings />
                    </CollapsibleSection>

                    <CollapsibleSection
                        title="Synthèse vocale"
                        icon="volume-high"
                        iconColor={theme.colors.info}
                    >
                        <AudioSettings />
                    </CollapsibleSection>

                    <CivicExamSettings />

                    <ProgressSettings />

                    <CollapsibleSection
                        title="À propos de l'application"
                        icon="help-circle"
                        iconColor={theme.colors.primary}
                    >
                        <AboutAppSettings />
                    </CollapsibleSection>

                    <CollapsibleSection
                        title="Autres options"
                        icon={theme.icons.info}
                        iconColor={theme.colors.info}
                    >
                        <AppInfoSettings onRateApp={openRatingModal} />
                    </CollapsibleSection>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: sharedStyles.container,
    safeArea: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 100,
    },
});

export default SettingsScreen;

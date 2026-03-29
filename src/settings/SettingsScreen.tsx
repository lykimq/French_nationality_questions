import { useState } from 'react';
import {
    StyleSheet,
    View,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../shared/contexts/ThemeContext';
import { FormattedText, AppHeader } from '../shared/components';
import { sharedStyles } from '../shared/utils';

import TextFormattingSettings from './components/TextFormattingSettings';
import ThemeSettings from './components/ThemeSettings';
import AppInfoSettings from './components/AppInfoSettings';
import AboutAppSettings from './components/AboutAppSettings';
import CivicExamSettings from './components/CivicExamSettings';
import RatingModal from './components/RatingModal';
import CollapsibleSection from './components/CollapsibleSection';

const SettingsScreen = () => {
    const { theme } = useTheme();
    const [showRatingModal, setShowRatingModal] = useState(false);

    const handleRateApp = () => {
        setShowRatingModal(true);
    };

    const handleCloseRatingModal = () => {
        setShowRatingModal(false);
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <AppHeader
                title="Paramètres"
                showTricolore={true}
            />

            <SafeAreaView style={styles.safeArea} edges={[]}>

            <ScrollView 
                style={[styles.scrollView, { backgroundColor: theme.colors.background }]}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Theme Section */}
                <CollapsibleSection
                    title="Apparence"
                    icon={theme.icons.palette}
                    iconColor={theme.colors.primary}
                >
                    <ThemeSettings />
                </CollapsibleSection>

                {/* Text Formatting Section */}
                <CollapsibleSection
                    title="Formatage du texte"
                    icon={theme.icons.textFormat}
                    iconColor={theme.colors.accent}
                >
                    <TextFormattingSettings />
                </CollapsibleSection>

                {/* Civic Exam Statistics Section */}
                <CivicExamSettings />

                {/* About the App Section */}
                <CollapsibleSection
                    title="À propos de l'application"
                    icon="help-circle"
                    iconColor={theme.colors.primary}
                >
                    <AboutAppSettings />
                </CollapsibleSection>

                {/* App Info Section */}
                <CollapsibleSection
                    title="Autres options"
                    icon={theme.icons.info}
                    iconColor={theme.colors.info}
                >
                    <AppInfoSettings onRateApp={handleRateApp} />
                </CollapsibleSection>
            </ScrollView>

            {/* Rating Modal */}
            <RatingModal
                visible={showRatingModal}
                onClose={handleCloseRatingModal}
            />
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
        padding: 12,
        paddingBottom: 100,
    },
});

export default SettingsScreen;
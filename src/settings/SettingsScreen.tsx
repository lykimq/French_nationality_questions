import React, { useState } from 'react';
import {
    StyleSheet,
    View,
    ScrollView,
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../shared/contexts/ThemeContext';
import { FormattedText } from '../shared/components';
import { sharedStyles } from '../shared/utils';

// Import new components
import TextFormattingSettings from './components/TextFormattingSettings';
import ThemeSettings from './components/ThemeSettings';
import AppInfoSettings from './components/AppInfoSettings';
import CivicExamSettings from './components/CivicExamSettings';
import RatingModal from './components/RatingModal';
import CollapsibleSection from './components/CollapsibleSection';

const SettingsScreen = () => {
    const { theme, themeMode } = useTheme();
    const [showRatingModal, setShowRatingModal] = useState(false);

    const handleRateApp = () => {
        setShowRatingModal(true);
    };

    const handleCloseRatingModal = () => {
        setShowRatingModal(false);
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <StatusBar barStyle={themeMode === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={theme.colors.headerBackground} />

            <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.headerBackground }]} edges={['top']}>
                <View style={[styles.header, { backgroundColor: theme.colors.headerBackground }]}>
                    <FormattedText style={[styles.title, { color: theme.colors.headerText }]}>
                        Paramètres
                    </FormattedText>
                </View>
            </SafeAreaView>

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
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        ...sharedStyles.container,
    },
    safeArea: {
        // backgroundColor will be set dynamically
    },
    header: {
        ...sharedStyles.header,
        paddingTop: 10,
        paddingBottom: 12,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 12,
    },
});

export default SettingsScreen;
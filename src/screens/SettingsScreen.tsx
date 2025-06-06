import React, { useState } from 'react';
import {
    StyleSheet,
    View,
    Switch,
    ScrollView,
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import FormattedText from '../components/FormattedText';
import { sharedStyles } from '../utils/sharedStyles';

// Import new components
import { useDisplaySettings } from '../components/settings/DisplaySettingsContext';
import TextFormattingSettings from '../components/settings/TextFormattingSettings';
import ThemeSettings from '../components/settings/ThemeSettings';
import IconSettings from '../components/settings/IconSettings';
import AppInfoSettings from '../components/settings/AppInfoSettings';
import RatingModal from '../components/settings/RatingModal';

const SettingsScreen = () => {
    const { language, toggleLanguage } = useLanguage();
    const { isSlideMode, toggleSlideMode } = useDisplaySettings();
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
                        {language === 'fr' ? 'Paramètres' : 'Cài đặt'}
                    </FormattedText>
                    <View style={styles.languageSelector}>
                        <FormattedText style={[styles.languageLabel, { color: theme.colors.headerText }]}>FR</FormattedText>
                        <Switch
                            value={language === 'vi'}
                            onValueChange={toggleLanguage}
                            thumbColor={theme.colors.switchThumb}
                            trackColor={{ false: theme.colors.primaryLight, true: theme.colors.primaryLight }}
                        />
                        <FormattedText style={[styles.languageLabel, { color: theme.colors.headerText }]}>VI</FormattedText>
                    </View>
                </View>
            </SafeAreaView>

            <ScrollView style={[styles.scrollView, { backgroundColor: theme.colors.background }]}>
                {/* Theme Section */}
                <ThemeSettings language={language} />

                {/* Icon Settings */}
                <IconSettings language={language} />

                {/* Text Formatting Section */}
                <TextFormattingSettings language={language} />

                {/* App Info Section */}
                <AppInfoSettings language={language} onRateApp={handleRateApp} />
            </ScrollView>

            {/* Rating Modal */}
            <RatingModal
                visible={showRatingModal}
                onClose={handleCloseRatingModal}
                language={language}
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
        paddingBottom: 15,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    languageSelector: {
        ...sharedStyles.languageSelector,
    },
    languageLabel: {
        ...sharedStyles.languageLabel,
        marginHorizontal: 5,
    },
    scrollView: {
        flex: 1,
    },
});

// Export the DisplaySettingsProvider and useDisplaySettings for backward compatibility
export { DisplaySettingsProvider, useDisplaySettings } from '../components/settings/DisplaySettingsContext';

export default SettingsScreen;
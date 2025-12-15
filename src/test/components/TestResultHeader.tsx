import React from 'react';
import { View, TouchableOpacity, Switch, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../../shared/contexts/ThemeContext';   
import { useLanguage } from '../../shared/contexts/LanguageContext';
import { useIcons } from '../../shared/contexts/IconContext';
import { FormattedText } from '../../shared/components';
import { sharedStyles } from '../../shared/utils';

interface TestResultHeaderProps {
    onClose: () => void;
}

const TestResultHeader: React.FC<TestResultHeaderProps> = ({ onClose }) => {
    const { theme } = useTheme();
    const { language, toggleLanguage } = useLanguage();
    const { getIconName } = useIcons();

    return (
        <View style={[styles.header, { backgroundColor: theme.colors.headerBackground }]}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name={getIconName('close') as any} size={24} color={theme.colors.headerText} />
            </TouchableOpacity>

            <View style={styles.headerCenter}>
                <FormattedText style={[styles.headerTitle, { color: theme.colors.headerText }]}>
                    {language === 'fr' ? 'Résultats du Test' : 'Kết quả bài kiểm tra'}
                </FormattedText>
            </View>

            <View style={styles.languageSelector}>
                <FormattedText style={[styles.languageLabel, { color: theme.colors.headerText }]}>FR</FormattedText>
                <Switch
                    value={language === 'vi'}
                    onValueChange={toggleLanguage}
                    thumbColor={theme.colors.switchThumb}
                    trackColor={{ false: theme.colors.primaryLight, true: theme.colors.primaryLight }}
                    style={styles.languageSwitch}
                />
                <FormattedText style={[styles.languageLabel, { color: theme.colors.headerText }]}>VI</FormattedText>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        ...sharedStyles.header,
    },
    closeButton: {
        ...sharedStyles.backButton,
    },
    headerCenter: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    languageSelector: {
        ...sharedStyles.languageSelector,
    },
    languageLabel: {
        ...sharedStyles.languageLabel,
        fontSize: 12,
    },
    languageSwitch: {
        transform: [{ scale: 0.75 }],
    },
});

export default TestResultHeader;
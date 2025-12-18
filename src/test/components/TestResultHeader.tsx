import React from 'react';
import { View, TouchableOpacity, Switch, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../../shared/contexts/ThemeContext';   
import { useIcons } from '../../shared/contexts/IconContext';
import { FormattedText } from '../../shared/components';
import { sharedStyles } from '../../shared/utils';

interface TestResultHeaderProps {
    onClose: () => void;
}

const TestResultHeader: React.FC<TestResultHeaderProps> = ({ onClose }) => {
    const { theme } = useTheme();
    const { getIconName } = useIcons();

    return (
        <View style={[styles.header, { backgroundColor: theme.colors.headerBackground }]}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name={getIconName('close') as any} size={24} color={theme.colors.headerText} />
            </TouchableOpacity>

            <View style={styles.headerCenter}>
                <FormattedText style={[styles.headerTitle, { color: theme.colors.headerText }]}>
                    Résultats du Test
                </FormattedText>
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
});

export default TestResultHeader;
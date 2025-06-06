import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useIcons } from '../../contexts/IconContext';
import IconSelector from '../IconSelector';
import JsonIconSelector from '../JsonIconSelector';
import FormattedText from '../FormattedText';
import { sharedStyles } from '../../utils/sharedStyles';

interface IconSettingsProps {
    language: 'fr' | 'vi';
}

const IconSettings: React.FC<IconSettingsProps> = ({ language }) => {
    const { theme } = useTheme();
    const { iconSet, setIconSet, jsonIconSet, setJsonIconSet } = useIcons();

    return (
        <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
            <FormattedText style={[styles.sectionTitle, { color: theme.colors.textSecondary, borderBottomColor: theme.colors.divider }]}>
                {language === 'fr' ? 'Icônes' : 'Biểu tượng'}
            </FormattedText>

            {/* Icon Set Selector */}
            <IconSelector
                title="Style d'icônes"
                title_vi="Kiểu biểu tượng"
                language={language}
                value={iconSet}
                onValueChange={setIconSet}
            />

            {/* JSON Category Icon Set Selector */}
            <JsonIconSelector
                title="Style des icônes de catégories"
                title_vi="Kiểu biểu tượng danh mục"
                language={language}
                value={jsonIconSet}
                onValueChange={setJsonIconSet}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    section: {
        ...sharedStyles.section,
        ...sharedStyles.lightShadow,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        paddingHorizontal: 15,
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
});

export default IconSettings;
import React from 'react';
import { View } from 'react-native';
import { useTheme } from '../../shared/contexts/ThemeContext';
import { useIcons } from '../../shared/contexts/IconContext';
import IconSelector from './IconSelector';
import JsonIconSelector from './JsonIconSelector';
import { FormattedText } from '../../shared/components';
import { settingsStyles } from './settingsStyles';

const IconSettings: React.FC = () => {
    const { theme } = useTheme();
    const { iconSet, setIconSet, jsonIconSet, setJsonIconSet } = useIcons();

    return (
        <View style={[settingsStyles.section, { backgroundColor: theme.colors.card }]}>
            <FormattedText style={[settingsStyles.sectionTitle, { color: theme.colors.textSecondary, borderBottomColor: theme.colors.divider }]}>
                Icônes
            </FormattedText>

            {/* Icon Set Selector */}
            <IconSelector
                title="Style d'icônes"
                value={iconSet}
                onValueChange={setIconSet}
            />

            {/* JSON Category Icon Set Selector */}
            <JsonIconSelector
                title="Style des icônes de catégories"
                value={jsonIconSet}
                onValueChange={setJsonIconSet}
            />
        </View>
    );
};

export default IconSettings;
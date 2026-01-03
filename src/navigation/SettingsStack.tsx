import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '../shared/contexts/ThemeContext';
import SettingsScreen from '../settings/SettingsScreen';
import LegalDocumentScreen from '../settings/screens/LegalDocumentScreen';

const Stack = createNativeStackNavigator();

const SettingsStack = () => {
    const { theme } = useTheme();

    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: theme.colors.background }
            }}
        >
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="LegalDocument" component={LegalDocumentScreen} />
        </Stack.Navigator>
    );
};

export default SettingsStack;


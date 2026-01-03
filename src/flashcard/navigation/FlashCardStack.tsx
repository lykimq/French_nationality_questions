import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CategorySelectionScreen, FlashCardScreen } from '../screens';
import { useTheme } from '../../shared/contexts/ThemeContext';

export type FlashCardStackParamList = {
    CategorySelection: undefined;
    FlashCard: { categoryId: string };
};

const Stack = createNativeStackNavigator<FlashCardStackParamList>();

const FlashCardStack = () => {
    const { theme } = useTheme();

    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: theme.colors.background },
            }}
        >
            <Stack.Screen
                name="CategorySelection"
                component={CategorySelectionScreen}
            />
            <Stack.Screen
                name="FlashCard"
                component={FlashCardScreen}
            />
        </Stack.Navigator>
    );
};

export default FlashCardStack;


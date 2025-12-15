import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../welcome/HomeScreen';
import CategoryQuestionsScreen from '../welcome/CategoryQuestionsScreen';
import CategoryBasedQuestionsScreen from '../welcome/CategoryBasedQuestionsScreen';
import { useTheme } from '../shared/contexts/ThemeContext';

const Stack = createNativeStackNavigator();

const HomeStack = () => {
    const { theme } = useTheme();

    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: theme.colors.background }
            }}
        >
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="CategoryQuestions" component={CategoryQuestionsScreen} />
            <Stack.Screen name="CategoryBasedQuestions" component={CategoryBasedQuestionsScreen} />
        </Stack.Navigator>
    );
};

export default HomeStack;


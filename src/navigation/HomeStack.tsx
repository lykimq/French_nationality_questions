import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../features/welcome/screens/HomeScreen';
import CategoryQuestionsScreen from '../features/welcome/screens/CategoryQuestionsScreen';
import CategoryBasedQuestionsScreen from '../features/welcome/screens/CategoryBasedQuestionsScreen';
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


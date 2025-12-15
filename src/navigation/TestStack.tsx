import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import TestScreen from '../test/TestScreen';
import SubcategoryTestScreen from '../test/SubcategoryTestScreen';
import ConversationTestScreen from '../test/ConversationTestScreen';
import TestQuestionScreen from '../test/TestQuestionScreen';
import TestResultScreen from '../test/TestResultScreen';
import ProgressScreen from '../test/ProgressScreen';
import ReviewScreen from '../test/ReviewScreen';
import { useTheme } from '../shared/contexts/ThemeContext';

const Stack = createNativeStackNavigator();

const TestStack = () => {
    const { theme } = useTheme();

    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: theme.colors.background }
            }}
        >
            <Stack.Screen name="Test" component={TestScreen} />
            <Stack.Screen name="SubcategoryTest" component={SubcategoryTestScreen} />
            <Stack.Screen name="ConversationTest" component={ConversationTestScreen} />
            <Stack.Screen
                name="TestQuestion"
                component={TestQuestionScreen}
                options={{
                    gestureEnabled: false,
                }}
            />
            <Stack.Screen
                name="TestResult"
                component={TestResultScreen}
                options={{
                    gestureEnabled: false,
                    headerLeft: () => null, // Disable the back button
                }}
            />
            <Stack.Screen name="Progress" component={ProgressScreen} />
            <Stack.Screen name="Review" component={ReviewScreen} />
        </Stack.Navigator>
    );
};

export default TestStack;


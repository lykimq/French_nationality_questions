import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import CivicExamHomeScreen from '../screens/CivicExamHomeScreen';
import CivicExamInfoScreen from '../screens/CivicExamInfoScreen';
import CivicExamPracticeScreen from '../screens/CivicExamPracticeScreen';
import CivicExamQuestionScreen from '../screens/CivicExamQuestionScreen';
import CivicExamReviewScreen from '../screens/CivicExamReviewScreen';
import CivicExamResultScreen from '../screens/CivicExamResultScreen';
import { useTheme } from '../../shared/contexts/ThemeContext';
import type { CivicExamStackParamList } from '../types';

const Stack = createNativeStackNavigator<CivicExamStackParamList>();

const CivicExamStack = () => {
    const { theme } = useTheme();

    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: theme.colors.background }
            }}
        >
            <Stack.Screen name="CivicExamHome" component={CivicExamHomeScreen} />
            <Stack.Screen
                name="CivicExamInfo"
                component={CivicExamInfoScreen}
            />
            <Stack.Screen
                name="CivicExamPractice"
                component={CivicExamPracticeScreen}
            />
            <Stack.Screen
                name="CivicExamQuestion"
                component={CivicExamQuestionScreen}
                options={{
                    gestureEnabled: false,
                }}
            />
            <Stack.Screen
                name="CivicExamReview"
                component={CivicExamReviewScreen}
                options={{
                    gestureEnabled: false,
                }}
            />
            <Stack.Screen
                name="CivicExamResult"
                component={CivicExamResultScreen}
                options={{
                    gestureEnabled: false,
                }}
            />
        </Stack.Navigator>
    );
};

export default CivicExamStack;


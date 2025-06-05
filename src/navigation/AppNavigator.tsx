import React from 'react';
import { Platform, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from '../screens/HomeScreen';
import CategoryQuestionsScreen from '../screens/CategoryQuestionsScreen';
import CategoryBasedQuestionsScreen from '../screens/CategoryBasedQuestionsScreen';
import SearchScreen from '../screens/SearchScreen';
import SettingsScreen from '../screens/SettingsScreen';
import TestScreen from '../screens/TestScreen';
import SubcategoryTestScreen from '../screens/SubcategoryTestScreen';
import Part1TestScreen from '../screens/Part1TestScreen';
import TestQuestionScreen from '../screens/TestQuestionScreen';
import TestResultScreen from '../screens/TestResultScreen';
import ProgressScreen from '../screens/ProgressScreen';
import ReviewScreen from '../screens/ReviewScreen';
import DataLoadingScreen from '../components/DataLoadingScreen';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

// Create navigators
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Set StatusBar for Android
if (Platform.OS === 'android') {
    StatusBar.setTranslucent(true);
    StatusBar.setBackgroundColor('transparent');
}

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
            <Stack.Screen name="Part1Test" component={Part1TestScreen} />
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

// Translations for tab labels
const tabLabels = {
    fr: {
        home: 'Accueil',
        search: 'Rechercher',
        test: 'Tests',
        settings: 'Paramètres'
    },
    vi: {
        home: 'Trang chủ',
        search: 'Tìm kiếm',
        test: 'Bài kiểm tra',
        settings: 'Cài đặt'
    }
};

// Define types for the route and navigation icon props
type TabBarIconProps = {
    focused: boolean;
    color: string;
    size: number;
};

type RouteType = {
    name: string;
};

const AppTabs = () => {
    // Use the language context to get the current language and loading state
    const { language, isDataLoading, dataLoadingError } = useLanguage();
    const { theme } = useTheme();

    // Show loading screen while data is being loaded
    if (isDataLoading || dataLoadingError) {
        return <DataLoadingScreen error={dataLoadingError} />;
    }

    return (
        <Tab.Navigator
            screenOptions={({ route }: { route: RouteType }) => ({
                headerShown: false,
                tabBarShowLabel: true,
                tabBarIcon: ({ focused, color, size }: TabBarIconProps) => {
                    let iconName: string;

                    if (route.name === 'HomeTab') {
                        iconName = focused ? theme.icons.home : theme.icons.home;
                    } else if (route.name === 'SearchTab') {
                        iconName = focused ? theme.icons.search : theme.icons.search;
                    } else if (route.name === 'TestTab') {
                        iconName = focused ? 'school' : 'school-outline';
                    } else if (route.name === 'SettingsTab') {
                        iconName = focused ? theme.icons.settings : theme.icons.settings;
                    } else {
                        iconName = 'help-circle-outline'; // Default icon
                    }

                    return <Ionicons name={iconName as any} size={size} color={color} />;
                },
                tabBarActiveTintColor: theme.colors.primary,
                tabBarInactiveTintColor: theme.colors.textMuted,
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '500',
                },
                tabBarStyle: {
                    backgroundColor: theme.colors.surface,
                    borderTopColor: theme.colors.border,
                    paddingVertical: 5,
                    height: 60,
                    elevation: 8,
                    shadowOpacity: 0.1,
                    shadowRadius: 3,
                    shadowOffset: { width: 0, height: -3 },
                },
            })}
        >
            <Tab.Screen
                name="HomeTab"
                component={HomeStack}
                options={{ title: tabLabels[language].home }}
            />
            <Tab.Screen
                name="SearchTab"
                component={SearchScreen}
                options={{ title: tabLabels[language].search }}
            />
            <Tab.Screen
                name="TestTab"
                component={TestStack}
                options={{ title: tabLabels[language].test }}
            />
            <Tab.Screen
                name="SettingsTab"
                component={SettingsScreen}
                options={{ title: tabLabels[language].settings }}
            />
        </Tab.Navigator>
    );
};

// Simplified AppNavigator without LanguageProvider since it's now in App.tsx
const AppNavigator = () => (
    <NavigationContainer>
        <AppTabs />
    </NavigationContainer>
);

export default AppNavigator;
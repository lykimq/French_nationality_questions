import React from 'react';
import { Platform, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from '../screens/HomeScreen';
import CategoryQuestionsScreen from '../screens/CategoryQuestionsScreen';
import SearchScreen from '../screens/SearchScreen';
import SettingsScreen from '../screens/SettingsScreen';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

// Set StatusBar for Android
if (Platform.OS === 'android') {
    StatusBar.setTranslucent(true);
    StatusBar.setBackgroundColor('transparent');
}

const HomeStack = () => (
    <Stack.Navigator
        screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#F5F5F5' }
        }}
    >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="CategoryQuestions" component={CategoryQuestionsScreen} />
    </Stack.Navigator>
);

const AppTabs = () => (
    <Tab.Navigator
        screenOptions={({ route }) => ({
            headerShown: false,
            tabBarShowLabel: true,
            tabBarIcon: ({ focused, color, size }) => {
                let iconName;

                if (route.name === 'HomeTab') {
                    iconName = focused ? 'home' : 'home-outline';
                } else if (route.name === 'SearchTab') {
                    iconName = focused ? 'search' : 'search-outline';
                } else if (route.name === 'SettingsTab') {
                    iconName = focused ? 'settings' : 'settings-outline';
                }

                return <Ionicons name={iconName as any} size={size} color={color} />;
            },
            tabBarActiveTintColor: '#3F51B5',
            tabBarInactiveTintColor: 'gray',
            tabBarLabelStyle: {
                fontSize: 12,
                fontWeight: '500',
            },
            tabBarStyle: {
                backgroundColor: '#fff',
                borderTopColor: '#f1f1f1',
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
            options={{ title: 'Accueil' }}
        />
        <Tab.Screen
            name="SearchTab"
            component={SearchScreen}
            options={{ title: 'Rechercher' }}
        />
        <Tab.Screen
            name="SettingsTab"
            component={SettingsScreen}
            options={{ title: 'Paramètres' }}
        />
    </Tab.Navigator>
);

const AppNavigator = () => (
    <NavigationContainer>
        <AppTabs />
    </NavigationContainer>
);

export default AppNavigator;
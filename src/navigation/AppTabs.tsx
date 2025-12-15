import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import HomeStack from './HomeStack';
import SearchScreen from '../search/SearchScreen';
import TestStack from './TestStack';
import SettingsScreen from '../settings/SettingsScreen';
import { DataLoadingScreen } from '../shared/components';
import { useLanguage } from '../shared/contexts/LanguageContext';
import { useTheme } from '../shared/contexts/ThemeContext';
import type { TabBarIconProps, RouteType } from '../types';

const Tab = createBottomTabNavigator();

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

const AppTabs = () => {
    const { language, isDataLoading, dataLoadingError } = useLanguage();
    const { theme } = useTheme();

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
                        iconName = 'help-circle-outline';
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

export default AppTabs;


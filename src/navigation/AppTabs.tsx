import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import HomeStack from './HomeStack';
import SearchScreen from '../search/SearchScreen';
import CivicExamStack from '../test_civic/navigation/CivicExamStack';
import FlashCardStack from '../flashcard/navigation/FlashCardStack';
import SettingsStack from './SettingsStack';
import { DataLoadingScreen, Icon3D } from '../shared/components';
import { useData } from '../shared/contexts/DataContext';
import { useTheme } from '../shared/contexts/ThemeContext';
import { useIcons } from '../shared/contexts/IconContext';
import type { TabBarIconProps } from '../types';

const Tab = createBottomTabNavigator();

const tabLabels = {
    home: 'Accueil',
    search: 'Rechercher',
    flashcard: 'Cartes Flash',
    settings: 'Paramètres'
};

const AppTabs = () => {
    const { isDataLoading, dataLoadingError } = useData();
    const { theme } = useTheme();
    const { getIconName, getIconVariant } = useIcons();

    if (isDataLoading || dataLoadingError) {
        return <DataLoadingScreen error={dataLoadingError} />;
    }

    const renderTabIcon = (iconKey: 'home' | 'search' | 'settings', focused: boolean, color: string) => {
        const iconName = getIconName(iconKey);
        const variant = getIconVariant(iconKey);
        
        return (
            <Icon3D
                name={iconName}
                size={18}
                color={color}
                variant={focused ? variant : 'default'}
            />
        );
    };

    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarShowLabel: true,
                tabBarActiveTintColor: theme.colors.primary,
                tabBarInactiveTintColor: theme.colors.textMuted,
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: '500',
                    marginTop: 2,
                },
                tabBarIconStyle: {
                    marginTop: 4,
                },
                tabBarStyle: {
                    backgroundColor: theme.colors.surface,
                    borderTopColor: theme.colors.border,
                    borderTopWidth: 1,
                    paddingTop: 8,
                    paddingBottom: 6,
                    height: 65,
                    elevation: 8,
                    shadowOpacity: 0.1,
                    shadowRadius: 3,
                    shadowOffset: { width: 0, height: -3 },
                },
            }}
        >
            <Tab.Screen
                name="HomeTab"
                component={HomeStack}
                options={{
                    title: tabLabels.home,
                    tabBarIcon: ({ focused, color }: TabBarIconProps) => 
                        renderTabIcon('home', focused, color),
                }}
            />
            <Tab.Screen
                name="SearchTab"
                component={SearchScreen}
                options={{
                    title: tabLabels.search,
                    tabBarIcon: ({ focused, color }: TabBarIconProps) => 
                        renderTabIcon('search', focused, color),
                }}
            />
            <Tab.Screen
                name="CivicExamTab"
                component={CivicExamStack}
                options={{
                    title: 'Examen Civique',
                    tabBarIcon: ({ focused, color }: TabBarIconProps) => (
                        <Icon3D
                            name="document-text"
                            size={18}
                            color={color}
                            variant={focused ? 'gradient' : 'default'}
                        />
                    ),
                }}
            />
            <Tab.Screen
                name="FlashCardTab"
                component={FlashCardStack}
                options={{
                    title: tabLabels.flashcard,
                    tabBarIcon: ({ focused, color }: TabBarIconProps) => (
                        <Icon3D
                            name="school"
                            size={18}
                            color={color}
                            variant={focused ? 'gradient' : 'default'}
                        />
                    ),
                }}
            />
            <Tab.Screen
                name="SettingsTab"
                component={SettingsStack}
                options={{
                    title: tabLabels.settings,
                    tabBarIcon: ({ focused, color }: TabBarIconProps) => 
                        renderTabIcon('settings', focused, color),
                }}
            />
        </Tab.Navigator>
    );
};

export default AppTabs;

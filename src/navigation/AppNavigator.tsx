import React from 'react';
import { Platform, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';

import AppTabs from './AppTabs';

// Set StatusBar for Android
if (Platform.OS === 'android') {
    StatusBar.setTranslucent(true);
    StatusBar.setBackgroundColor('transparent');
}

const AppNavigator = () => (
    <NavigationContainer>
        <AppTabs />
    </NavigationContainer>
);

export default AppNavigator;
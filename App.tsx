import React from 'react';
import { StyleSheet, Platform, ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  useFonts,
  Kalam_400Regular,
} from '@expo-google-fonts/kalam';
import { PatrickHand_400Regular } from '@expo-google-fonts/patrick-hand';
import { DancingScript_400Regular } from '@expo-google-fonts/dancing-script';
import AppNavigator from './src/navigation/AppNavigator';
import AppProviders from './src/shared/providers/AppProviders';

export default function App() {
  const [fontsLoaded] = useFonts({
    Kalam: Kalam_400Regular,
    PatrickHand: PatrickHand_400Regular,
    DancingScript: DancingScript_400Regular,
  });

  // On web, proceed even if fonts aren't loaded to avoid blocking the app
  // Fonts will load asynchronously and apply when ready
  if (!fontsLoaded && Platform.OS !== 'web') {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <AppProviders>
          <AppNavigator />
        </AppProviders>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
});

import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  useFonts,
  Kalam_400Regular,
} from '@expo-google-fonts/kalam';
import { PatrickHand_400Regular } from '@expo-google-fonts/patrick-hand';
import { DancingScript_400Regular } from '@expo-google-fonts/dancing-script';
import AppNavigator from './src/navigation/AppNavigator';
import { DisplaySettingsProvider } from './src/screens/SettingsScreen';
import { TextFormattingProvider } from './src/contexts/TextFormattingContext';
import { ThemeProvider } from './src/contexts/ThemeContext';

// Suppress React 19 useInsertionEffect warnings for icon libraries
const originalConsoleWarn = console.warn;
console.warn = (...args) => {
  const message = args[0];
  if (typeof message === 'string' && message.includes('useInsertionEffect must not schedule updates')) {
    return; // Suppress this specific warning
  }
  originalConsoleWarn.apply(console, args);
};

export default function App() {
  const [fontsLoaded] = useFonts({
    Kalam: Kalam_400Regular,
    PatrickHand: PatrickHand_400Regular,
    DancingScript: DancingScript_400Regular,
  });

  if (!fontsLoaded) {
    return null; // Return null while fonts are loading
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <ThemeProvider>
          <TextFormattingProvider>
            <DisplaySettingsProvider>
              <AppNavigator />
            </DisplaySettingsProvider>
          </TextFormattingProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

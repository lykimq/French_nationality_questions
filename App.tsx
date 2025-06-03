import React from 'react';
import { StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AppNavigator from './src/navigation/AppNavigator';
import { DisplaySettingsProvider } from './src/screens/SettingsScreen';
import { TextFormattingProvider } from './src/contexts/TextFormattingContext';

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
  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <TextFormattingProvider>
          <DisplaySettingsProvider>
            <StatusBar style="light" />
            <AppNavigator />
          </DisplaySettingsProvider>
        </TextFormattingProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

import React from "react";
import { StyleSheet } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { initializeSentry } from "./src/config/sentryConfig";
import AppNavigator from "./src/navigation/AppNavigator";
import AppProviders from "./src/shared/providers/AppProviders";
import { RatingPromptProvider } from "./src/shared/contexts/RatingPromptContext";
import { ErrorBoundary } from "./src/shared/components";

initializeSentry();

export default function App() {
    return (
        <ErrorBoundary>
            <GestureHandlerRootView style={styles.container}>
                <SafeAreaProvider>
                    <AppProviders>
                        <RatingPromptProvider>
                            <AppNavigator />
                        </RatingPromptProvider>
                    </AppProviders>
                </SafeAreaProvider>
            </GestureHandlerRootView>
        </ErrorBoundary>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

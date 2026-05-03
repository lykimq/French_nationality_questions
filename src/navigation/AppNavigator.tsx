import { Platform, StatusBar } from "react-native";
import { NavigationContainer } from "@react-navigation/native";

import AppTabs from "./AppTabs";
import { useRatingPrompt } from "../shared/hooks";
import RatingModal from "../settings/components/RatingModal";

// Set StatusBar for Android
if (Platform.OS === "android") {
    StatusBar.setTranslucent(true);
    StatusBar.setBackgroundColor("transparent");
}

const AppNavigator = () => {
    const { shouldShowPrompt, dismissPrompt } = useRatingPrompt();

    return (
        <NavigationContainer>
            <AppTabs />
            {shouldShowPrompt && (
                <RatingModal
                    visible={shouldShowPrompt}
                    onClose={dismissPrompt}
                />
            )}
        </NavigationContainer>
    );
};

export default AppNavigator;

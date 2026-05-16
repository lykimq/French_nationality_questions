import { Platform, StatusBar } from "react-native";
import { NavigationContainer } from "@react-navigation/native";

import AppTabs from "./AppTabs";

if (Platform.OS === "android") {
    StatusBar.setTranslucent(true);
    StatusBar.setBackgroundColor("transparent");
}

const AppNavigator = () => {
    return (
        <NavigationContainer>
            <AppTabs />
        </NavigationContainer>
    );
};

export default AppNavigator;

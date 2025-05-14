// This file provides empty type declarations to silence TypeScript errors
// In a real project, you would install the actual packages instead

declare module '@react-navigation/native' {
    export interface NavigationContainerProps {
        children: React.ReactNode;
    }

    export const NavigationContainer: React.FC<NavigationContainerProps>;

    export function useNavigation<T = any>(): T;
    export function useRoute<T = any>(): T;

    export type RouteProp<T, K extends keyof T> = {
        params: T[K];
    };
}

declare module '@react-navigation/native-stack' {
    export interface NativeStackNavigationOptions {
        headerShown?: boolean;
        contentStyle?: React.CSSProperties;
    }

    export function createNativeStackNavigator(): {
        Navigator: React.ComponentType<any>;
        Screen: React.ComponentType<any>;
    };

    export type NativeStackNavigationProp<T, K extends keyof T = keyof T> = {
        navigate: <S extends keyof T>(name: S, params: T[S]) => void;
        goBack: () => void;
    };
}

declare module '@react-navigation/bottom-tabs' {
    export function createBottomTabNavigator(): {
        Navigator: React.ComponentType<any>;
        Screen: React.ComponentType<any>;
    };
}
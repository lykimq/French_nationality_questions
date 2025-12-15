// ==================== TAB NAVIGATION ====================

// Bottom Tab Navigator types - immutable route definitions
export type TabParamList = Readonly<{
    HomeTab: undefined;
    SearchTab: undefined;
    TestTab: undefined;
    SettingsTab: undefined;
}>;

// ==================== UTILITY TYPES ====================

// Extract route params from param list
export type RouteParams<
    T extends Record<string, any>,
    K extends keyof T
> = T[K];

// Navigation prop types helper
export type NavigationParams<T extends Record<string, any>> = {
    readonly [K in keyof T]: RouteParams<T, K>;
};

// Screen component props pattern
export interface ScreenProps<T extends Record<string, any>, K extends keyof T> {
    readonly route: {
        readonly params: RouteParams<T, K>;
    };
    readonly navigation: {
        readonly navigate: <U extends keyof T>(screen: U, params?: RouteParams<T, U>) => void;
        readonly goBack: () => void;
        readonly canGoBack: () => boolean;
    };
}

// ==================== TAB NAVIGATION HELPER TYPES ====================

// Tab bar icon props
export interface TabBarIconProps {
    readonly focused: boolean;
    readonly color: string;
    readonly size: number;
}

// Route type for tab navigation
export interface RouteType {
    readonly name: string;
}

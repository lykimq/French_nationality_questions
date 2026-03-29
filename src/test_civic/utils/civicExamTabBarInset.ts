import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const FLOATING_TAB_OFFSET = 12;
const FALLBACK_TAB_BAR_HEIGHT = 65;

export function useCivicExamTabBarOverlap(): number {
    const tabBarHeight = useBottomTabBarHeight();
    const h = tabBarHeight > 0 ? tabBarHeight : FALLBACK_TAB_BAR_HEIGHT;
    return h + FLOATING_TAB_OFFSET;
}

export function useCivicExamFooterBottomPad(includeHomeIndicator: boolean): number {
    const overlap = useCivicExamTabBarOverlap();
    const insets = useSafeAreaInsets();
    return overlap + (includeHomeIndicator ? insets.bottom : 0);
}

import { useIcons } from '../contexts/IconContext';
import type { IconMapping, Icon3DVariant } from '../../types';

export interface Icon3DConfig {
    name: string;
    variant: Icon3DVariant;
}

/**
 * Hook providing convenience helpers for Icon3D components.
 * 
 * This hook wraps useIcons() to provide combined helpers that return
 * complete icon configurations (name + variant) in a single call.
 * 
 * For direct access to individual icon functions (getIconName, getIconVariant, etc.),
 * use useIcons() directly from IconContext.
 * 
 * @returns Object containing getIcon and getJsonIcon helpers
 */
export const useIcon3D = () => {
    const { getIconName, getIconVariant, getJsonIconName, getJsonIconColor, getJsonIconVariant } = useIcons();

    const getIcon = (iconKey: keyof IconMapping): Icon3DConfig => {
        return {
            name: getIconName(iconKey),
            variant: getIconVariant(iconKey),
        };
    };

    const getJsonIcon = (iconKey: string) => {
        return {
            name: getJsonIconName(iconKey),
            color: getJsonIconColor(iconKey),
            variant: getJsonIconVariant(iconKey),
        };
    };

    return {
        getIcon,
        getJsonIcon,
    };
};

export default useIcon3D;


import { useIcons } from '../contexts/IconContext';
import type { IconMapping, Icon3DVariant } from '../../types';

export interface Icon3DConfig {
    name: string;
    variant: Icon3DVariant;
}

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
        getIconName,
        getIconVariant,
        getJsonIconName,
        getJsonIconColor,
        getJsonIconVariant,
    };
};

export default useIcon3D;


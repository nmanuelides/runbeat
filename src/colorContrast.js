import getContrastRatio from 'color-contrast'

export function isGoodContrast(color1, color2) { 
    return getContrastRatio(color1, color2) > 6;
}

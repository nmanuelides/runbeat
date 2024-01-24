import colorContrast from 'color-contrast'

export function isGoodContrast(color1, color2) { 
    return colorContrast(color1, color2) > 6;
}
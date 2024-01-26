import { isGoodContrast } from "../colorContrast";

const lightFontColor = "#e1fff0";
const darkFontColor = "#00291e";

export function getSecondaryColor(hsl?: string): string {
  if (!hsl) {
    return "hsl(161, 100%, 66%)";
  }

  const hslRegex = /hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/;
  const match = hsl.match(hslRegex);

  if (!match) {
    throw new Error("Invalid HSL value");
  }

  const [_, hue, saturation, lightness] = match;
  const newLightness = parseInt(lightness) >= 50 ? parseInt(lightness) - 33 : parseInt(lightness) + 33;

  return `hsl(${hue}, ${saturation}%, ${newLightness}%)`;
}

export function getContrastyColor(hslColor?: string) {
  const hexColor = hslToHex(hslColor);
  const contrastOk = isGoodContrast(hexColor, lightFontColor);
  const contrastyColor = !hslColor || contrastOk ? lightFontColor : darkFontColor;
  return contrastyColor;
}

function hslToHex(hsl?: string): string {
  if (!hsl) {
    return lightFontColor;
  }

  const hslRegex = /hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/;
  const match = hsl.match(hslRegex);
  if (!match) {
    throw new Error("Invalid HSL value");
  }

  const hue = parseInt(match[1]);
  const saturation = parseInt(match[2]);
  const lightness = parseInt(match[3]);

  const chroma = ((1 - Math.abs((2 * lightness) / 100 - 1)) * saturation) / 100;
  const huePrime = hue / 60;
  const x = chroma * (1 - Math.abs((huePrime % 2) - 1));
  let rgb: [number, number, number];

  if (huePrime >= 0 && huePrime < 1) {
    rgb = [chroma, x, 0];
  } else if (huePrime >= 1 && huePrime < 2) {
    rgb = [x, chroma, 0];
  } else if (huePrime >= 2 && huePrime < 3) {
    rgb = [0, chroma, x];
  } else if (huePrime >= 3 && huePrime < 4) {
    rgb = [0, x, chroma];
  } else if (huePrime >= 4 && huePrime < 5) {
    rgb = [x, 0, chroma];
  } else {
    rgb = [chroma, 0, x];
  }

  const lightnessAdjustment = lightness / 100 - chroma / 2;
  const [red, green, blue] = rgb.map((value) => Math.round((value + lightnessAdjustment) * 255));

  return `#${red.toString(16).padStart(2, "0")}${green.toString(16).padStart(2, "0")}${blue
    .toString(16)
    .padStart(2, "0")}`;
}

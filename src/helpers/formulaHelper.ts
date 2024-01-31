export function cmToIn(cm: number): number {
  return cm / 2.54;
}

export function kmhToMph(kmh: number): number {
  return kmh / 1.609344;
}

export function getPace(mphSpeed: number): number {
  return mphSpeed / 60;
}

export function getSPM(speed: number, height: number, speedUnit: "kmh" | "mph", heightUnit: "cm" | "in"): number {
  let convertedSpeed = speedUnit === "mph" ? speed : kmhToMph(speed);
  let convertedHeight = heightUnit === "in" ? height : cmToIn(height);
  return Math.round(1084 + (143.6 * getPace(convertedSpeed) - 13.5 * convertedHeight));
}

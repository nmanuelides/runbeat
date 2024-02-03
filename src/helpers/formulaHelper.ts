export function cmToIn(cm: number): number {
  return cm / 2.54;
}

export function kmhToMph(kmh: number): number {
  return kmh / 1.609344;
}

export function getPace(mphSpeed: number): number {
  return 60 / mphSpeed;
}

export function getSPM(speed: number, height: number, speedUnit: "kmh" | "mph", heightUnit: "cm" | "in"): number {
  let convertedSpeed = speedUnit === "mph" ? speed : kmhToMph(speed);
  let convertedHeight = heightUnit === "in" ? height : cmToIn(height);
  const pace = getPace(convertedSpeed);
  const spm = Math.round((1084 + (143.6 * pace - 13.5 * convertedHeight)) / pace);
  const adjustedSPM = Math.round(spm - spm * (3 / 100)); //spm minus 3%
  return adjustedSPM;
}

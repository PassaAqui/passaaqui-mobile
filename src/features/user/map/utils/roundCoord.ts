export function roundCoord(value: number): number {
  return Math.round(value * 1000) / 1000; // ~111m de precisão
}

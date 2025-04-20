export function randomIntBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export function rndBool(probability: number): boolean {
  return Math.random() < probability;
}

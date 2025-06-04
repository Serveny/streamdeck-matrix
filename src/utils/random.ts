export function randomInt(maxExclusive: number): number {
	return Math.trunc(Math.random() * maxExclusive);
}
export function rndBool(probability: number): boolean {
	return Math.random() < probability;
}

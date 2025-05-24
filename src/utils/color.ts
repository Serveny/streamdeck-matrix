export class RgbColor {
	constructor(
		public r: number,
		public g: number,
		public b: number,
	) {}

	public static fromHex(hex: string): RgbColor {
		hex = hex.replace(/^#/, "");
		const bigint = parseInt(hex, 16),
			r = (bigint >> 16) & 255,
			g = (bigint >> 8) & 255,
			b = bigint & 255;

		return new RgbColor(r, g, b);
	}

	public brighter(up: number): RgbColor {
		return new RgbColor(clamp(this.r + up), clamp(this.g + up), clamp(this.b + up));
	}

	public toRgbString(): string {
		return `rgb(${this.r},${this.g},${this.b})`;
	}
}

function clamp(number: number, min: number = 0, max: number = 255): number {
	return Math.max(min, Math.min(number, max));
}

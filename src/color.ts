export class RgbColor {
  constructor(public r: number, public g: number, public b: number) {}

  public toRgbString(): string {
    return `rgb(${this.r},${this.g},${this.b})`;
  }

  public brighter(up: number): RgbColor {
    return new RgbColor(
      clamp(this.r + up),
      clamp(this.g + up),
      clamp(this.b + up)
    );
  }

  public static fromHex(hex: string): RgbColor {
    hex = hex.replace(/^#/, '');
    let bigint = parseInt(hex, 16);
    let r = (bigint >> 16) & 255;
    let g = (bigint >> 8) & 255;
    let b = bigint & 255;

    return new RgbColor(r, g, b);
  }
}

function clamp(number: number, min: number = 0, max: number = 255) {
  return Math.max(min, Math.min(number, max));
}

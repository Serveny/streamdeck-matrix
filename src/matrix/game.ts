import { createColorImage } from "../image";
import { MatrixSpeed } from "./speed";
import { Tile } from "./tile";

export class MatrixGame {
	private counter = 0;

	constructor(private speed: MatrixSpeed) {}

	public reset(): void {
		if (this.counter !== 0) this.speed.setLevel(0);
		this.counter = 0;
		Tile.setActiveColor();
	}

	public up(): number {
		this.speed.setLevel(++this.counter);
		this.setComboColor();
		return this.counter;
	}

	private setComboColor(): void {
		Tile.activeImage = createColorImage(Tile.activeColor.brighter(this.counter * 2).toRgbString());
	}
}

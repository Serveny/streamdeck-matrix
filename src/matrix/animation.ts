import { ColorImage } from "../utils/image";
import { randomInt, rndBool } from "../utils/random";
import { MatrixSpeed } from "./speed";
import { Tile } from "./tile";

export class MatrixAnimation {
	private animatedCols: (MatrixColumnAnimation | null)[] = [];
	private timeout: NodeJS.Timeout | null = null;

	constructor(
		private tiles: (Tile | null)[][],
		private colsWithTiles: Set<number>,
		private resetGame: () => void,
		private speed: MatrixSpeed,
		public spawnRate: number = 1.0,
	) {}

	public addCol(): void {
		this.animatedCols.push(null);
	}

	public clearColAnimation(colI: number): void {
		if (colI < this.animatedCols.length) {
			this.animatedCols[colI]?.clear();
			this.animatedCols[colI] = null;
		}
	}

	public isTileActive(rowI: number, colI: number): boolean {
		return this.animatedCols[colI]?.isTileActive(rowI) ?? false;
	}

	public setSpawnRate(spawnRate: number = 0.8): void {
		this.spawnRate = spawnRate;
	}

	public setSpeed(speed: number = 0.7): void {
		this.stop();
		if (speed === 0) return;
		this.speed.setSpeed(speed);
		this.animateFrame();
	}

	public start(): void {
		if (this.timeout == null) this.timeout = setTimeout(() => this.animateFrame(), 600);
	}

	public stop(): void {
		if (this.timeout) {
			clearTimeout(this.timeout);
			this.timeout = null;
		}
	}

	private async animateCurrentCols(): Promise<void> {
		for (let i = 0; i < this.animatedCols.length; i++)
			if (this.animatedCols[i] != null && (await this.animatedCols[i]?.animateNext())) {
				this.animatedCols[i] = null;
				this.resetGame();
			}
	}

	private async animateFrame(): Promise<void> {
		this.chooseNextColAnimation();
		await this.animateCurrentCols();
		this.timeout = setTimeout(() => this.animateFrame(), this.speed.actualWaitTimeMs);
	}

	private chooseNextColAnimation(): void {
		if (rndBool(this.spawnRate)) {
			const colIndexes = this.getFreeColIndices();
			const rndColI = colIndexes[randomInt(colIndexes.length)];
			this.animatedCols[rndColI] ??= new MatrixColumnAnimation(this.tiles[rndColI]);
		}
	}

	private getFreeColIndices(): number[] {
		return [...this.colsWithTiles.keys()].filter((colI) => this.animatedCols[colI] == null);
	}
}

class MatrixColumnAnimation {
	private nextRowI = 0;
	constructor(private col: (Tile | null)[]) {
		col ??= [];
	}

	// Returns: isEndReached
	public async animateNext(): Promise<boolean> {
		if (this.nextRowI > 0) await this.clear();
		if (this.nextRowI < this.col.length) await this.setTileColor(this.nextRowI, Tile.activeImage);
		return !(this.nextRowI++ < this.col.length);
	}

	public async clear(): Promise<void> {
		return this.setTileColor(this.nextRowI - 1, Tile.backgroundImage);
	}

	public isTileActive(rowI: number): boolean {
		return this.nextRowI - 1 === rowI;
	}

	private async setTileColor(rowI: number, colorImage: ColorImage): Promise<void> {
		const tile = this.col[rowI];
		if (tile?.isPressed() === true) await tile.clear();
		return tile?.action.setImage(colorImage);
	}
}

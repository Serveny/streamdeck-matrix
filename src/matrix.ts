import { KeyAction } from "@elgato/streamdeck";

import { MatrixAnimation } from "./matrix/animation";
import { MatrixGame } from "./matrix/game";
import { MatrixSpeed } from "./matrix/speed";
import { Tile } from "./matrix/tile";

export class Matrix {
	public animation: MatrixAnimation;

	private colsWithTiles: Set<number> = new Set();
	private game: MatrixGame;
	private speed = new MatrixSpeed();
	// x/y or col/row
	private tiles: (Tile | null)[][] = [];

	constructor() {
		this.animation = new MatrixAnimation(this.tiles, this.colsWithTiles, () => this.game.reset(), this.speed, 0.9);
		this.game = new MatrixGame(this.speed);
	}

	public addTile(rowI: number, colI: number, action: KeyAction): void {
		const lastColI = this.tiles.length - 1;
		// Fill rows
		if (colI > lastColI)
			for (let i = lastColI; i < colI; i++) {
				this.tiles.push([]);
				this.animation.addCol();
			}
		this.colsWithTiles.add(colI);
		const col = this.tiles[colI];

		const lastRowI = col.length - 1;
		// Fill col
		if (rowI > lastRowI) for (let i = lastRowI; i < rowI; i++) col[i] ??= null;
		col[rowI] = new Tile(action);
	}

	public getTile(rowI: number, colI: number): Tile | null {
		return this.tiles[colI][rowI];
	}

	public isEmpty(): boolean {
		return !this.tiles.some((col) => col.some((item) => item != null));
	}
	public onTilePressed(rowI: number, colI: number): void {
		const tile = this.getTile(rowI, colI);
		if (tile == null) return;
		if (this.animation.isTileActive(rowI, colI)) {
			this.animation.clearColAnimation(colI);
			tile.showPressAnimation(this.game.up().toString());
		}
	}

	public removeTile(rowI: number, colI: number): void {
		this.tiles[colI][rowI] = null;
		if (!this.tiles[colI].some((col) => col != null)) {
			this.colsWithTiles.delete(colI);
			this.animation.clearColAnimation(colI);
		}
	}

	public updateSettings(settings: MatrixSettings): void {
		this.animation.setSpeed(settings.animationSpeed);
		this.animation.setSpawnRate(settings.animationSpawnRate);
		Tile.setActiveColor(settings.tileColor);
		this.speed.setComboDifficulty(settings.comboDifficulty);
	}
}

export type MatrixSettings = {
	animationSpeed?: number;
	animationSpawnRate?: number;
	tileColor?: string;
	comboDifficulty?: number;
};

import { KeyAction } from '@elgato/streamdeck';
import { Tile } from './matrix/tile';
import { MatrixGame } from './matrix/game';
import { MatrixAnimation } from './matrix/animation';

export class Matrix {
  // x/y or col/row
  private tiles: (Tile | null)[][] = [];

  private game = new MatrixGame();
  public animation = new MatrixAnimation(this.tiles, this.game, 0.9);

  addTile(rowI: number, colI: number, action: KeyAction) {
    const lastColI = this.tiles.length - 1;
    // Fill rows
    if (colI > lastColI)
      for (let i = lastColI; i < colI; i++) {
        this.tiles.push([]);
        this.animation.addCol();
      }
    const col = this.tiles[colI];

    const lastRowI = col.length - 1;
    // Fill col
    if (rowI > lastRowI) for (let i = lastRowI; i < rowI; i++) col[i] ??= null;
    col[rowI] = new Tile(action);
  }

  getTile(rowI: number, colI: number): Tile | null {
    return this.tiles[colI][rowI];
  }

  onTilePressed(rowI: number, colI: number) {
    const tile = this.getTile(rowI, colI);
    if (tile == null) return;
    if (this.animation.isTileActive(rowI, colI)) {
      this.animation.clearColAnimation(colI);
      tile.showPressAnimation(this.game.up().toString());
    }
  }

  removeTile(rowI: number, colI: number) {
    this.tiles[rowI][colI] = null;
  }

  isEmpty() {
    return !this.tiles.some((col) => col.some((item) => item != null));
  }

  updateSettings(settings: MatrixSettings) {
    this.animation.setSpeed(settings.animationSpeed);
    this.animation.setSpawnRate(settings.animationSpawnRate);
  }
}

export type MatrixSettings = {
  animationSpeed: number;
  animationSpawnRate: number;
};

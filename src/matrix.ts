import { KeyAction } from '@elgato/streamdeck';
import { randomIntBetween, rndBool } from './utils';

export class Tile {
  timeout: NodeJS.Timeout | null = null;

  constructor(public action: KeyAction) {}
}

export class Matrix {
  // x/y or col/row
  private tiles: (Tile | null)[][] = [];

  private animation = new MatrixAnimation(this.tiles, 0.9);

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

  removeTile(rowI: number, colI: number) {
    this.tiles[rowI][colI] = null;
  }

  startAnimation() {
    this.animation.start();
  }

  stopAnimation() {
    this.animation.stop();
  }

  isEmpty() {
    return !this.tiles.some((col) => col.some((item) => item != null));
  }
}

class MatrixAnimation {
  private timeout: NodeJS.Timeout | null = null;
  private animatedCols: (MatrixColumnAnimation | null)[] = [];
  constructor(private tiles: (Tile | null)[][], public spawnRate: number) {}
  addCol() {
    this.animatedCols.push(null);
  }

  start() {
    this.timeout = setTimeout(() => this.animateFrame(), 2000);
  }

  stop() {
    if (this.timeout) clearTimeout(this.timeout);
  }

  private async animateFrame() {
    this.chooseNextColAnimation();
    await this.animateCurrentCols();
    this.timeout = setTimeout(() => this.animateFrame(), 300);
  }

  private chooseNextColAnimation() {
    if (rndBool(this.spawnRate)) {
      const rndColI = randomIntBetween(0, this.tiles.length - 1);
      this.animatedCols[rndColI] ??= new MatrixColumnAnimation(
        this.tiles[rndColI]
      );
    }
  }

  private async animateCurrentCols() {
    for (let i = 0; i < this.animatedCols.length; i++)
      if (
        this.animatedCols[i] != null &&
        (await this.animatedCols[i]?.animateNext())
      )
        this.animatedCols[i] = null;
  }
}

class MatrixColumnAnimation {
  private rowI = 0;
  constructor(private col: (Tile | null)[]) {
    col ??= [];
  }

  // Returns: isEndReached
  async animateNext(): Promise<boolean> {
    if (this.rowI > 0)
      await this.col[this.rowI - 1]?.action.setImage('imgs/actions/tile/black');
    if (this.rowI < this.col.length)
      await this.col[this.rowI]?.action.setImage('imgs/actions/tile/green');
    return !(this.rowI++ < this.col.length);
  }
}

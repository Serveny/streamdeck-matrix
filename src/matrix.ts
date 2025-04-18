import { KeyAction } from '@elgato/streamdeck';
import { randomIntBetween, rndBool } from './utils';

export class Matrix {
  // x/y or col/row
  private tiles: (Tile | null)[][] = [];

  public animation = new MatrixAnimation(this.tiles, 0.9);

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

  showTileKeypressAnimation(rowI: number, colI: number) {
    const tile = this.getTile(rowI, colI);
    if (tile == null) return;
    tile.action.setImage('imgs/actions/tile/bright_green');
    if (tile.pressTimeout) clearTimeout(tile.pressTimeout);
    tile.pressTimeout = setTimeout(() => {
      tile.pressTimeout = null;
      tile.action.setImage('imgs/actions/tile/black');
    }, 300);
  }

  removeTile(rowI: number, colI: number) {
    this.tiles[rowI][colI] = null;
  }

  isEmpty() {
    return !this.tiles.some((col) => col.some((item) => item != null));
  }
}

class Tile {
  pressTimeout: NodeJS.Timeout | null = null;

  constructor(public action: KeyAction) {}
}

class MatrixAnimation {
  private waitTimeMs: number = 300;
  private timeout: NodeJS.Timeout | null = null;
  private animatedCols: (MatrixColumnAnimation | null)[] = [];
  constructor(
    private tiles: (Tile | null)[][],
    public spawnRate: number = 1.0
  ) {}
  addCol() {
    this.animatedCols.push(null);
  }

  start() {
    if (this.timeout == null)
      this.timeout = setTimeout(() => this.animateFrame(), 2000);
  }

  stop() {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
  }

  setSpawnRate(spawnRate: number = 1.0) {
    this.spawnRate = spawnRate;
  }

  setSpeed(speed: number = 0.8) {
    this.stop();
    if (speed === 0) return;
    this.waitTimeMs = Math.floor(1000 * (1.05 - speed));
    this.animateFrame();
  }

  private async animateFrame() {
    this.chooseNextColAnimation();
    await this.animateCurrentCols();
    this.timeout = setTimeout(() => this.animateFrame(), this.waitTimeMs);
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

import { KeyAction } from '@elgato/streamdeck';
import { randomIntBetween, rndBool } from './utils';

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

class Tile {
  private pressTimeout: NodeJS.Timeout | null = null;

  constructor(public action: KeyAction) {}

  showPressAnimation(text?: string) {
    this.action.setImage('imgs/actions/tile/bright_green');
    if (text) this.action.setTitle(text);
    if (this.pressTimeout) clearTimeout(this.pressTimeout);
    this.pressTimeout = setTimeout(() => this.clearPressAnimation(), 300);
  }

  private clearPressAnimation() {
    this.pressTimeout = null;
    this.action.setImage('imgs/actions/tile/black');
    this.action.setTitle();
  }
}

class MatrixAnimation {
  private waitTimeMs: number = 300;
  private timeout: NodeJS.Timeout | null = null;
  private animatedCols: (MatrixColumnAnimation | null)[] = [];
  constructor(
    private tiles: (Tile | null)[][],
    private game: MatrixGame,
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

  isTileActive(rowI: number, colI: number): boolean {
    return this.animatedCols[colI]?.isTileActive(rowI) ?? false;
  }

  clearColAnimation(colI: number) {
    if (colI < this.animatedCols.length) {
      this.animatedCols[colI]?.clear();
      this.animatedCols[colI] = null;
    }
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
      ) {
        this.animatedCols[i] = null;
        this.game.reset();
      }
  }
}

type Color = 'black' | 'green';

class MatrixColumnAnimation {
  private nextRowI = 0;
  constructor(private col: (Tile | null)[]) {
    col ??= [];
  }

  // Returns: isEndReached
  async animateNext(): Promise<boolean> {
    if (this.nextRowI > 0) await this.clear();
    if (this.nextRowI < this.col.length)
      await this.setTileColor(this.nextRowI, 'green');
    return !(this.nextRowI++ < this.col.length);
  }

  isTileActive(rowI: number): boolean {
    return this.nextRowI - 1 === rowI;
  }

  async clear(): Promise<void> {
    await this.setTileColor(this.nextRowI - 1, 'black');
  }

  private setTileColor(rowI: number, color: Color): Promise<void> | undefined {
    return this.col[rowI]?.action.setImage(`imgs/actions/tile/${color}`);
  }
}

class MatrixGame {
  private counter = 0;

  public up() {
    return ++this.counter;
  }
  public reset() {
    this.counter = 0;
  }
}

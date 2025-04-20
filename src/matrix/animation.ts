import { randomIntBetween, rndBool } from '../utils';
import { MatrixGame } from './game';
import { Tile } from './tile';

export class MatrixAnimation {
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

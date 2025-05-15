import { ColorImage } from '../image';
import { randomIntBetween, rndBool } from '../random';
import { MatrixSpeed } from './speed';
import { Tile } from './tile';

export class MatrixAnimation {
  private timeout: NodeJS.Timeout | null = null;
  private animatedCols: (MatrixColumnAnimation | null)[] = [];

  constructor(
    private tiles: (Tile | null)[][],
    private resetGame: () => void,
    private speed: MatrixSpeed,
    public spawnRate: number = 1.0
  ) {}

  addCol(): void {
    this.animatedCols.push(null);
  }

  start(): void {
    if (this.timeout == null)
      this.timeout = setTimeout(() => this.animateFrame(), 2000);
  }

  stop(): void {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
  }

  setSpawnRate(spawnRate: number = 0.8): void {
    this.spawnRate = spawnRate;
  }

  setSpeed(speed: number = 0.7): void {
    this.stop();
    if (speed === 0) return;
    this.speed.setSpeed(speed);
    this.animateFrame();
  }

  isTileActive(rowI: number, colI: number): boolean {
    return this.animatedCols[colI]?.isTileActive(rowI) ?? false;
  }

  clearColAnimation(colI: number): void {
    if (colI < this.animatedCols.length) {
      this.animatedCols[colI]?.clear();
      this.animatedCols[colI] = null;
    }
  }

  private async animateFrame(): Promise<void> {
    this.chooseNextColAnimation();
    await this.animateCurrentCols();
    this.timeout = setTimeout(
      () => this.animateFrame(),
      this.speed.actualWaitTimeMs
    );
  }

  private freeColIndexes(): number[] {
    const free = [];
    for (let i = 0; i < this.animatedCols.length; i++)
      if (this.animatedCols[i] == null) free.push(i);
    return free;
  }

  private chooseNextColAnimation() {
    if (rndBool(this.spawnRate)) {
      const colIndexes = this.freeColIndexes();
      const rndColI = colIndexes[randomIntBetween(0, colIndexes.length - 1)];
      this.animatedCols[rndColI] ??= new MatrixColumnAnimation(
        this.tiles[rndColI]
      );
    }
  }

  private async animateCurrentCols(): Promise<void> {
    for (let i = 0; i < this.animatedCols.length; i++)
      if (
        this.animatedCols[i] != null &&
        (await this.animatedCols[i]?.animateNext())
      ) {
        this.animatedCols[i] = null;
        this.resetGame();
      }
  }
}

class MatrixColumnAnimation {
  private nextRowI = 0;
  constructor(private col: (Tile | null)[]) {
    col ??= [];
  }

  // Returns: isEndReached
  async animateNext(): Promise<boolean> {
    if (this.nextRowI > 0) await this.clear();
    if (this.nextRowI < this.col.length)
      await this.setTileColor(this.nextRowI, Tile.activeImage);
    return !(this.nextRowI++ < this.col.length);
  }

  isTileActive(rowI: number): boolean {
    return this.nextRowI - 1 === rowI;
  }

  async clear(): Promise<void> {
    await this.setTileColor(this.nextRowI - 1, Tile.backgroundImage);
  }

  private setTileColor(
    rowI: number,
    colorImage: ColorImage
  ): Promise<void> | undefined {
    const tile = this.col[rowI];
    if (tile?.pressTimeout != null) clearTimeout(tile.pressTimeout);
    return tile?.action.setImage(colorImage);
  }
}

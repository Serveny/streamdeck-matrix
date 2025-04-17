import streamDeck, {
  action,
  KeyAction,
  KeyDownEvent,
  SingletonAction,
  WillAppearEvent,
  WillDisappearEvent,
} from '@elgato/streamdeck';

class Tile {
  timeout: NodeJS.Timeout | null = null;

  constructor(public action: KeyAction) {}
}

function randomIntBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function rndBool(probability: number): boolean {
  return Math.random() < probability;
}

@action({ UUID: 'dude.serveny.streamdeck-matrix.tile' })
export class MatrixTile extends SingletonAction<{}> {
  // x/y or col/row
  tiles: (Tile | null)[][] = [];
  timeout: NodeJS.Timeout;
  animatedCols: (number | null)[] = [];

  constructor() {
    super();

    // Main loop
    this.timeout = setTimeout(() => this.animationFrame(), 2000);
  }

  private async animationFrame() {
    if (rndBool(0.8)) {
      const rndColI = randomIntBetween(0, this.tiles.length);
      this.animatedCols[rndColI] ??= 0;
    }
    for (let i = 0; i < this.animatedCols.length; i++)
      if (this.animatedCols[i] != null)
        if (await this.animateTile(i)) this.animatedCols[i] = null;
    this.timeout = setTimeout(() => this.animationFrame(), 300);
  }

  // Returns: isEndReached
  private async animateTile(i: number): Promise<boolean> {
    // Workaround: Random null pointer
    if (this.tiles == null || this.animatedCols?.[i] == null) return false;

    const rowI = this.animatedCols[i]++;
    const col = this.tiles[i];

    // Workaround: Random null pointer
    if (this.tiles[i] == null) return true;

    if (rowI > 0)
      await col[rowI - 1]?.action?.setImage('imgs/actions/tile/black');
    if (rowI < col.length)
      await col[rowI]?.action?.setImage('imgs/actions/tile/green');
    return !(rowI < col.length);
  }

  override onWillAppear(ev: WillAppearEvent<{}>): void | Promise<void> {
    const { row, column } = (ev.payload as any).coordinates;
    this.addTile(row, column, ev.action as KeyAction);
    // ev.action.setTitle(`${row}, ${column}`);
  }

  override onWillDisappear(ev: WillDisappearEvent<{}>): Promise<void> | void {
    const { row, column } = (ev.payload as any).coordinates;
    this.tiles[column][row] = null;
    if (!this.tiles.some((col) => col.some((item) => item != null)))
      clearInterval(this.timeout);
  }

  private addTile(rowI: number, colI: number, action: KeyAction) {
    const lastColI = this.tiles.length - 1;
    // Fill rows
    if (colI > lastColI)
      for (let i = lastColI; i < colI; i++) {
        this.tiles.push([]);
        this.animatedCols.push(null);
      }
    const col = this.tiles[colI];

    const lastRowI = col.length - 1;
    // Fill col
    if (rowI > lastRowI) for (let i = lastRowI; i < rowI; i++) col[i] ??= null;
    col[rowI] = new Tile(action);
  }

  override async onKeyDown(ev: KeyDownEvent<{}>): Promise<void> {
    const { row, column } = (ev.payload as any).coordinates;
    const tile = this.tiles[column][row]!;
    ev.action.setImage('imgs/actions/tile/bright_green');
    if (tile.timeout) clearTimeout(tile.timeout);
    tile.timeout = setTimeout(() => {
      tile.timeout = null;
      ev.action.setImage('imgs/actions/tile/black');
    }, 300);
    // TODO
  }
}

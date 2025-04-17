import { KeyAction } from '@elgato/streamdeck';
import { MatrixTile } from './actions/tile';

export class Position {
  constructor(public x: number, public y: number) {}

  static default(): Position {
    return new Position(0, 0);
  }
}

export class Matrix {
  refeshTimeoutMs: number = 1000;

  // columns[rows]
  tiles: Set<MatrixTile & KeyAction> = new Set();
  public addTile(tile: MatrixTile) {
    this.tiles.add(tile as any);
  }

  public onTilePressed(tile: MatrixTile) {
    // TODO
    (tile as any as KeyAction).setImage('imgs/actions/tile/white');
  }

  public run(): this {
    setInterval(() => this.frame(), this.refeshTimeoutMs);
    return this;
  }

  private frame() {
    this.tiles.forEach((tile) => tile.setImage('imgs/actions/tile/green'));
  }
}

export const matrix = new Matrix();

import {
  action,
  KeyAction,
  KeyDownEvent,
  SingletonAction,
  WillAppearEvent,
  WillDisappearEvent,
} from '@elgato/streamdeck';
import { Matrix } from '../matrix';

@action({ UUID: 'dude.serveny.streamdeck-matrix.tile' })
export class MatrixTile extends SingletonAction<{}> {
  matrix = new Matrix();

  constructor() {
    super();
    this.matrix.startAnimation();
  }

  override onWillAppear(ev: WillAppearEvent<{}>): void | Promise<void> {
    const { row, column } = (ev.payload as any).coordinates;
    this.matrix.addTile(row, column, ev.action as KeyAction);
  }

  override onWillDisappear(ev: WillDisappearEvent<{}>): Promise<void> | void {
    const { row, column } = (ev.payload as any).coordinates;
    this.matrix.removeTile(row, column);
    if (!this.matrix.isEmpty()) this.matrix.stopAnimation();
  }

  override async onKeyDown(ev: KeyDownEvent<{}>): Promise<void> {
    const { row, column } = (ev.payload as any).coordinates;
    const tile = this.matrix.getTile(row, column);
    if (tile == null) return;
    ev.action.setImage('imgs/actions/tile/bright_green');
    if (tile.timeout) clearTimeout(tile.timeout);
    tile.timeout = setTimeout(() => {
      tile.timeout = null;
      ev.action.setImage('imgs/actions/tile/black');
    }, 300);
    // TODO
  }
}

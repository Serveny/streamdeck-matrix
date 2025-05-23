import streamDeck, {
  action,
  KeyAction,
  KeyDownEvent,
  SingletonAction,
  WillAppearEvent,
  WillDisappearEvent,
} from '@elgato/streamdeck';
import { Matrix, MatrixSettings } from '../matrix';
import { Tile } from '../matrix/tile';

@action({ UUID: 'dude.serveny.tile-rain-matrix.tile' })
export class MatrixTile extends SingletonAction<MatrixSettings> {
  private matrix = new Matrix();
  private settings: MatrixSettings = {};

  constructor() {
    super();
    streamDeck.settings.onDidReceiveGlobalSettings((ev) => {
      this.settings = ev.settings;
      this.matrix.updateSettings(this.settings);
    });
    streamDeck.settings.getGlobalSettings();
  }

  override onWillAppear(ev: WillAppearEvent): void | Promise<void> {
    const { row, column } = (ev.payload as any).coordinates;
    ev.action.setImage(Tile.backgroundImage);
    this.matrix.addTile(row, column, ev.action as KeyAction);
    if (this.settings.animationSpeed !== 0) this.matrix.animation.start();
  }

  override onWillDisappear(ev: WillDisappearEvent): Promise<void> | void {
    const { row, column } = (ev.payload as any).coordinates;
    this.matrix.removeTile(row, column);
    if (this.matrix.isEmpty()) this.matrix.animation.stop();
  }

  override async onKeyDown(ev: KeyDownEvent): Promise<void> {
    const { row, column } = (ev.payload as any).coordinates;
    this.matrix.onTilePressed(row, column);
  }
}

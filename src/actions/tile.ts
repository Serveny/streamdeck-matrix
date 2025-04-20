import streamDeck, {
  action,
  KeyAction,
  KeyDownEvent,
  SingletonAction,
  WillAppearEvent,
  WillDisappearEvent,
} from '@elgato/streamdeck';
import { Matrix, MatrixSettings } from '../matrix';

@action({ UUID: 'dude.serveny.streamdeck-matrix.tile' })
export class MatrixTile extends SingletonAction<MatrixSettings> {
  matrix = new Matrix();

  constructor() {
    super();
    streamDeck.settings.onDidReceiveGlobalSettings((ev) =>
      this.matrix.updateSettings(ev.settings as MatrixSettings)
    );
    streamDeck.settings.getGlobalSettings();
  }

  override onWillAppear(ev: WillAppearEvent): void | Promise<void> {
    const { row, column } = (ev.payload as any).coordinates;
    this.matrix.addTile(row, column, ev.action as KeyAction);
    this.matrix.animation.start();
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

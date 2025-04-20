import streamDeck, {
  action,
  DidReceiveSettingsEvent,
  KeyAction,
  KeyDownEvent,
  PropertyInspectorDidAppearEvent,
  SingletonAction,
  WillAppearEvent,
  WillDisappearEvent,
} from '@elgato/streamdeck';
import { Matrix, MatrixSettings } from '../matrix';

@action({ UUID: 'dude.serveny.streamdeck-matrix.tile' })
export class MatrixTile extends SingletonAction<MatrixSettings> {
  matrix = new Matrix();

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

  override async onDidReceiveSettings(
    ev: DidReceiveSettingsEvent<MatrixSettings>
  ): Promise<void> {
    streamDeck.settings.setGlobalSettings(ev.payload.settings);
    this.matrix.updateSettings(ev.payload.settings);
  }

  override async onPropertyInspectorDidAppear(
    ev: PropertyInspectorDidAppearEvent<MatrixSettings>
  ): Promise<void> {
    const settings =
      await streamDeck.settings.getGlobalSettings<MatrixSettings>();
    ev.action.setSettings(settings);
  }
}

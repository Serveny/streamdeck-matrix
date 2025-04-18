import streamDeck, {
  action,
  DidReceiveSettingsEvent,
  KeyAction,
  KeyDownEvent,
  LogLevel,
  SingletonAction,
  WillAppearEvent,
  WillDisappearEvent,
} from '@elgato/streamdeck';
import { Matrix } from '../matrix';

streamDeck.logger.setLevel(LogLevel.WARN);

type Settings = {
  animationSpeed: number;
  animationSpawnRate: number;
};

@action({ UUID: 'dude.serveny.streamdeck-matrix.tile' })
export class MatrixTile extends SingletonAction<Settings> {
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
    ev: DidReceiveSettingsEvent<Settings>
  ): Promise<void> {
    const { animationSpeed, animationSpawnRate } = ev.payload.settings;
    this.matrix.animation.setSpeed(animationSpeed);
    this.matrix.animation.setSpawnRate(animationSpawnRate);
  }
}

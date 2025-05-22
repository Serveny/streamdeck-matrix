import { KeyAction } from '@elgato/streamdeck';
import { ColorImage, createColorImage } from '../image';
import { RgbColor } from '../color';

export class Tile {
  pressTimeout: NodeJS.Timeout | null = null;

  static activeColor: RgbColor = RgbColor.fromHex('#21AE52');
  static activeImage: ColorImage = createColorImage(
    Tile.activeColor.toRgbString()
  );
  static backgroundImage: ColorImage = createColorImage('#020204');
  static pressedImage: ColorImage = createColorImage('#8DDE9C');

  constructor(public action: KeyAction) {}

  showPressAnimation(text?: string) {
    this.action.setImage(Tile.pressedImage);
    if (text) this.action.setTitle(text);
    if (this.pressTimeout) clearTimeout(this.pressTimeout);
    this.pressTimeout = setTimeout(() => this.clearPressAnimation(), 300);
  }

  private async clearPressAnimation(): Promise<void> {
    this.pressTimeout = null;
    await this.action.setImage(Tile.backgroundImage);
    return this.action.setTitle();
  }

  static setActiveColor(colorHex?: string) {
    if (colorHex) Tile.activeColor = RgbColor.fromHex(colorHex);
    Tile.activeImage = createColorImage(Tile.activeColor.toRgbString());
  }
}

import { KeyAction } from '@elgato/streamdeck';
import { ColorImage, createColorImage } from '../image';

export class Tile {
  private pressTimeout: NodeJS.Timeout | null = null;

  static activeImage: ColorImage = createColorImage('#21AE52');
  static backgroundImage: ColorImage = createColorImage('#020204');
  static pressedImage: ColorImage = createColorImage('#8DDE9C');

  constructor(public action: KeyAction) {}

  showPressAnimation(text?: string) {
    this.action.setImage(Tile.pressedImage);
    if (text) this.action.setTitle(text);
    if (this.pressTimeout) clearTimeout(this.pressTimeout);
    this.pressTimeout = setTimeout(() => this.clearPressAnimation(), 300);
  }

  private clearPressAnimation() {
    this.pressTimeout = null;
    this.action.setImage(Tile.backgroundImage);
    this.action.setTitle();
  }
}

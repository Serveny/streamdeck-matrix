import { KeyAction } from '@elgato/streamdeck';

export class Tile {
  private pressTimeout: NodeJS.Timeout | null = null;

  constructor(public action: KeyAction) {}

  showPressAnimation(text?: string) {
    this.action.setImage('imgs/actions/tile/bright_green');
    if (text) this.action.setTitle(text);
    if (this.pressTimeout) clearTimeout(this.pressTimeout);
    this.pressTimeout = setTimeout(() => this.clearPressAnimation(), 300);
  }

  private clearPressAnimation() {
    this.pressTimeout = null;
    this.action.setImage('imgs/actions/tile/black');
    this.action.setTitle();
  }
}

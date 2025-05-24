import { KeyAction } from "@elgato/streamdeck";

import { RgbColor } from "../color";
import { ColorImage, createColorImage } from "../image";

export class Tile {
	public static activeColor: RgbColor = RgbColor.fromHex("#21AE52");
	public static activeImage: ColorImage = createColorImage(Tile.activeColor.toRgbString());
	public static backgroundImage: ColorImage = createColorImage("#020204");
	public static pressedImage: ColorImage = createColorImage("#8DDE9C");

	private pressTimeout: NodeJS.Timeout | null = null;

	constructor(public action: KeyAction) {}

	public static setActiveColor(colorHex?: string): void {
		if (colorHex) Tile.activeColor = RgbColor.fromHex(colorHex);
		Tile.activeImage = createColorImage(Tile.activeColor.toRgbString());
	}

	public async clear(): Promise<void> {
		if (this.pressTimeout) clearTimeout(this.pressTimeout);
		this.pressTimeout = null;
		return this.action.setTitle();
	}

	public isPressed(): boolean {
		return this.pressTimeout != null;
	}

	public showPressAnimation(text?: string): void {
		this.action.setImage(Tile.pressedImage);
		if (text) this.action.setTitle(text);
		if (this.pressTimeout) clearTimeout(this.pressTimeout);
		this.pressTimeout = setTimeout(() => this.clearPressAnimation(), 300);
	}

	private async clearPressAnimation(): Promise<void> {
		await this.clear();
		return this.action.setImage(Tile.backgroundImage);
	}
}

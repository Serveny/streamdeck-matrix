export class MatrixSpeed {
	public actualWaitTimeMs = 300;

	private comboDifficulty = 1;
	private comboFactor = 1;
	private waitTimeMs = 300;

	public setComboDifficulty(difficulty: number = 5): void {
		this.comboDifficulty = difficulty;
	}

	public setLevel(level: number): void {
		this.comboFactor = 1 - Math.sqrt(level * this.comboDifficulty) / 50;
		this.calcActualWaitTime();
	}

	public setSpeed(speed: number): void {
		if (speed === 0) return;
		this.waitTimeMs = Math.floor(100 / speed);
		this.calcActualWaitTime();
	}

	private calcActualWaitTime(): void {
		this.actualWaitTimeMs = this.waitTimeMs * this.comboFactor;
	}
}

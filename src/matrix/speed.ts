export class MatrixSpeed {
  private comboDifficulty = 1;
  public actualWaitTimeMs = 300;

  private waitTimeMs = 300;
  private comboFactor = 1;

  public setSpeed(speed: number = 0.8): void {
    if (speed === 0) return;
    this.waitTimeMs = Math.floor(1000 * (1.05 - speed));
    this.calcActualWaitTime();
  }

  public setComboDifficulty(difficulty: number = 1): void {
    this.comboDifficulty = difficulty;
  }

  public setLevel(level: number): void {
    this.comboFactor = 1 - Math.sqrt(level * this.comboDifficulty) / 100;
    this.calcActualWaitTime();
  }

  private calcActualWaitTime(): void {
    this.actualWaitTimeMs = this.waitTimeMs * this.comboFactor;
  }
}

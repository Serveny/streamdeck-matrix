export class MatrixGame {
  private counter = 0;
  private comboDifficulty = 1;

  public up(): number {
    return ++this.counter;
  }

  public reset(): void {
    this.counter = 0;
  }

  public setDifficulty(difficulty: number = 1): void {
    this.comboDifficulty = difficulty;
  }
}

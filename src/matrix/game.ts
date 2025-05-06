import { MatrixSpeed } from './speed';

export class MatrixGame {
  private counter = 0;

  constructor(private speed: MatrixSpeed) {}

  public up(): number {
    this.speed.setLevel(++this.counter);
    return this.counter;
  }

  public reset(): void {
    if (this.counter !== 0) this.speed.setLevel(0);
    this.counter = 0;
  }
}

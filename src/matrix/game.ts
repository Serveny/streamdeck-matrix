export class MatrixGame {
  private counter = 0;

  public up() {
    return ++this.counter;
  }
  public reset() {
    this.counter = 0;
  }
}

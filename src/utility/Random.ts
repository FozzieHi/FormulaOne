export class Random {
  static nextInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min)) + min;
  }

  static arrayElement(array: Array<number>): number {
    return array[this.nextInt(0, array.length)];
  }
}

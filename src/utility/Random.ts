function nextInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min)) + min;
}

export function randomArrayElement(array: Array<number>): number | undefined {
  return array.at(nextInt(0, array.length));
}

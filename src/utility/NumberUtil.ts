export function isEven(num: number): boolean {
  return num % 2 === 0;
}

export function millisecondsToUnits(milliseconds: number) {
  return {
    seconds: milliseconds / 1000,
    minutes: milliseconds / (1000 * 60),
    hours: milliseconds / (1000 * 60 * 60),
    days: milliseconds / (1000 * 60 * 60 * 24),
  };
}

export class PopUpdate {
  $pop: object;

  constructor(property: string, value: string | number | object) {
    this.$pop = {
      [property]: value,
    };
  }
}

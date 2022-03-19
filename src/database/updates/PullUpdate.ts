export class PullUpdate {
  $pull: object;

  constructor(property: string, value: string | number | object) {
    this.$pull = {
      [property]: value,
    };
  }
}

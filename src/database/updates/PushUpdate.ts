export class PushUpdate {
  $push: object;

  constructor(property: string, value: string | number | object) {
    this.$push = {
      [property]: value,
    };
  }
}

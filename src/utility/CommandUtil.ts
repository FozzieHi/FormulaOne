import { Constants } from "./Constants.js";

export function getRuleChoices() {
  return Object.entries(Constants.RULES).map(([name, rule]) => ({
    name: `${name} - ${rule}`,
    value: name,
  }));
}

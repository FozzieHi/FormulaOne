import { ApplicationCommandOptionChoiceData } from "discord.js";
import { Constants } from "./Constants.js";

export function getRuleChoices() {
  const ruleChoices: Array<ApplicationCommandOptionChoiceData<string>> = [];
  Object.entries(Constants.RULES).forEach(([name, rule]) => {
    ruleChoices.push({
      name: `${name} - ${rule}`,
      value: name,
    });
  });
  return ruleChoices;
}

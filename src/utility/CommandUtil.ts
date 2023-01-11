import { ApplicationCommandOptionChoiceData } from "discord.js";
import { Constants } from "./Constants.js";

export function getRuleChoices() {
  const ruleChoices: Array<ApplicationCommandOptionChoiceData<number>> = [];
  Constants.RULES.forEach((rule, i) => {
    ruleChoices.push({
      name: `Rule ${i + 1} - ${rule}`,
      value: i,
    });
  });
  return ruleChoices;
}

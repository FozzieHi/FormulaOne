import { ApplicationCommandOptionChoiceData } from "discord.js";
import { Constants } from "./Constants";

export class CommandUtil {
  public static getRuleChoices() {
    const ruleChoices: Array<ApplicationCommandOptionChoiceData> = [];
    Constants.RULES.forEach((rule, i) => {
      ruleChoices.push({
        name: `Rule ${i + 1} - ${rule}`,
        value: i,
      });
    });
    return ruleChoices;
  }
}

import { ApplicationCommandOptionChoiceData } from "discord.js";
import { Constants } from "./Constants";

export class CommandUtil {
  public static getRuleChoices() {
    const ruleChoices: Array<ApplicationCommandOptionChoiceData> = [];
    Constants.RULES.forEach((rule, i) => {
      const text = `Rule ${i + 1} - ${rule}`;
      ruleChoices.push({
        name: text,
        value: text,
      });
    });
    return ruleChoices;
  }
}

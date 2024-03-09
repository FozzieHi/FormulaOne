import { ApplicationCommandOptionChoiceData } from "discord.js";
import { Constants } from "./Constants.js";

export function getRuleChoices(): Array<ApplicationCommandOptionChoiceData<string>> {
  return Object.entries(Constants.RULES).map(([name, rule]) => ({
    name: `${name} - ${rule}`,
    value: name,
  }));
}

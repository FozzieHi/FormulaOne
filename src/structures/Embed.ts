import { EmbedBuilder, APIEmbed } from "discord.js";
import { Constants } from "../utility/Constants.js";
import { randomArrayElement } from "../utility/Random.js";

export class Embed extends EmbedBuilder {
  constructor(data: APIEmbed) {
    const returnVal = data;
    returnVal.color ??= randomArrayElement(Constants.DEFAULT_COLORS);

    super(returnVal);
  }
}

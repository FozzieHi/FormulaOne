import { MessageEmbed, MessageEmbedOptions } from "discord.js";
import { Constants } from "../utility/Constants";
import { Random } from "../utility/Random";

export class Embed extends MessageEmbed {
  constructor(data: MessageEmbedOptions) {
    data.color ??= Random.arrayElement(Constants.DEFAULT_COLORS);

    super(data);
  }
}

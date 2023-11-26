import { InteractionHandler, InteractionHandlerTypes } from "@sapphire/framework";
import { ButtonInteraction, Snowflake } from "discord.js";
import { replyInteraction } from "../../utility/Sender.js";

export class IDInteraction extends InteractionHandler {
  public constructor(context: never) {
    super(context, {
      interactionHandlerType: InteractionHandlerTypes.Button,
    });
  }

  public async run(interaction: ButtonInteraction, userId: Snowflake) {
    await replyInteraction(interaction, undefined, null, { content: userId });
  }

  public parse(interaction: ButtonInteraction) {
    if (
      !interaction.customId.startsWith("userid-") &&
      !interaction.customId.startsWith("id-")
    ) {
      return this.none();
    }
    return this.some(interaction.customId.split("-").at(1));
  }
}

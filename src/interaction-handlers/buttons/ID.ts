import {
  InteractionHandler,
  InteractionHandlerTypes,
  PieceContext,
} from "@sapphire/framework";
import { ButtonInteraction, Snowflake } from "discord.js";

export class IDInteraction extends InteractionHandler {
  public constructor(context: PieceContext) {
    super(context, {
      interactionHandlerType: InteractionHandlerTypes.Button,
    });
  }

  public async run(interaction: ButtonInteraction, userId: Snowflake) {
    await interaction.reply({ content: userId, ephemeral: true });
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

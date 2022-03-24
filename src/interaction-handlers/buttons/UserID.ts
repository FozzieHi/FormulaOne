import {
  Awaitable,
  InteractionHandler,
  InteractionHandlerTypes,
  Maybe,
  PieceContext,
} from "@sapphire/framework";
import { ButtonInteraction, Snowflake } from "discord.js";

export class UserIDInteraction extends InteractionHandler {
  public constructor(context: PieceContext) {
    super(context, {
      interactionHandlerType: InteractionHandlerTypes.Button,
    });
  }

  async run(interaction: ButtonInteraction, userId: Snowflake) {
    await interaction.reply({ content: userId, ephemeral: true });
  }

  parse(interaction: ButtonInteraction): Awaitable<Maybe<unknown>> {
    if (!interaction.customId.startsWith("userid-")) {
      return this.none();
    }
    return this.some(interaction.customId.split("userid-")[1]);
  }
}

import {
  InteractionHandler,
  InteractionHandlerTypes,
  PieceContext,
} from "@sapphire/framework";
import { ButtonInteraction, GuildMember, Message, Snowflake } from "discord.js";
import { replyInteraction, replyInteractionError } from "../../utility/Sender.js";
import { Constants } from "../../utility/Constants.js";
import { isModerator } from "../../services/ModerationService.js";

export class NewsPublishInteraction extends InteractionHandler {
  public constructor(context: PieceContext) {
    super(context, {
      interactionHandlerType: InteractionHandlerTypes.Button,
    });
  }

  public async run(interaction: ButtonInteraction, posterId: Snowflake) {
    if (interaction.guild == null || interaction.member == null) {
      return;
    }

    const message = interaction.message as Message;
    const member = interaction.member as GuildMember;
    if (!(await isModerator(interaction.guild, interaction.user))) {
      if (!member.roles.cache.has(Constants.ROLES.F1)) {
        await replyInteractionError(
          interaction,
          "You must have the F1 role in order to use this command."
        );
        return;
      }

      if (interaction.user.id !== posterId) {
        await replyInteractionError(
          interaction,
          "Only the original poster can publish a message."
        );
        return;
      }
    }

    if (!message.crosspostable) {
      await replyInteractionError(
        interaction,
        "Cannot publish message, maybe it is already published?"
      );
      await message.edit({
        content: message.content,
        components: [],
      });
      return;
    }

    if (Date.now() - message.createdTimestamp > 1.728e8) {
      // 48 hours in milliseconds
      await replyInteractionError(
        interaction,
        "A message may only be published within the first 48 hours of its submission."
      );
      await message.edit({
        content: message.content,
        components: [],
      });
      return;
    }

    await message.crosspost();
    await message.edit({
      content: message.content,
      components: [],
    });
    await replyInteraction(interaction, "Successfully published message.");
  }

  public parse(interaction: ButtonInteraction) {
    if (!interaction.customId.startsWith("publish-")) {
      return this.none();
    }
    return this.some(interaction.customId.split("-").at(1));
  }
}

import {
  InteractionHandler,
  InteractionHandlerTypes,
  PieceContext,
} from "@sapphire/framework";
import { ButtonInteraction, GuildMember, Message, Snowflake } from "discord.js";
import { replyInteraction, replyInteractionError } from "../../utility/Sender";
import { ModerationService } from "../../services/ModerationService";
import { Constants } from "../../utility/Constants";

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
    if (!(await ModerationService.isModerator(interaction.guild, interaction.user))) {
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
    return this.some(interaction.customId.split("-")[1]);
  }
}

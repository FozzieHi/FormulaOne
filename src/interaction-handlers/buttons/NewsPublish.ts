import { InteractionHandler, InteractionHandlerTypes } from "@sapphire/framework";
import { ButtonInteraction } from "discord.js";
import { replyInteraction, replyInteractionError } from "../../utility/Sender.js";
import { isModerator } from "../../services/ModerationService.js";
import Try from "../../utility/Try.js";

export class NewsPublishInteraction extends InteractionHandler {
  public constructor(context: never) {
    super(context, {
      interactionHandlerType: InteractionHandlerTypes.Button,
    });
  }

  public async run(interaction: ButtonInteraction) {
    if (interaction.guild == null || interaction.member == null) {
      return;
    }

    const { message } = interaction;
    if (!(await isModerator(interaction.guild, interaction.user))) {
      await replyInteractionError(
        interaction,
        "You must be a Marshal in order to use this command.",
      );
      return;
    }

    if (!message.crosspostable) {
      await replyInteractionError(
        interaction,
        "Cannot publish message, maybe it is already published?",
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
        "A message may only be published within the first 48 hours of its submission.",
      );
      await message.edit({
        content: message.content,
        components: [],
      });
      return;
    }

    await Try(message.crosspost(), "40033");
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
    return this.some();
  }
}

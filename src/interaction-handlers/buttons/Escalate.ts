import {
  container,
  InteractionHandler,
  InteractionHandlerTypes,
  PieceContext,
} from "@sapphire/framework";
import { ButtonInteraction, Guild, TextChannel, APIEmbed } from "discord.js";
import { escalate } from "../../services/ModerationService.js";
import TryVal from "../../utility/TryVal.js";
import { Constants, ModerationQueueButtons } from "../../utility/Constants.js";
import MutexManager from "../../managers/MutexManager.js";
import { replyInteraction, replyInteractionError } from "../../utility/Sender.js";
import { archiveLog } from "../../services/BotQueueService.js";

export class Escalate extends InteractionHandler {
  public constructor(context: PieceContext) {
    super(context, {
      interactionHandlerType: InteractionHandlerTypes.Button,
    });
  }

  public async run(
    interaction: ButtonInteraction,
    parsedData: InteractionHandler.ParseResult<this>
  ) {
    await MutexManager.getUserMutex(parsedData.targetUserId).runExclusive(async () => {
      const logMessage = await TryVal(
        (interaction.channel as TextChannel).messages.fetch(interaction.message.id)
      );
      if (logMessage == null) {
        return;
      }
      const embed = interaction.message.embeds.at(0) as APIEmbed;
      if (embed == null) {
        return;
      }
      const targetUser = await TryVal(
        container.client.users.fetch(parsedData.targetUserId)
      );
      if (targetUser == null) {
        return;
      }
      const escalationSent = await escalate(
        interaction.guild as Guild,
        interaction.user,
        targetUser,
        parsedData.targetChannelId,
        parsedData.targetMessageId,
        embed,
        [
          ModerationQueueButtons.PUNISH,
          ModerationQueueButtons.BAN,
          ModerationQueueButtons.IGNORE,
        ]
      );
      if (escalationSent == null) {
        await replyInteractionError(interaction, "Error escalating log.");
        return;
      }
      const messageSent = await archiveLog(
        interaction.guild as Guild,
        interaction.channel as TextChannel,
        parsedData.targetUserId,
        interaction.user,
        logMessage,
        "Escalated"
      );
      if (messageSent) {
        await replyInteraction(interaction, "Successfully escalated log.", {
          color: Constants.UNMUTE_COLOR,
        });
      } else {
        await replyInteractionError(interaction, "Error escalating log.");
      }
    });
  }

  public parse(interaction: ButtonInteraction) {
    if (!interaction.customId.startsWith("escalate-")) {
      return this.none();
    }
    const split = interaction.customId.split("-");
    split.shift();
    const [targetUserId, targetChannelId, targetMessageId] = split;
    return this.some({ targetUserId, targetChannelId, targetMessageId });
  }
}

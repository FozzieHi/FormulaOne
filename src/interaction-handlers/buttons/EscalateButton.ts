import {
  container,
  InteractionHandler,
  InteractionHandlerTypes,
  PieceContext,
} from "@sapphire/framework";
import {
  ButtonInteraction,
  Guild,
  Message,
  MessageEmbed,
  TextChannel,
  User,
} from "discord.js";
import { escalate } from "../../services/ModerationService";
import TryVal from "../../utility/TryVal";
import { Constants, ModerationQueueButtons } from "../../utility/Constants";
import MutexManager from "../../managers/MutexManager";
import { replyInteraction, replyInteractionError } from "../../utility/Sender";
import { BotQueueService } from "../../services/BotQueueService";

export class EscalateButton extends InteractionHandler {
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
        (interaction.channel as TextChannel).messages.fetch(
          (interaction.message as Message).id
        )
      );
      const embed = interaction.message.embeds[0] as MessageEmbed;
      const targetUser = await TryVal(
        container.client.users.fetch(parsedData.targetUserId)
      );
      if (targetUser == null) {
        return;
      }
      const escalationSent = await escalate(
        interaction.guild as Guild,
        targetUser as User,
        parsedData.targetChannelId,
        parsedData.targetMessageId,
        embed,
        [
          ModerationQueueButtons.PUNISH,
          ModerationQueueButtons.BAN,
          ModerationQueueButtons.UNMUTE,
          ModerationQueueButtons.IGNORE,
        ]
      );
      if (escalationSent == null) {
        await replyInteractionError(interaction, "Error escalating log.");
        return;
      }
      const messageSent = await BotQueueService.archiveLog(
        interaction.guild as Guild,
        interaction.channel as TextChannel,
        parsedData.targetUserId,
        interaction.user,
        logMessage as Message,
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

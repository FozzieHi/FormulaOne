import { InteractionHandler, InteractionHandlerTypes } from "@sapphire/framework";
import {
  ButtonInteraction,
  Guild,
  GuildMember,
  Snowflake,
  TextChannel,
} from "discord.js";
import { Constants } from "../../utility/Constants.js";
import MutexManager from "../../managers/MutexManager.js";
import { replyInteraction, replyInteractionError } from "../../utility/Sender.js";
import TryVal from "../../utility/TryVal.js";
import { archiveLog } from "../../services/BotQueueService.js";
import { getPermLevel, isModerator } from "../../services/ModerationService.js";
import ViolationService from "../../services/ViolationService.js";

export class IgnoreInteraction extends InteractionHandler {
  public constructor(context: never) {
    super(context, {
      interactionHandlerType: InteractionHandlerTypes.Button,
    });
  }

  public async run(interaction: ButtonInteraction, userId: Snowflake) {
    if (
      interaction.guild == null ||
      interaction.member == null ||
      interaction.channel == null ||
      interaction.message == null
    ) {
      return;
    }
    if (!(await isModerator(interaction.guild, interaction.user))) {
      await replyInteractionError(
        interaction,
        "You must be a Marshal in order to use this command.",
      );
      return;
    }
    if (
      interaction.channel.id === Constants.CHANNELS.STEWARDS_QUEUE &&
      (await getPermLevel(interaction.guild, interaction.user)) < 2
    ) {
      await replyInteractionError(
        interaction,
        "You must be a Steward in order to use this command.",
      );
      return;
    }
    if (interaction.user.id === userId) {
      await replyInteractionError(
        interaction,
        "You cannot ignore a log assigned to you.",
      );
      return;
    }
    await MutexManager.getUserMutex(userId).runExclusive(async () => {
      if (ViolationService.handled.has(interaction.message.id)) {
        await replyInteractionError(interaction, "Log has already been handled.");
        return;
      }
      const logMessage = await TryVal(
        (interaction.channel as TextChannel).messages.fetch(interaction.message.id),
      );
      if (logMessage == null) {
        return;
      }
      const messageSent = await archiveLog(
        interaction.guild as Guild,
        interaction.channel as TextChannel,
        userId,
        interaction.member as GuildMember,
        logMessage,
        "Ignored",
      );
      if (messageSent) {
        await replyInteraction(interaction, "Successfully ignored log.", {
          color: Constants.UNMUTE_COLOR,
        });
        ViolationService.handled.add(interaction.message.id);
      } else {
        await replyInteractionError(interaction, "Error ignoring log.");
      }
    });
  }

  public parse(interaction: ButtonInteraction) {
    if (!interaction.customId.startsWith("ignore-")) {
      return this.none();
    }
    return this.some(interaction.customId.split("-").at(1));
  }
}

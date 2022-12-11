import {
  InteractionHandler,
  InteractionHandlerTypes,
  PieceContext,
} from "@sapphire/framework";
import { ButtonInteraction, Guild, Message, Snowflake, TextChannel } from "discord.js";
import { Constants } from "../../utility/Constants.js";
import MutexManager from "../../managers/MutexManager.js";
import { replyInteraction, replyInteractionError } from "../../utility/Sender.js";
import TryVal from "../../utility/TryVal.js";
import { archiveLog } from "../../services/BotQueueService.js";

export class IgnoreInteraction extends InteractionHandler {
  public constructor(context: PieceContext) {
    super(context, {
      interactionHandlerType: InteractionHandlerTypes.Button,
    });
  }

  public async run(interaction: ButtonInteraction, userId: Snowflake) {
    if (
      interaction.guild == null ||
      interaction.channel == null ||
      interaction.message == null
    ) {
      return;
    }
    await MutexManager.getUserMutex(userId).runExclusive(async () => {
      const logMessage = await TryVal(
        (interaction.channel as TextChannel).messages.fetch(
          (interaction.message as Message).id
        )
      );
      if (logMessage == null) {
        return;
      }
      const messageSent = await archiveLog(
        interaction.guild as Guild,
        interaction.channel as TextChannel,
        userId,
        interaction.user,
        logMessage as Message,
        "Ignored"
      );
      if (messageSent) {
        await replyInteraction(interaction, "Successfully ignored log.", {
          color: Constants.UNMUTE_COLOR,
        });
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

import {
  InteractionHandler,
  InteractionHandlerTypes,
  PieceContext,
} from "@sapphire/framework";
import { ButtonInteraction, Guild, Message, Snowflake } from "discord.js";
import { Constants } from "../../utility/Constants";
import MutexManager from "../../managers/MutexManager";
import { replyInteraction, replyInteractionError } from "../../utility/Sender";
import { BotQueueService } from "../../services/BotQueueService";

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
      const targetMessage = interaction.message as Message;
      const messageSent = await BotQueueService.archiveLog(
        interaction.guild as Guild,
        userId,
        interaction.user,
        targetMessage,
        "Ignored"
      );
      if (messageSent) {
        await replyInteraction(interaction, "Successfully ignored log.", {
          color: Constants.UNMUTE_COLOR,
        });
      } else {
        await replyInteractionError(interaction, "Error ignoring log.", {
          color: Constants.ERROR_COLOR,
        });
      }
    });
  }

  public parse(interaction: ButtonInteraction) {
    if (!interaction.customId.startsWith("ignore-")) {
      return this.none();
    }
    return this.some(interaction.customId.split("-")[1]);
  }
}

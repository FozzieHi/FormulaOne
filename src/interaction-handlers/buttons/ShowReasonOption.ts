import { InteractionHandler, InteractionHandlerTypes } from "@sapphire/framework";
import {
  ButtonInteraction,
  ComponentType,
  Guild,
  TextChannel,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import db from "../../database/index.js";
import { upperFirstChar } from "../../utility/StringUtil.js";
import Try from "../../utility/Try.js";
import { replyInteractionError } from "../../utility/Sender.js";
import { archiveLog } from "../../services/BotQueueService.js";
import MutexManager from "../../managers/MutexManager.js";
import { getPermLevel, isModerator } from "../../services/ModerationService.js";
import { Constants } from "../../utility/Constants.js";

export class ShowReasonOptionInteraction extends InteractionHandler {
  public constructor(context: never) {
    super(context, {
      interactionHandlerType: InteractionHandlerTypes.Button,
    });
  }

  public async run(
    interaction: ButtonInteraction,
    parsedData: InteractionHandler.ParseResult<this>,
  ) {
    if (interaction.guild == null || interaction.channel == null) {
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
    if (
      parsedData.action === "ban" &&
      (await Try(interaction.guild.bans.fetch(parsedData.targetUserId))) &&
      !(await db.banRepo?.anyBan(parsedData.targetUserId, interaction.guild.id))
    ) {
      await MutexManager.getUserMutex(parsedData.targetUserId).runExclusive(
        async () => {
          await archiveLog(
            interaction.guild as Guild,
            interaction.channel as TextChannel,
            parsedData.targetUserId,
            null,
            interaction.message,
            "Already banned",
          );
          await replyInteractionError(interaction, "Member is already banned.");
        },
      );
      return;
    }
    const inputs = [
      [
        new TextInputBuilder({
          customId: "reason",
          label: "Please provide a reason",
          style: TextInputStyle.Short,
          required: true,
        }),
      ],
    ];
    await interaction.showModal({
      customId: `reasonoption-${parsedData.action}-${parsedData.targetUserId}-${parsedData.channelId}`,
      title: `${upperFirstChar(parsedData.action)} Reason`,
      components: inputs.map((input) => ({
        type: ComponentType.ActionRow,
        components: input,
      })),
    });
  }

  public parse(interaction: ButtonInteraction) {
    if (!interaction.customId.startsWith("showreasonoption-")) {
      return this.none();
    }
    const split = interaction.customId.split("-");
    split.shift();
    const [action, targetUserId, channelId] = split;
    return this.some({ action, targetUserId, channelId });
  }
}

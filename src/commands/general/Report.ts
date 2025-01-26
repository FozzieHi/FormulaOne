import { ApplicationCommandRegistry, Awaitable, Command } from "@sapphire/framework";
import {
  ApplicationCommandType,
  GuildMember,
  MessageContextMenuCommandInteraction,
  Snowflake,
} from "discord.js";
import { Constants, ModerationQueueButtons } from "../../utility/Constants.js";
import { isModerator, modQueue } from "../../services/ModerationService.js";
import { replyInteraction, replyInteractionError } from "../../utility/Sender.js";
import MutexManager from "../../managers/MutexManager.js";
import ViolationService from "../../services/ViolationService.js";
import { getDisplayTag, getOverflowFields } from "../../utility/StringUtil.js";

const modReports = new Map<Snowflake, number>();

export class ReportCommand extends Command {
  public constructor(context: never) {
    super(context);
  }

  public override registerApplicationCommands(
    registry: ApplicationCommandRegistry,
  ): Awaitable<void> {
    registry.registerContextMenuCommand(
      {
        name: "Report",
        type: ApplicationCommandType.Message,
      },
      {
        guildIds: Constants.GUILD_IDS,
        idHints: ["1062507633812197386"],
      },
    );
  }

  public async contextMenuRun(interaction: MessageContextMenuCommandInteraction) {
    await MutexManager.getUserPublicMutex(
      interaction.targetMessage.author.id,
    ).runExclusive(async () => {
      if (
        interaction.guild == null ||
        interaction.member == null ||
        interaction.channel == null ||
        interaction.targetMessage == null
      ) {
        return;
      }
      if (interaction.user.id === interaction.targetMessage.author.id) {
        await replyInteractionError(interaction, "You may not report yourself.");
        return;
      }
      const targetIsModerator = await isModerator(
        interaction.guild,
        interaction.targetMessage.author,
      );
      if (targetIsModerator) {
        const currentReport = modReports.get(interaction.user.id);
        // 5 minute cooldown
        if (currentReport != null && Date.now() - currentReport < 300000) {
          await replyInteractionError(
            interaction,
            "You have already reported a moderator recently.",
          );
          return;
        }
        modReports.set(interaction.user.id, Date.now());
      }
      if (
        !ViolationService.reports.some(
          (report) =>
            report.channelId === interaction.channel?.id &&
            report.messageId === interaction.targetMessage.id,
        )
      ) {
        const fieldsAndValues = [
          "Action",
          `Report [Jump to message](${interaction.targetMessage.url})`,
          "Reporter",
          `${getDisplayTag(interaction.member as GuildMember)} (${
            interaction.user.id
          })`,
          "Channel",
          interaction.channel.toString(),
        ];
        if (interaction.targetMessage.content.length > 0) {
          fieldsAndValues.push(
            ...getOverflowFields("Content", interaction.targetMessage.content),
          );
        }
        const attachmentVals = [...interaction.targetMessage.attachments.values()];
        for (let i = 0; i < interaction.targetMessage.attachments.size; i += 1) {
          const attachment = attachmentVals.at(i);
          if (attachment != null) {
            fieldsAndValues.push(`Attachment (${i + 1})`);
            fieldsAndValues.push(`[View](${attachment.proxyURL})`);
          }
        }
        await modQueue(
          interaction.guild,
          interaction.targetMessage.author,
          interaction.channel.id,
          interaction.targetMessage.id,
          fieldsAndValues,
          Constants.MUTE_COLOR,
          [
            ...(targetIsModerator ? [] : [ModerationQueueButtons.PUNISH]),
            ModerationQueueButtons.ESCALATE,
            ModerationQueueButtons.IGNORE,
          ],
          true,
          interaction.targetMessage.createdAt,
        );
        ViolationService.reports.push({
          channelId: interaction.channel.id,
          messageId: interaction.targetMessage.id,
        });
      }
      await replyInteraction(interaction, "Successfully reported message.");
    });
  }
}

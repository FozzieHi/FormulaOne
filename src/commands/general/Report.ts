import { ApplicationCommandRegistry, Awaitable, Command } from "@sapphire/framework";
import {
  ApplicationCommandType,
  ContextMenuCommandInteraction,
  GuildMember,
  Message,
} from "discord.js";
import { Constants, ModerationQueueButtons } from "../../utility/Constants.js";
import { isModerator, modQueue } from "../../services/ModerationService.js";
import { replyInteraction, replyInteractionError } from "../../utility/Sender.js";
import MutexManager from "../../managers/MutexManager.js";
import ViolationService from "../../services/ViolationService.js";
import { getDisplayTag, maxLength } from "../../utility/StringUtil.js";

export class ReportCommand extends Command {
  public constructor(context: Command.Context) {
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

  public async contextMenuRun(interaction: ContextMenuCommandInteraction) {
    const message = interaction.options.getMessage("message") as Message;
    await MutexManager.getUserPublicMutex(message.author.id).runExclusive(async () => {
      if (
        interaction.guild == null ||
        interaction.member == null ||
        interaction.channel == null ||
        message == null
      ) {
        return;
      }
      if (interaction.user.id === message.author.id) {
        await replyInteractionError(interaction, "You may not report yourself.");
        return;
      }
      if (await isModerator(interaction.guild, message.author)) {
        await replyInteractionError(
          interaction,
          "You may not use this command on a moderator.",
        );
        return;
      }
      if (
        !ViolationService.reports.some(
          (report) =>
            report.channelId === interaction.channel?.id &&
            report.messageId === message.id,
        )
      ) {
        const fieldsAndValues = [
          "Action",
          `Report [Jump to message](${message.url})`,
          "Reporter",
          `${getDisplayTag(interaction.member as GuildMember)} (${
            interaction.user.id
          })`,
          "Channel",
          interaction.channel.toString(),
        ];
        if (message.content.length > 0) {
          fieldsAndValues.push("Content");
          fieldsAndValues.push(maxLength(message.content));
        }
        const attachmentVals = [...message.attachments.values()];
        for (let i = 0; i < message.attachments.size; i += 1) {
          const attachment = attachmentVals.at(i);
          if (attachment != null) {
            fieldsAndValues.push(`Attachment ${i + 1}`);
            fieldsAndValues.push(`[View](${attachment.proxyURL})`);
          }
        }
        await modQueue(
          interaction.guild,
          message.author,
          interaction.channel.id,
          message.id,
          fieldsAndValues,
          Constants.MUTE_COLOR,
          [
            ModerationQueueButtons.PUNISH,
            ModerationQueueButtons.ESCALATE,
            ModerationQueueButtons.IGNORE,
          ],
          true,
          message.createdAt,
        );
        ViolationService.reports.push({
          channelId: interaction.channel.id,
          messageId: message.id,
        });
      }
      await replyInteraction(interaction, "Successfully reported message.");
    });
  }
}

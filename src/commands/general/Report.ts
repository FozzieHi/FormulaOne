import { ApplicationCommandRegistry, Awaitable, Command } from "@sapphire/framework";
import { ContextMenuInteraction, Message } from "discord.js";
import { Constants, ModerationQueueButtons } from "../../utility/Constants.js";
import { ModerationService, modQueue } from "../../services/ModerationService.js";
import { replyInteraction, replyInteractionError } from "../../utility/Sender.js";
import MutexManager from "../../managers/MutexManager.js";
import ViolationService from "../../services/ViolationService.js";

export class ReportCommand extends Command {
  public constructor(context: Command.Context) {
    super(context);
  }

  public override registerApplicationCommands(
    registry: ApplicationCommandRegistry
  ): Awaitable<void> {
    registry.registerContextMenuCommand(
      {
        name: "Report",
        type: "MESSAGE",
      },
      {
        guildIds: Constants.GUILD_IDS,
        idHints: ["1031260226692857926"],
      }
    );
  }

  public async contextMenuRun(interaction: ContextMenuInteraction) {
    const message = interaction.options.getMessage("message") as Message;
    await MutexManager.getUserPublicMutex(message.author.id).runExclusive(async () => {
      if (interaction.guild == null || interaction.channel == null || message == null) {
        return;
      }
      if (interaction.user.id === message.author.id) {
        await replyInteractionError(interaction, "You may not report yourself.");
        return;
      }
      if (await ModerationService.isModerator(interaction.guild, message.author)) {
        await replyInteractionError(
          interaction,
          "You may not use this command on a moderator."
        );
        return;
      }
      if (
        !ViolationService.reports.some(
          (report) =>
            report.channelId === interaction.channel?.id &&
            report.messageId === message.id
        )
      ) {
        const fieldsAndValues = [
          "Action",
          `Report [Jump to message](${message.url})`,
          "Reporter",
          `${interaction.user.tag} (${interaction.user.id})`,
          "Channel",
          interaction.channel.toString(),
        ];
        if (message.content.length > 0) {
          fieldsAndValues.push("Content");
          fieldsAndValues.push(message.content);
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
          true
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

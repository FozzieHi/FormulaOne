import {
  ApplicationCommandRegistry,
  Awaitable,
  Command,
  CommandOptionsRunTypeEnum,
} from "@sapphire/framework";
import {
  ApplicationCommandOptionType,
  ChannelType,
  ChatInputCommandInteraction,
  GuildMember,
} from "discord.js";
import db from "../../database/index.js";
import { replyInteractionError, replyInteractionPublic } from "../../utility/Sender.js";
import { Constants } from "../../utility/Constants.js";
import { modLog } from "../../services/ModerationService.js";
import { PushUpdate } from "../../database/updates/PushUpdate.js";
import { PullUpdate } from "../../database/updates/PullUpdate.js";
import { getDBGuild } from "../../utility/DatabaseUtil.js";
import MutexManager from "../../managers/MutexManager.js";

export class FilterCommand extends Command {
  public constructor(context: Command.Context) {
    super(context, {
      requiredClientPermissions: ["ManageChannels"],
      runIn: CommandOptionsRunTypeEnum.GuildText,
      preconditions: ["Marshals"],
    });
  }

  public override registerApplicationCommands(
    registry: ApplicationCommandRegistry
  ): Awaitable<void> {
    registry.registerChatInputCommand(
      {
        name: this.name,
        description: "Change the current channel's one word filter status.",
        options: [
          {
            name: "add",
            description: "Add the filter to the current channel.",
            type: ApplicationCommandOptionType.Subcommand,
          },
          {
            name: "remove",
            description: "Remove the filter from the current channel.",
            type: ApplicationCommandOptionType.Subcommand,
          },
        ],
      },
      {
        guildIds: Constants.GUILD_IDS,
        idHints: ["977147571007012864"],
      }
    );
  }

  public async chatInputRun(interaction: ChatInputCommandInteraction) {
    const subcommand = interaction.options.getSubcommand();
    await MutexManager.getGuildMutex().runExclusive(async () => {
      if (
        interaction.guild == null ||
        interaction.member == null ||
        interaction.channel == null ||
        interaction.channel.type !== ChannelType.GuildText
      ) {
        return;
      }
      const enabledText = "One word filter is enabled | ";
      const channelDescription = interaction.channel.topic;

      const dbGuild = await getDBGuild(interaction.guild.id);
      if (subcommand === "add") {
        if (dbGuild?.enabledChannels.includes(interaction.channel.id)) {
          await replyInteractionError(
            interaction,
            `One word filter is already enabled in ${interaction.channel.toString()}`
          );
          return;
        }

        await db.guildRepo?.upsertGuild(
          interaction.guild.id,
          new PushUpdate("enabledChannels", interaction.channel.id)
        );
        await replyInteractionPublic(
          interaction,
          `Successfully enabled one word filter in ${interaction.channel.toString()}.`
        );
        await modLog(
          interaction.guild,
          interaction.member as GuildMember,
          [
            "Action",
            "Toggled One Word Filter",
            "Status",
            "Enabled",
            "Channel",
            interaction.channel.toString(),
          ],
          Constants.WARN_COLOR
        );
        if (channelDescription != null) {
          await interaction.channel.setTopic(
            channelDescription.replace(enabledText, "")
          );
        }
      } else if (subcommand === "remove") {
        if (!dbGuild?.enabledChannels.includes(interaction.channel.id)) {
          await replyInteractionError(
            interaction,
            `One word filter is already disabled in ${interaction.channel.toString()}`
          );
          return;
        }

        await db.guildRepo?.upsertGuild(
          interaction.guild.id,
          new PullUpdate("enabledChannels", interaction.channel.id)
        );
        await replyInteractionPublic(
          interaction,
          `Successfully disabled one word filter in ${interaction.channel.toString()}.`
        );
        await modLog(
          interaction.guild,
          interaction.member as GuildMember,
          [
            "Action",
            "Toggled One Word Filter",
            "Status",
            "Disabled",
            "Channel",
            interaction.channel.toString(),
          ],
          Constants.UNMUTE_COLOR
        );
        if (channelDescription != null) {
          await interaction.channel.setTopic(enabledText + channelDescription);
        }
      }
    });
  }
}

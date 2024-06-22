import {
  ApplicationCommandRegistry,
  Awaitable,
  Command,
  CommandOptionsRunTypeEnum,
} from "@sapphire/framework";
import {
  ApplicationCommandOptionType,
  ChatInputCommandInteraction,
  GuildMember,
  TextChannel,
} from "discord.js";
import { replyInteractionError, replyInteractionPublic } from "../../utility/Sender.js";
import { Constants } from "../../utility/Constants.js";
import { modLog } from "../../services/ModerationService.js";
import MutexManager from "../../managers/MutexManager.js";
import { getDisplayTag } from "../../utility/StringUtil.js";

export class SlowmodeCommand extends Command {
  public constructor(context: never) {
    super(context, {
      requiredClientPermissions: ["ManageChannels"],
      runIn: CommandOptionsRunTypeEnum.GuildAny,
      preconditions: ["Marshals"],
    });
  }

  public override registerApplicationCommands(
    registry: ApplicationCommandRegistry,
  ): Awaitable<void> {
    registry.registerChatInputCommand(
      {
        name: this.name,
        description: "Change the current channel's slowmode.",
        options: [
          {
            name: "set",
            description: "Set a new slowmode duration.",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
              {
                name: "seconds",
                description: "The new slowmode duration in seconds",
                type: ApplicationCommandOptionType.Integer,
                required: true,
                minValue: 1,
                maxValue: 21600,
              },
            ],
          },
          {
            name: "remove",
            description: "Remove the channel's slowmode.",
            type: ApplicationCommandOptionType.Subcommand,
          },
        ],
      },
      {
        guildIds: Constants.GUILD_IDS,
        idHints: ["977147567160840232"],
      },
    );
  }

  public async chatInputRun(interaction: ChatInputCommandInteraction) {
    const subcommand = interaction.options.getSubcommand();
    await MutexManager.getGuildMutex().runExclusive(async () => {
      if (
        interaction.guild == null ||
        interaction.channel == null ||
        interaction.member == null
      ) {
        return;
      }
      if (subcommand === "set") {
        const seconds = interaction.options.getInteger("seconds");
        if (seconds == null || seconds < 1 || seconds > 21600) {
          return;
        }

        await (interaction.channel as TextChannel).setRateLimitPerUser(
          seconds,
          `Slowmode enabled by ${getDisplayTag(interaction.member as GuildMember)}`,
        );
        await replyInteractionPublic(
          interaction,
          `Successfully enabled slowmode in ${interaction.channel.toString()} for ${seconds} seconds.`,
        );
        await modLog(
          interaction.guild,
          interaction.member as GuildMember,
          [
            "Action",
            "Changed Slowmode",
            "Status",
            "Enabled",
            "Duration",
            `${seconds} seconds`,
            "Channel",
            interaction.channel.toString(),
          ],
          Constants.WARN_COLOR,
        );
      } else if (subcommand === "remove") {
        if ((interaction.channel as TextChannel).rateLimitPerUser === 0) {
          await replyInteractionError(
            interaction,
            `Slowmode is already disabled for ${interaction.channel.toString()}`,
          );
          return;
        }

        await (interaction.channel as TextChannel).setRateLimitPerUser(
          0,
          `Slowmode disabled by ${getDisplayTag(interaction.member as GuildMember)}`,
        );
        await replyInteractionPublic(
          interaction,
          `Successfully disabled slowmode in ${interaction.channel.toString()}.`,
        );
        await modLog(
          interaction.guild,
          interaction.member as GuildMember,
          [
            "Action",
            "Changed Slowmode",
            "Status",
            "Disabled",
            "Channel",
            interaction.channel.toString(),
          ],
          Constants.UNMUTE_COLOR,
        );
      }
    });
  }
}

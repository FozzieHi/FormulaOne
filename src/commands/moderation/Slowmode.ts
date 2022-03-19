import {
  ApplicationCommandRegistry,
  Awaitable,
  Command,
  CommandOptionsRunTypeEnum,
} from "@sapphire/framework";
import { CommandInteraction, TextChannel } from "discord.js";
import { replyInteractionPublic } from "../../utility/Sender";
import { Constants } from "../../utility/Constants";
import { modLog } from "../../services/ModerationService";

export class SlowmodeCommand extends Command {
  public constructor(context: Command.Context) {
    super(context, {
      requiredClientPermissions: ["MANAGE_CHANNELS"],
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
        description: "Change the current channel's slowmode.",
        options: [
          {
            name: "set",
            description: "Set a new slowmode duration.",
            type: "SUB_COMMAND",
            options: [
              {
                name: "seconds",
                description: "The new slowmode duration in seconds",
                type: "INTEGER",
                required: true,
                minValue: 1,
                maxValue: 21600,
              },
            ],
          },
          {
            name: "remove",
            description: "Remove the channel's slowmode.",
            type: "SUB_COMMAND",
          },
        ],
        defaultPermission: false,
      },
      {
        guildIds: Constants.GUILD_IDS,
        idHints: ["954020435652128848"],
      }
    );
  }

  public async chatInputRun(interaction: CommandInteraction) {
    if (interaction.guild == null || interaction.channel == null) {
      return;
    }
    const subcommand = interaction.options.getSubcommand();
    if (subcommand === "set") {
      const seconds = interaction.options.getInteger("seconds");
      if (seconds == null || seconds < 1 || seconds > 21600) {
        return;
      }
      await (interaction.channel as TextChannel).setRateLimitPerUser(
        seconds,
        `Slowmode enabled by ${interaction.user.tag}`
      );
      await replyInteractionPublic(
        interaction,
        `Successfully enabled slowmode in ${interaction.channel.toString()} for ${seconds} seconds.`
      );
      await modLog(interaction.guild, interaction.user, [
        "Action",
        "Changed Slowmode",
        "Status",
        "Enabled",
        "Duration",
        `${seconds} seconds`,
      ]);
    } else if (subcommand === "remove") {
      await (interaction.channel as TextChannel).setRateLimitPerUser(
        0,
        `Slowmode disabled by ${interaction.user.tag}`
      );
      await replyInteractionPublic(
        interaction,
        `Successfully disabled slowmode in ${interaction.channel.toString()}.`
      );
      await modLog(interaction.guild, interaction.user, [
        "Action",
        "Changed Slowmode",
        "Status",
        "Disabled",
      ]);
    }
  }
}

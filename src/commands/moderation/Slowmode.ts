import {
  ApplicationCommandRegistry,
  Awaitable,
  Command,
  CommandOptionsRunTypeEnum,
} from "@sapphire/framework";
import { CommandInteraction, TextChannel } from "discord.js";
import { replyInteractionPublic } from "../../utility/Sender";
import { Constants } from "../../utility/Constants";

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
            name: "seconds",
            description: "The new slowmode duration in seconds",
            type: "NUMBER",
            required: true,
            minValue: 0,
            maxValue: 21600,
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
    const seconds = interaction.options.getNumber("seconds");
    if (
      seconds == null ||
      interaction.channel == null ||
      seconds < 0 ||
      seconds > 21600
    ) {
      return;
    }
    await (interaction.channel as TextChannel).setRateLimitPerUser(
      seconds,
      `Slowmode ${seconds > 0 ? "enabled" : "disabled"} by ${interaction.user.tag}`
    );
    if (seconds === 0) {
      return replyInteractionPublic(
        interaction,
        `Successfully disabled slowmode in ${interaction.channel.toString()}.`
      );
    }
    return replyInteractionPublic(
      interaction,
      `Successfully enabled slowmode in ${interaction.channel.toString()} for ${seconds} seconds.`
    );
  }
}

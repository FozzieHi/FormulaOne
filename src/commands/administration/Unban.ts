import {
  ApplicationCommandRegistry,
  Awaitable,
  Command,
  CommandOptionsRunTypeEnum,
} from "@sapphire/framework";
import { CommandInteraction } from "discord.js";
import { dm, replyInteractionPublic } from "../../utility/Sender";
import { Constants } from "../../utility/Constants";
import { modLog } from "../../services/ModerationService";
import { StringUtil } from "../../utility/StringUtil";

export class UnbanCommand extends Command {
  public constructor(context: Command.Context) {
    super(context, {
      requiredClientPermissions: ["BAN_MEMBERS"],
      runIn: CommandOptionsRunTypeEnum.GuildText,
      preconditions: ["Stewards", "BannedUser"],
    });
  }

  public override registerApplicationCommands(
    registry: ApplicationCommandRegistry
  ): Awaitable<void> {
    registry.registerChatInputCommand(
      {
        name: this.name,
        description: "Unban a user.",
        options: [
          {
            name: "user",
            description: "The user to unban",
            type: "USER",
            required: true,
          },
          {
            name: "reason",
            description: "The reason for the unban",
            type: "STRING",
            required: true,
          },
        ],
        defaultPermission: false,
      },
      {
        guildIds: Constants.GUILD_IDS,
        idHints: ["955230109890146404"],
      }
    );
  }

  public async chatInputRun(interaction: CommandInteraction) {
    const user = interaction.options.getUser("user");
    const reason = interaction.options.getString("reason");
    if (
      user == null ||
      reason == null ||
      interaction.channel == null ||
      interaction.guild == null
    ) {
      return;
    }

    await dm(
      user,
      `A moderator has unbanned you for the reason: ${reason}.`,
      undefined,
      false
    );
    await interaction.guild.members.unban(user, `(${interaction.user.tag}) ${reason}`);
    await replyInteractionPublic(
      interaction,
      `Successfully unbanned ${StringUtil.boldify(user.tag)}.`
    );
    await modLog(
      interaction.guild,
      interaction.user,
      [
        "Action",
        "Unban",
        "User",
        `${user.tag.toString()} (${user.id})`,
        "Reason",
        reason,
        "Channel",
        interaction.channel.toString(),
      ],
      Constants.UNBAN_COLOR,
      user
    );
  }
}

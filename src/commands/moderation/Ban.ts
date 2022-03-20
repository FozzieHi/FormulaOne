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

export class BanCommand extends Command {
  public constructor(context: Command.Context) {
    super(context, {
      requiredClientPermissions: ["BAN_MEMBERS"],
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
        description: "Ban a user indefinitely.",
        options: [
          {
            name: "user",
            description: "The user to ban",
            type: "USER",
            required: true,
          },
          {
            name: "reason",
            description: "The reason for the ban",
            type: "STRING",
            required: true,
          },
        ],
        defaultPermission: false,
      },
      {
        guildIds: Constants.GUILD_IDS,
        idHints: ["955204850902265986"],
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
    if (interaction.guild.members.cache.has(user.id)) {
      await dm(
        interaction.user,
        `A moderator has banned you for the reason: ${reason}.`
      );
    }
    await interaction.guild.members.ban(user, {
      reason: `(${interaction.user.tag}) ${reason}`,
    });
    await replyInteractionPublic(
      interaction,
      `Successfully banned ${StringUtil.boldify(user.tag)}.`
    );
    await modLog(
      interaction.guild,
      interaction.user,
      [
        "Action",
        "Ban",
        "User",
        `${user.tag.toString()} (${user.id})`,
        "Reason",
        reason,
        "Channel",
        interaction.channel.toString(),
      ],
      user
    );
  }
}

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
  GuildTextBasedChannel,
} from "discord.js";
import {
  dm,
  replyInteractionError,
  replyInteractionPublic,
} from "../../utility/Sender.js";
import { Constants } from "../../utility/Constants.js";
import { modLog } from "../../services/ModerationService.js";
import MutexManager from "../../managers/MutexManager.js";
import { ban } from "../../utility/BanUtil.js";
import { boldify, getDisplayTag, getUserTag } from "../../utility/StringUtil.js";

export class BanCommand extends Command {
  public constructor(context: Command.Context) {
    super(context, {
      requiredClientPermissions: ["BanMembers"],
      runIn: CommandOptionsRunTypeEnum.GuildAny,
      preconditions: ["Stewards", "BannedUser", "NoModerator"],
    });
  }

  public override registerApplicationCommands(
    registry: ApplicationCommandRegistry,
  ): Awaitable<void> {
    registry.registerChatInputCommand(
      {
        name: this.name,
        description: "Change a user's ban status.",
        options: [
          {
            name: "add",
            description: "Ban a user",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
              {
                name: "user",
                description: "The user to ban",
                type: ApplicationCommandOptionType.User,
                required: true,
              },
              {
                name: "reason",
                description: "The reason for the ban",
                type: ApplicationCommandOptionType.String,
                required: true,
              },
            ],
          },
          {
            name: "remove",
            description: "Unban a user",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
              {
                name: "user",
                description: "The user to unban",
                type: ApplicationCommandOptionType.User,
                required: true,
              },
              {
                name: "reason",
                description: "The reason for the unban",
                type: ApplicationCommandOptionType.String,
                required: true,
              },
            ],
          },
        ],
      },
      {
        guildIds: Constants.GUILD_IDS,
        idHints: ["977147741937500260"],
      },
    );
  }

  public async chatInputRun(interaction: ChatInputCommandInteraction) {
    const subcommand = interaction.options.getSubcommand();
    const targetUser = interaction.options.getUser("user");
    if (targetUser == null) {
      return;
    }
    await MutexManager.getUserMutex(targetUser.id).runExclusive(async () => {
      if (
        interaction.channel == null ||
        interaction.guild == null ||
        interaction.member == null
      ) {
        return;
      }
      const reason = interaction.options.getString("reason");
      if (reason == null) {
        return;
      }
      if (subcommand === "add") {
        const result = await ban(
          interaction.guild,
          targetUser,
          interaction.member as GuildMember,
          reason,
          interaction.channel as GuildTextBasedChannel,
        );
        if (!result) {
          await replyInteractionError(interaction, "Error banning user.");
          return;
        }
        await replyInteractionPublic(
          interaction,
          `Successfully banned ${boldify(getUserTag(targetUser))}.`,
        );
      } else if (subcommand === "remove") {
        await dm(
          targetUser,
          `A moderator has unbanned you for the reason: ${reason}.`,
          undefined,
          false,
        );
        await interaction.guild.members.unban(
          targetUser,
          `(${getDisplayTag(interaction.member as GuildMember)}) ${reason}`,
        );
        await replyInteractionPublic(
          interaction,
          `Successfully unbanned ${boldify(getUserTag(targetUser))}.`,
        );
        await modLog(
          interaction.guild,
          interaction.member as GuildMember,
          [
            "Action",
            "Unban",
            "User",
            `${getUserTag(targetUser)} (${targetUser.id})`,
            "Reason",
            reason,
            "Channel",
            interaction.channel.toString(),
          ],
          Constants.UNBAN_COLOR,
          targetUser,
        );
      }
    });
  }
}

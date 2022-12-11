import {
  ApplicationCommandRegistry,
  Awaitable,
  Command,
  CommandOptionsRunTypeEnum,
} from "@sapphire/framework";
import { CommandInteraction, GuildTextBasedChannel } from "discord.js";
import {
  dm,
  replyInteractionError,
  replyInteractionPublic,
} from "../../utility/Sender.js";
import { Constants } from "../../utility/Constants.js";
import { modLog } from "../../services/ModerationService.js";
import { getRuleChoices } from "../../utility/CommandUtil.js";
import MutexManager from "../../managers/MutexManager.js";
import { ban } from "../../utility/BanUtil.js";
import { boldify } from "../../utility/StringUtil.js";

export class BanCommand extends Command {
  public constructor(context: Command.Context) {
    super(context, {
      requiredClientPermissions: ["BAN_MEMBERS"],
      runIn: CommandOptionsRunTypeEnum.GuildText,
      preconditions: ["Stewards", "BannedUser", "NoModerator"],
    });
  }

  public override registerApplicationCommands(
    registry: ApplicationCommandRegistry
  ): Awaitable<void> {
    registry.registerChatInputCommand(
      {
        name: this.name,
        description: "Change a user's ban status.",
        options: [
          {
            name: "add",
            description: "Ban a user",
            type: "SUB_COMMAND",
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
                type: "NUMBER",
                choices: getRuleChoices(),
                required: true,
              },
            ],
          },
          {
            name: "remove",
            description: "Unban a user",
            type: "SUB_COMMAND",
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
          },
        ],
      },
      {
        guildIds: Constants.GUILD_IDS,
        idHints: ["977147741937500260"],
      }
    );
  }

  public async chatInputRun(interaction: CommandInteraction) {
    const subcommand = interaction.options.getSubcommand();
    const targetUser = interaction.options.getUser("user");
    if (targetUser == null) {
      return;
    }
    await MutexManager.getUserMutex(targetUser.id).runExclusive(async () => {
      if (interaction.channel == null || interaction.guild == null) {
        return;
      }
      let reason;
      if (subcommand === "add") {
        const ruleNumber = interaction.options.getNumber("reason");
        if (ruleNumber == null) {
          return;
        }
        reason = `Rule ${ruleNumber + 1} - ${Constants.RULES[ruleNumber]}`;

        const result = await ban(
          interaction.guild,
          targetUser,
          interaction.user,
          reason,
          interaction.channel as GuildTextBasedChannel
        );
        if (!result) {
          await replyInteractionError(interaction, "Error banning user.");
          return;
        }
        await replyInteractionPublic(
          interaction,
          `Successfully banned ${boldify(targetUser.tag)}.`
        );
      } else if (subcommand === "remove") {
        reason = interaction.options.getString("reason");
        if (reason == null) {
          return;
        }
        await dm(
          targetUser,
          `A moderator has unbanned you for the reason: ${reason}.`,
          undefined,
          false
        );
        await interaction.guild.members.unban(
          targetUser,
          `(${interaction.user.tag}) ${reason}`
        );
        await replyInteractionPublic(
          interaction,
          `Successfully unbanned ${boldify(targetUser.tag)}.`
        );
        await modLog(
          interaction.guild,
          interaction.user,
          [
            "Action",
            "Unban",
            "User",
            `${targetUser.tag.toString()} (${targetUser.id})`,
            "Reason",
            reason,
            "Channel",
            interaction.channel.toString(),
          ],
          Constants.UNBAN_COLOR,
          targetUser
        );
      }
    });
  }
}

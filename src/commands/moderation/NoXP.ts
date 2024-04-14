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
} from "discord.js";
import { Constants } from "../../utility/Constants.js";
import { getRuleChoices } from "../../utility/CommandUtil.js";
import { modLog } from "../../services/ModerationService.js";
import {
  dm,
  replyInteractionError,
  replyInteractionPublic,
} from "../../utility/Sender.js";
import MutexManager from "../../managers/MutexManager.js";
import { boldify, getDisplayTag } from "../../utility/StringUtil.js";
import TryVal from "../../utility/TryVal.js";

export class NoXP extends Command {
  public constructor(context: Command.Context) {
    super(context, {
      runIn: CommandOptionsRunTypeEnum.GuildAny,
      preconditions: ["Marshals", "MemberValidation", "NoModerator"],
    });
  }

  public override registerApplicationCommands(
    registry: ApplicationCommandRegistry,
  ): Awaitable<void> {
    registry.registerChatInputCommand(
      {
        name: this.name,
        description: "Change a member's NoXP status.",
        options: [
          {
            name: "add",
            description: "Add the NoXP role to a member",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
              {
                name: "member",
                description: "The member to banish",
                type: ApplicationCommandOptionType.User,
                required: true,
              },
              {
                name: "reason",
                description: "The reason for the banish",
                type: ApplicationCommandOptionType.String,
                choices: getRuleChoices(),
                required: true,
              },
            ],
          },
          {
            name: "remove",
            description: "Remove the NoXP role from a member",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
              {
                name: "member",
                description: "The member to unbanish",
                type: ApplicationCommandOptionType.User,
                required: true,
              },
              {
                name: "reason",
                description: "The reason for the unbanish",
                type: ApplicationCommandOptionType.String,
                required: true,
              },
            ],
          },
        ],
      },
      {
        guildIds: Constants.GUILD_IDS,
        idHints: ["987430208762159134"],
      },
    );
  }

  public async chatInputRun(interaction: ChatInputCommandInteraction) {
    const subcommand = interaction.options.getSubcommand();
    const targetMember = interaction.options.getMember("member") as GuildMember;
    if (targetMember == null) {
      return;
    }
    await MutexManager.getUserMutex(targetMember.id).runExclusive(async () => {
      let reason;
      if (
        interaction.guild == null ||
        interaction.channel == null ||
        interaction.member == null
      ) {
        return;
      }
      const role = await TryVal(interaction.guild.roles.fetch(Constants.ROLES.NOXP));
      if (role == null) {
        return;
      }
      if (subcommand === "add") {
        const rule = interaction.options.getString("reason");
        if (rule == null) {
          return;
        }
        reason = `${rule} - ${Constants.RULES[rule]}`;

        if (targetMember.roles.cache.has(Constants.ROLES.NOXP)) {
          await replyInteractionError(
            interaction,
            `${boldify(getDisplayTag(targetMember))} already has the NoXP role.`,
          );
          return;
        }

        await targetMember.roles.add(
          role,
          `(${getDisplayTag(interaction.member as GuildMember)}) ${reason}`,
        );
        await dm(
          targetMember.user,
          "A moderator has given you the NoXP role. You are now unable to gain XP.",
          interaction.channel,
        );
        await replyInteractionPublic(
          interaction,
          `Successfully added NoXP to ${boldify(getDisplayTag(targetMember))}.`,
        );
        await modLog(
          interaction.guild,
          interaction.member as GuildMember,
          [
            "Action",
            "Added NoXP",
            "Member",
            `${getDisplayTag(targetMember)} (${targetMember.id})`,
            "Reason",
            reason,
            "Channel",
            interaction.channel.toString(),
          ],
          Constants.BANISH_COLOR,
          targetMember.user,
        );
      } else if (subcommand === "remove") {
        reason = interaction.options.getString("reason");
        if (reason == null) {
          return;
        }

        if (!targetMember.roles.cache.has(Constants.ROLES.NOXP)) {
          await replyInteractionError(
            interaction,
            `${boldify(getDisplayTag(targetMember))} does not have the NoXP role.`,
          );
          return;
        }

        await targetMember.roles.remove(
          role,
          `(${getDisplayTag(interaction.member as GuildMember)}) ${reason}`,
        );
        await dm(
          targetMember.user,
          "A moderator has removed the NoXP role from you. You are now able to gain XP.",
          interaction.channel,
        );
        await replyInteractionPublic(
          interaction,
          `Successfully removed NoXP from ${boldify(getDisplayTag(targetMember))}.`,
        );
        await modLog(
          interaction.guild,
          interaction.member as GuildMember,
          [
            "Action",
            "Removed NoXP",
            "Member",
            `${getDisplayTag(targetMember)} (${targetMember.id})`,
            "Reason",
            reason,
            "Channel",
            interaction.channel.toString(),
          ],
          Constants.UNMUTE_COLOR,
          targetMember.user,
        );
      }
    });
  }
}

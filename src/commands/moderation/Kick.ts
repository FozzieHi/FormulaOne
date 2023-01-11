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
import db from "../../database/index.js";
import { dm, replyInteractionPublic } from "../../utility/Sender.js";
import { Constants } from "../../utility/Constants.js";
import { modLog } from "../../services/ModerationService.js";
import { PushUpdate } from "../../database/updates/PushUpdate.js";
import MutexManager from "../../managers/MutexManager.js";
import { boldify } from "../../utility/StringUtil.js";

export class KickCommand extends Command {
  public constructor(context: Command.Context) {
    super(context, {
      requiredClientPermissions: ["KickMembers"],
      runIn: CommandOptionsRunTypeEnum.GuildText,
      preconditions: ["Marshals", "MemberValidation", "NoModerator"],
    });
  }

  public override registerApplicationCommands(
    registry: ApplicationCommandRegistry
  ): Awaitable<void> {
    registry.registerChatInputCommand(
      {
        name: this.name,
        description: "Kick a member from the server.",
        options: [
          {
            name: "member",
            description: "The member to kick",
            type: ApplicationCommandOptionType.User,
            required: true,
          },
          {
            name: "reason",
            description: "The reason for the kick",
            type: ApplicationCommandOptionType.String,
            required: true,
          },
        ],
      },
      {
        guildIds: Constants.GUILD_IDS,
        idHints: ["977147569648074772"],
      }
    );
  }

  public async chatInputRun(interaction: ChatInputCommandInteraction) {
    const targetMember = interaction.options.getMember("member") as GuildMember;
    const reason = interaction.options.getString("reason");
    if (targetMember == null) {
      return;
    }
    await MutexManager.getUserMutex(targetMember.id).runExclusive(async () => {
      if (reason == null || interaction.channel == null || interaction.guild == null) {
        return;
      }

      await dm(
        targetMember.user,
        `A moderator has kicked you for the reason: ${reason}.`,
        interaction.channel
      );
      await targetMember.kick(`(${interaction.user.tag}) ${reason}`);
      await replyInteractionPublic(
        interaction,
        `Successfully kicked ${boldify(targetMember.user.tag)}.`
      );
      await db.userRepo?.upsertUser(targetMember.id, interaction.guild.id, {
        $inc: { kicks: 1 },
      });
      await db.userRepo?.upsertUser(
        targetMember.id,
        interaction.guild.id,
        new PushUpdate("punishments", {
          date: Date.now(),
          escalation: "Kick",
          reason,
          mod: interaction.user.tag,
          channelId: interaction.channel.id,
        })
      );
      await modLog(
        interaction.guild,
        interaction.user,
        [
          "Action",
          "Kick",
          "Member",
          `${targetMember.user.tag.toString()} (${targetMember.id})`,
          "Reason",
          reason,
          "Channel",
          interaction.channel.toString(),
        ],
        Constants.KICK_COLOR,
        targetMember.user
      );
    });
  }
}

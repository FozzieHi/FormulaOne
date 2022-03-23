import {
  ApplicationCommandRegistry,
  Awaitable,
  Command,
  CommandOptionsRunTypeEnum,
} from "@sapphire/framework";
import { CommandInteraction } from "discord.js";
import db from "../../database";
import {
  dm,
  replyInteractionError,
  replyInteractionPublic,
} from "../../utility/Sender";
import { Constants } from "../../utility/Constants";
import { ModerationService, modLog } from "../../services/ModerationService";
import { StringUtil } from "../../utility/StringUtil";
import { PushUpdate } from "../../database/updates/PushUpdate";

export class BanCommand extends Command {
  public constructor(context: Command.Context) {
    super(context, {
      requiredClientPermissions: ["BAN_MEMBERS"],
      runIn: CommandOptionsRunTypeEnum.GuildText,
      preconditions: ["Stewards"],
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
    if (await ModerationService.isModerator(interaction.guild, user)) {
      await replyInteractionError(
        interaction,
        "You may not use this command on a moderator."
      );
      return;
    }
    await dm(
      user,
      `A moderator has banned you for the reason: ${reason}.`,
      interaction.channel,
      interaction.guild.members.cache.has(user.id)
    );
    await interaction.guild.members.ban(user, {
      reason: `(${interaction.user.tag}) ${reason}`,
    });
    await replyInteractionPublic(
      interaction,
      `Successfully banned ${StringUtil.boldify(user.tag)}.`
    );
    await db.userRepo?.upsertUser(user.id, interaction.guild.id, { $inc: { bans: 1 } });
    await db.userRepo?.upsertUser(
      user.id,
      interaction.guild.id,
      new PushUpdate("punishments", {
        date: Date.now(),
        escalation: "Ban",
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
        "Ban",
        "User",
        `${user.tag.toString()} (${user.id})`,
        "Reason",
        reason,
        "Channel",
        interaction.channel.toString(),
      ],
      Constants.BAN_COLOR,
      user
    );
  }
}

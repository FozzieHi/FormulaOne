import {
  ApplicationCommandRegistry,
  Awaitable,
  Command,
  CommandOptionsRunTypeEnum,
} from "@sapphire/framework";
import {
  GuildMember,
  ButtonBuilder,
  ApplicationCommandOptionType,
  ButtonStyle,
  ComponentType,
  ChatInputCommandInteraction,
} from "discord.js";
import { replyInteractionPublicFields } from "../../utility/Sender.js";
import { Constants } from "../../utility/Constants.js";
import { getDBUser } from "../../utility/DatabaseUtil.js";
import db from "../../database/index.js";
import TryVal from "../../utility/TryVal.js";
import { getDisplayTag, getUserTag } from "../../utility/StringUtil.js";

export class UserInfoCommand extends Command {
  public constructor(context: never) {
    super(context, {
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
        description: "View a user's information.",
        options: [
          {
            name: "user",
            description: "The user to lookup",
            type: ApplicationCommandOptionType.User,
            required: true,
          },
        ],
      },
      {
        guildIds: Constants.GUILD_IDS,
        idHints: ["989262356037136404"],
      },
    );
  }

  public async chatInputRun(interaction: ChatInputCommandInteraction) {
    const user = interaction.options.getUser("user");
    if (user == null || interaction.channel == null || interaction.guild == null) {
      return;
    }

    const dbUser = await getDBUser(user.id, interaction.guild.id);
    if (dbUser == null) {
      return;
    }

    const buttons = [
      [
        new ButtonBuilder()
          .setCustomId(`id-${user.id}`)
          .setLabel("User ID")
          .setStyle(ButtonStyle.Secondary),
      ],
    ];
    const dateOptions: Intl.DateTimeFormatOptions = {
      day: "numeric",
      month: "long",
      year: "numeric",
    };
    const member = (await TryVal(
      interaction.guild.members.fetch(user.id),
    )) as GuildMember;
    if (member == null) {
      await replyInteractionPublicFields(
        interaction,
        [
          "Created",
          user.createdAt.toLocaleDateString("en-US", dateOptions),
          "Active/Total Punishment Count",
          `${dbUser.currentPunishment.toString()}/${dbUser.punishments.length.toString()}`,
          "Currently Muted",
          (await db.muteRepo?.anyMute(user.id, interaction.guild.id)) ? "Yes" : "No",
        ],
        {
          author: { name: getUserTag(user), icon_url: user.displayAvatarURL() },
          footer: { text: `User ID: ${user.id}` },
        },
        {
          components: buttons.map((b) => ({
            type: ComponentType.ActionRow,
            components: b,
          })),
        },
      );
    } else {
      const roles = member.roles.cache.map((role) => role.toString());
      roles.pop();
      await replyInteractionPublicFields(
        interaction,
        [
          "Created",
          user.createdAt.toLocaleDateString("en-US", dateOptions),
          "Last Joined",
          (member.joinedAt as Date).toLocaleDateString("en-US", dateOptions),
          `Roles (${roles.length})`,
          roles.length > 0 ? roles.join(" ") : "None",
          "Active/Total Punishment Count",
          `${dbUser.currentPunishment.toString()}/${dbUser.punishments.length.toString()}`,
          "Currently Muted",
          (await db.muteRepo?.anyMute(user.id, interaction.guild.id)) ||
          member.roles.cache.has(Constants.ROLES.MUTED) ||
          (member.communicationDisabledUntilTimestamp != null &&
            member.communicationDisabledUntilTimestamp > Date.now())
            ? "Yes"
            : "No",
          "Level/XP",
          `Level: ${dbUser.level}\nExp: ${dbUser.experience}`,
        ],
        {
          author: { name: getDisplayTag(member), icon_url: user.displayAvatarURL() },
          footer: { text: `User ID: ${user.id}` },
        },
        {
          components: buttons.map((b) => ({
            type: ComponentType.ActionRow,
            components: b,
          })),
        },
      );
    }
  }
}
